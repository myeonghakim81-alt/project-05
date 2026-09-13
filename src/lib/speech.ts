import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

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

export interface SpeakOptions {
  rate?: number; // 0.1 - 2, 1 = normal (expo-speech scale)
  pitch?: number; // 0 - 2
  voiceIdentifier?: string;
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

function voiceScore(voice: Speech.Voice | Speech.WebVoice): number {
  const name = voice.name.toLowerCase();
  const nameRank = VOICE_NAME_PREFERENCE.findIndex((n) => name.includes(n));
  let score = nameRank === -1 ? 100 : nameRank;
  if (voice.quality === 'Enhanced') score -= 50;
  if ('localService' in voice && voice.localService === false) score -= 20; // network voice, usually higher quality
  return score;
}

let cachedBestVoice: Promise<Speech.Voice | null> | null = null;

async function pickBestVoice(): Promise<Speech.Voice | null> {
  if (!cachedBestVoice) {
    cachedBestVoice = (async () => {
      const voices = await Speech.getAvailableVoicesAsync().catch(() => []);
      const english = voices.filter((v) => v.language.toLowerCase().startsWith('en'));
      if (english.length === 0) return null;
      return [...english].sort((a, b) => voiceScore(a) - voiceScore(b))[0];
    })();
  }
  return cachedBestVoice;
}

export function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  return new Promise(async (resolve) => {
    const voice = options.voiceIdentifier ?? (await pickBestVoice().catch(() => null))?.identifier;
    Speech.stop();
    Speech.speak(text, {
      language: 'en-US',
      // Slightly under "normal" reads more naturally for most TTS voices and
      // helps comprehension for a learner — but rate/pitch are single flat
      // numbers for the whole sentence; the Web Speech API has no way to
      // express human-like rising/falling intonation. That gap can only be
      // closed by swapping in an actual neural TTS engine, not by tuning
      // these two numbers further.
      rate: options.rate ?? 0.95,
      pitch: options.pitch ?? 1,
      voice,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
}

export function stopSpeaking(): void {
  Speech.stop();
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
