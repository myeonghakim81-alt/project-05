import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { Platform } from 'react-native';

import { isGoogleTtsConfigured, synthesizeSpeech } from '@/lib/googleTts';

// Free, on-device speech for every platform:
// - TTS: expo-speech (native OS voices on iOS/Android, Web Speech API on web)
// - STT: expo-speech-recognition (SFSpeechRecognizer/SpeechRecognizer on
//   native, Web Speech API on web) — no API keys, nothing sent to a server
//   we run. Native builds additionally need the "expo-speech-recognition"
//   config plugin (see app.json) and a custom dev client / EAS build, since
//   it isn't available in Expo Go.

export function isTtsSupported(): boolean {
  // expo-speech works on every platform expo-router/RN targets; the one gap
  // is a browser with no SpeechSynthesis at all, which speak() already no-ops on.
  return true;
}

export function isSttSupported(): boolean {
  try {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
}

export type VoiceGender = 'male' | 'female';

// Alternates by level so a learner hears both genders as they progress
// through the curriculum (spec doesn't distinguish voices by content, but a
// single fixed voice for the whole app is also an arbitrary choice — this
// one is at least deterministic and evenly split, 5 levels each).
export function voiceGenderForLevel(level: number): VoiceGender {
  return level % 2 === 0 ? 'male' : 'female';
}

export interface SpeakOptions {
  rate?: number; // 0.1 - 2, 1 = normal (expo-speech scale)
  pitch?: number; // 0 - 2
  voiceIdentifier?: string;
  gender?: VoiceGender;
}

// Voice quality is entirely up to the OS/browser — there is no API key that
// changes it (Gemini in particular is a text model; it has no bearing on
// speech quality at all). What we *can* do for free is stop taking whatever
// voice the platform defaults to and instead pick the most natural-sounding
// one already installed: browsers like Edge and Chrome ship high-quality
// network voices (Azure/Google neural voices) alongside a robotic local
// fallback, and iOS/macOS distinguish "Enhanced" voices the same way — the
// default is often the worst-sounding option, not the best.
const VOICE_NAME_PREFERENCE = [
  'natural',
  'neural',
  'enhanced',
  'premium',
  'google us english',
  'google uk english',
  'samantha',
  'ava',
  'zoe',
  'aria',
  'jenny',
  'guy',
];

// expo-speech/Web Speech voices don't expose a gender field on any
// platform, so this is a name-based heuristic (same idea browsers/OSes use
// internally) — good enough to bias voice selection, not a hard guarantee
// every installed voice list will contain a match for both genders.
const FEMALE_VOICE_HINTS = [
  'female',
  'samantha',
  'victoria',
  'karen',
  'moira',
  'tessa',
  'fiona',
  'susan',
  'zira',
  'aria',
  'jenny',
  'ava',
  'zoe',
  'salli',
  'joanna',
  'kimberly',
  'kendra',
  'ivy',
  'serena',
  'allison',
];
const MALE_VOICE_HINTS = [
  'male',
  'daniel',
  'alex',
  'fred',
  'guy',
  'ryan',
  'eric',
  'mark',
  'matthew',
  'justin',
  'brian',
  'david',
  'george',
  'oliver',
  'aaron',
  'tom',
];

function guessVoiceGender(name: string): VoiceGender | null {
  const lower = name.toLowerCase();
  if (FEMALE_VOICE_HINTS.some((h) => lower.includes(h))) return 'female';
  if (MALE_VOICE_HINTS.some((h) => lower.includes(h))) return 'male';
  return null;
}

function voiceScore(voice: Speech.Voice | Speech.WebVoice, preferredGender?: VoiceGender): number {
  const name = voice.name.toLowerCase();
  const nameRank = VOICE_NAME_PREFERENCE.findIndex((n) => name.includes(n));
  let score = nameRank === -1 ? 100 : nameRank;
  if (voice.quality === 'Enhanced') score -= 50;
  if ('localService' in voice && voice.localService === false) score -= 20; // network voice, usually higher quality
  if (preferredGender && guessVoiceGender(voice.name) === preferredGender) score -= 1000; // outranks everything else when available
  return score;
}

const bestVoiceCache = new Map<string, Promise<Speech.Voice | null>>();

async function pickBestVoice(preferredGender?: VoiceGender): Promise<Speech.Voice | null> {
  const cacheKey = preferredGender ?? 'any';
  if (!bestVoiceCache.has(cacheKey)) {
    bestVoiceCache.set(
      cacheKey,
      (async () => {
        const voices = await Speech.getAvailableVoicesAsync().catch(() => []);
        const english = voices.filter((v) => v.language.toLowerCase().startsWith('en'));
        if (english.length === 0) return null;
        return [...english].sort((a, b) => voiceScore(a, preferredGender) - voiceScore(b, preferredGender))[0];
      })(),
    );
  }
  return bestVoiceCache.get(cacheKey)!;
}

// Currently playing Google TTS clip, if any — tracked so stopSpeaking() and
// a fresh speak() call can stop it (there's no global "speechSynthesis" to
// reach for once audio comes from a plain <audio> element).
let currentGoogleAudio: HTMLAudioElement | null = null;

function speakWithGoogleTts(text: string, rate: number, gender?: VoiceGender): Promise<void> {
  return new Promise((resolve, reject) => {
    synthesizeSpeech(text, rate, gender)
      .then((base64) => {
        currentGoogleAudio?.pause();
        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        currentGoogleAudio = audio;
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('Google TTS audio playback failed'));
        audio.play().catch(reject);
      })
      .catch(reject);
  });
}

