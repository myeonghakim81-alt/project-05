// Google Cloud Text-to-Speech — genuinely natural (Neural2) voices, separate
// from Gemini (a text model with no bearing on speech quality) and separate
// from the free-but-unofficial "reuse Edge's voices" route we ruled out.
// Free tier: ~1M characters/month for Neural2/WaveNet voices, permanently
// free within quota — but unlike the Gemini Developer API key, this needs a
// full Google Cloud project with billing enabled before the API can be
// turned on. See docs/google-tts.md.

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_TTS_API_KEY;
const VOICE_NAME = process.env.EXPO_PUBLIC_GOOGLE_TTS_VOICE ?? 'en-US-Neural2-C';

export const isGoogleTtsConfigured = Boolean(API_KEY);

const REQUEST_TIMEOUT_MS = 10000;

// Returns base64-encoded MP3 audio content. Throws on any failure (bad key,
// quota exceeded, offline, timeout) — callers fall back to the on-device
// voice rather than treating this as a hard dependency.
export async function synthesizeSpeech(text: string, rate = 0.95): Promise<string> {
  if (!API_KEY) throw new Error('Google Cloud TTS API key is not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'en-US', name: VOICE_NAME },
        audioConfig: { audioEncoding: 'MP3', speakingRate: rate },
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Google TTS request failed (${response.status}): ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  if (!data.audioContent) throw new Error('Google TTS returned no audio content');
  return data.audioContent as string;
}
