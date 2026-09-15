// Optional live AI conversation via Google's Gemini API (free tier available
// at https://aistudio.google.com/apikey — see docs/gemini.md).
//
// Everything here is additive: when no key is configured, lesson.tsx never
// calls into this module and the app behaves exactly as it did with the
// scripted dialogues in src/content/dialogues.ts. Every call below is meant
// to be wrapped in try/catch by its caller and fall back to that scripted
// behavior on any failure (missing/invalid key, rate limit, offline, bad
// JSON) — a free public API should never be a hard dependency.

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-3.6-flash';

export const isGeminiConfigured = Boolean(API_KEY);

const REQUEST_TIMEOUT_MS = 15000;

async function callGemini(prompt: string): Promise<string> {
  if (!API_KEY) throw new Error('Gemini API key is not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 300 },
        }),
        signal: controller.signal,
      },
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Gemini request failed (${response.status}): ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  if (!text.trim()) throw new Error('Gemini returned an empty response');
  return text.trim();
}

export interface ConversationTurn {
  speaker: 'ai' | 'learner';
  text: string;
}

// Generates the AI's next line in an ongoing roleplay. Deliberately never
// instructs the model to force the learner into using specific words (spec
// 10) — it only knows the situation and, for its own reference, which words
// would fit naturally here.
export async function generateAiTurn(
  situation: string,
  targetWords: string[],
  history: ConversationTurn[],
  isFinalTurn: boolean,
): Promise<string> {
  const historyText = history.length
    ? history.map((h) => `${h.speaker === 'ai' ? 'You' : 'Learner'}: ${h.text}`).join('\n')
    : '(the conversation is just starting)';

  const prompt = `You are roleplaying with an English learner in this situation: ${situation}
Words the learner has recently studied and might naturally use here (do NOT mention this list or force them in): ${targetWords.join(', ')}.

Conversation so far:
${historyText}

Write ONLY your next line as "You" in the roleplay — one or two short, natural sentences, no labels, no quotes, no stage directions.${
    isFinalTurn ? ' This should naturally wrap up and close the conversation.' : ''
  }`;

  return callGemini(prompt);
}

export interface GeminiWordUsage {
  word: string;
  used: boolean;
}

export interface GeminiConversationAnalysis {
  wordUsage: GeminiWordUsage[];
  fluency: number;
  grammar: number;
  naturalness: number;
  appropriateness: number;
  feedback: string;
}

// Richer, LLM-judged version of src/lib/conversationAnalysis.ts's keyword
// scan — used only when Gemini is configured; the plain heuristic remains
// the default and the fallback on any failure here.
export async function analyzeConversationWithGemini(
  history: ConversationTurn[],
  targetWords: string[],
): Promise<GeminiConversationAnalysis> {
  const transcriptText = history.map((h) => `${h.speaker === 'ai' ? 'AI' : 'Learner'}: ${h.text}`).join('\n');

  const prompt = `You are evaluating an English learner's side of this roleplay conversation.

Transcript:
${transcriptText}

Target words the learner has been studying: ${targetWords.join(', ')}.

Respond with ONLY a single JSON object (no markdown fences, no extra text) shaped exactly like this:
{
  "wordUsage": [{"word": "example", "used": true}],
  "fluency": 0,
  "grammar": 0,
  "naturalness": 0,
  "appropriateness": 0,
  "feedback": "one short encouraging sentence in Korean about what to try next"
}
List every target word in "wordUsage" with whether the learner naturally used it (in any form). Score fluency/grammar/naturalness/appropriateness for the learner's turns only, 0-100.`;

  const raw = await callGemini(prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini analysis response did not contain JSON');
  return JSON.parse(jsonMatch[0]) as GeminiConversationAnalysis;
}