function speakWithDeviceVoice(text: string, options: SpeakOptions): Promise<void> {
  return new Promise(async (resolve) => {
    const voice = options.voiceIdentifier ?? (await pickBestVoice(options.gender).catch(() => null))?.identifier;
    Speech.stop();
    Speech.speak(text, {
      language: 'en-US',
      // Slightly under "normal" reads more naturally for most TTS voices and
      // helps comprehension for a learner — but rate/pitch are single flat
      // numbers for the whole sentence; the Web Speech API has no way to
      // express human-like rising/falling intonation. That gap is closed by
      // Google Cloud TTS above when it's configured — this remains the
      // always-available free fallback.
      rate: options.rate ?? 0.95,
      pitch: options.pitch ?? 1,
      voice,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
}

export function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  // Google Cloud TTS (when configured) gives genuinely natural intonation,
  // unlike the flat rate/pitch-only Web Speech API. Native audio playback
  // for it isn't wired up yet, so it's web-only for now; every other case —
  // not configured, native platform, or the request itself failing (bad
  // key, quota, offline) — falls back to the on-device voice so speech
  // never just stops working.
  if (isGoogleTtsConfigured && Platform.OS === 'web') {
    return speakWithGoogleTts(text, options.rate ?? 0.95, options.gender).catch(() => speakWithDeviceVoice(text, options));
  }
  return speakWithDeviceVoice(text, options);
}

export function stopSpeaking(): void {
  Speech.stop();
  currentGoogleAudio?.pause();
}

export async function availableEnglishVoices(): Promise<Speech.Voice[]> {
  const voices = await Speech.getAvailableVoicesAsync();
  return voices.filter((v) => v.language.startsWith('en'));
}

export interface ListenResult {
  transcript: string;
  confidence: number;
}

// One-shot listen: requests permission, starts recognition, resolves with
// the first final transcript (or a timeout fallback), then tears down its
// listeners. Mirrors the old Promise-based shape the lesson screens expect.
export function startListening(timeoutMs = 12000): Promise<ListenResult> {
  if (!isSttSupported()) return Promise.resolve({ transcript: '', confidence: 0 });

  return new Promise(async (resolve) => {
    let settled = false;
    const finish = (result: ListenResult) => {
      if (settled) return;
      settled = true;
      resultSub.remove();
      errorSub.remove();
      endSub.remove();
      clearTimeout(timer);
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        // already stopped
      }
      resolve(result);
    };

    const resultSub = ExpoSpeechRecognitionModule.addListener('result', (event) => {
      const best = event.results[0];
      if (best && event.isFinal !== false) {
        finish({ transcript: best.transcript, confidence: best.confidence ?? 0 });
      }
    });
    const errorSub = ExpoSpeechRecognitionModule.addListener('error', () => finish({ transcript: '', confidence: 0 }));
    const endSub = ExpoSpeechRecognitionModule.addListener('end', () => finish({ transcript: '', confidence: 0 }));
    const timer = setTimeout(() => finish({ transcript: '', confidence: 0 }), timeoutMs);

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      finish({ transcript: '', confidence: 0 });
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: false,
      maxAlternatives: 1,
      continuous: false,
    });
  });
}

export function stopListening(): void {
  try {
    ExpoSpeechRecognitionModule.stop();
  } catch {
    // not currently listening
  }
}
