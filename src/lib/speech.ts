import { Platform } from 'react-native';

// Web Speech API wrapper — free, built into the browser, zero API keys.
// Native (iOS/Android) builds will need expo-speech / a native STT module
// later; this module reports `unsupported` rather than throwing so the UI
// can degrade gracefully instead of assuming speech always works.

export function isTtsSupported(): boolean {
  return Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSttSupported(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const w = window as any;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export interface SpeakOptions {
  rate?: number; // 0.1 - 10, 1 = normal
  pitch?: number; // 0 - 2
  voiceName?: string;
}

export function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  if (!isTtsSupported()) return Promise.resolve();
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;
    utterance.lang = 'en-US';
    if (options.voiceName) {
      const voice = window.speechSynthesis.getVoices().find((v) => v.name === options.voiceName);
      if (voice) utterance.voice = voice;
    }
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (isTtsSupported()) window.speechSynthesis.cancel();
}

export function availableEnglishVoices(): SpeechSynthesisVoice[] {
  if (!isTtsSupported()) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
}

export interface ListenResult {
  transcript: string;
  confidence: number;
}

let activeRecognition: any = null;

export function startListening(): Promise<ListenResult> {
  if (!isSttSupported()) return Promise.resolve({ transcript: '', confidence: 0 });
  const w = window as any;
  const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;

  return new Promise((resolve) => {
    const recognition = new Recognition();
    activeRecognition = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const result = event.results[0][0];
      resolve({ transcript: result.transcript, confidence: result.confidence ?? 0 });
    };
    recognition.onerror = () => resolve({ transcript: '', confidence: 0 });
    recognition.onend = () => {
      activeRecognition = null;
    };
    recognition.start();
  });
}

export function stopListening(): void {
  activeRecognition?.stop();
}
