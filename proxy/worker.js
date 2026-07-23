/**
 * PACE study serverless proxy — Cloudflare Worker.
 *
 * The ONLY place the Anthropic API key exists (as a Worker secret).
 * The frontend never calls api.anthropic.com directly (DESIGN_SPEC.md §1, §7).
 *
 * Enforces:
 *  - study passcode (secret STUDY_PASSCODE; sent by frontend as x-study-passcode)
 *  - basic per-IP rate limiting (in-memory; adequate for an N=20 study)
 *  - server-side model pinning (client cannot choose the model)
 *
 * Secrets (set via `wrangler secret put`, never in code or wrangler.toml):
 *   ANTHROPIC_API_KEY
 *   STUDY_PASSCODE
 * Vars (wrangler.toml): ALLOWED_ORIGIN (use the deployed site origin in prod)
 */

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS_CAP = 2000;

// naive per-IP sliding window: 30 requests / minute.
// In-memory, so it resets when the isolate recycles — acceptable as the
// "basic rate limiting" the spec asks for, given the passcode is the real gate.
const RATE_LIMIT = { windowMs: 60_000, max: 30 };
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < RATE_LIMIT.windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > RATE_LIMIT.max;
}

// ALLOWED_ORIGIN: "*" or a comma-separated allowlist
// (e.g. "https://user.github.io,http://localhost:8080").
function corsHeaders(env, request) {
  const conf = env.ALLOWED_ORIGIN || '*';
  let allow = conf;
  if (conf !== '*') {
    const origin = request.headers.get('Origin') || '';
    const list = conf.split(',').map(s => s.trim());
    allow = list.includes(origin) ? origin : list[0];
  }
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-study-passcode',
  };
}

function json(body, status, env, request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env, request) },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }
    if (request.method !== 'POST') {
      return json({ error: 'POST only' }, 405, env, request);
    }

    const passcode = request.headers.get('x-study-passcode') || '';
    if (!env.STUDY_PASSCODE || passcode !== env.STUDY_PASSCODE) {
      return json({ error: 'Invalid or missing study passcode' }, 401, env, request);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (rateLimited(ip)) {
      return json({ error: 'Rate limit exceeded — wait a minute and retry' }, 429, env, request);
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Invalid JSON body' }, 400, env, request); }

    const { system, messages, max_tokens } = body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: 'messages[] required' }, 400, env, request);
    }

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: Math.min(max_tokens || 800, MAX_TOKENS_CAP),
        ...(system ? { system } : {}),
        messages,
      }),
    });

    const data = await upstream.json();
    return json(data, upstream.status, env, request);
  },
};
