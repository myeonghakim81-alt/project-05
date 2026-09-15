// Supabase Edge Function — proxies Gemini calls so the API key stays on the
// server and never ships in the client bundle.
//
// The client (src/lib/gemini.ts) sends { prompt: string } and gets back
// { text: string } — it never sees the real Gemini API key. The key lives
// only in this function's environment, set via:
//   Project Settings -> Edge Functions -> Secrets -> add GEMINI_API_KEY
//
// Deploy from the Supabase Dashboard: Edge Functions -> Create a new
// function -> name it "gemini-proxy" -> paste this file's contents -> Deploy.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.6-flash';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!GEMINI_API_KEY) {
    return jsonResponse({ error: 'GEMINI_API_KEY secret is not set on this function' }, 500);
  }

  let prompt: unknown;
  try {
    ({ prompt } = await req.json());
  } catch {
    return jsonResponse({ error: 'Request body must be JSON with a "prompt" field' }, 400);
  }

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return jsonResponse({ error: '"prompt" must be a non-empty string' }, 400);
  }

  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 300, thinkingConfig: { thinkingBudget: 0 } },
        }),
      },
    );
  } catch (err) {
    return jsonResponse({ error: `Could not reach Gemini: ${String(err)}` }, 502);
  }

  if (!geminiResponse.ok) {
    const detail = await geminiResponse.text().catch(() => '');
    return jsonResponse({ error: `Gemini request failed (${geminiResponse.status})`, detail: detail.slice(0, 300) }, 502);
  }

  const data = await geminiResponse.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';

  if (!text.trim()) {
    return jsonResponse({ error: 'Gemini returned an empty response' }, 502);
  }

  return jsonResponse({ text: text.trim() });
});
