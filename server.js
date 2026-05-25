#!/usr/bin/env node
'use strict';

// Anthropic-compatible proxy untuk GrowthCircle.
// Claude Desktop/Code -> proxy ini -> https://ai.growthcircle.id/anthropic
//
// Fitur:
//  - Teruskan request Messages API (termasuk streaming SSE).
//  - Inject header x-api-key GrowthCircle.
//  - Remap nama model claude-* -> model GrowthCircle default.

const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = parseInt(process.env.PORT || '8787', 10);
const HOST = process.env.HOST || '127.0.0.1';

// API key GrowthCircle default (fallback). Kosong = wajib dikirim client.
// Bisa diisi lewat env GC_API_KEY kalau mau ada default.
const GC_API_KEY = process.env.GC_API_KEY || '';

// Upstream Anthropic-compatible GrowthCircle.
const UPSTREAM = process.env.GC_BASE_URL || 'https://ai.growthcircle.id/anthropic';

// Model GrowthCircle default untuk semua request claude-*.
const DEFAULT_MODEL = process.env.GC_MODEL || 'gpt-5.4-free';

// Model teks/chat yang dipublikasikan ke client lewat /v1/models.
// Hanya model yang bisa dipakai lewat Messages API (chat) yang dimasukkan;
// model image/video/audio pakai endpoint lain, jadi tidak ditampilkan di picker.
// Daftar lengkap semua model GrowthCircle ada di MODELS.md.
const ADVERTISED_MODELS = [
  // OpenAI
  'gpt-5.4', 'gpt-5.4-free',
  'gpt-5.5', 'gpt-5.5-free',
  'gpt-5.4-mini', 'gpt-5.4-mini-free',
  'gpt-5.3-codex', 'gpt-5.3-codex-free',
  'gpt-5.3-codex-spark', 'gpt-5.3-codex-spark-free',
  // Anthropic
  'claude-opus-4-7',
  'claude-opus-4-6',
  'claude-opus-4-6-thinking',
  'claude-opus-4-5-20251101',
  'claude-opus-4-5-20251101-thinking',
  'claude-sonnet-4-6',
  'claude-sonnet-4-6-thinking',
  'claude-sonnet-4-5-20250929',
  'claude-sonnet-4-5-20250929-thinking',
  'claude-haiku-4-5-20251001',
  'claude-haiku-4-5-20251001-thinking',
  'claude-3-5-haiku-latest',
  // Google Gemini
  'gemini-3.1-pro-preview', 'gemini-3.1-pro-preview-thinking',
  'gemini-3-pro-preview', 'gemini-3-pro-preview-thinking',
  'gemini-3-flash-preview', 'gemini-3-flash-preview-thinking', 'gemini-3-flash-preview-nothinking',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-pro', 'gemini-2.5-pro-thinking', 'gemini-2.5-pro-nothinking',
  'gemini-2.5-flash', 'gemini-2.5-flash-thinking', 'gemini-2.5-flash-nothinking',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  // MiniMax
  'MiniMax-M2.7', 'MiniMax-M2.7-free',
  'MiniMax-M2.7-highspeed', 'MiniMax-M2.7-highspeed-free',
  'minimax-m2.1', 'minimax-m2.5',
  // DeepSeek
  'deepseek-r1-0528', 'deepseek-r1-250528',
  'deepseek-v3-0324', 'deepseek-v3.1-terminus',
  'deepseek-v3.2', 'deepseek-v3.2-exp',
  'deepseek-v4-flash', 'deepseek-v4-pro',
  // Zhipu GLM
  'glm-4.6', 'glm-4.7', 'glm-5', 'glm-5.1',
  // Moonshot Kimi
  'kimi-k2-instruct', 'kimi-k2-thinking', 'kimi-k2.5',
];

function remapModel(model) {
  if (typeof model !== 'string' || model.length === 0) return DEFAULT_MODEL;
  // Nama model Claude (dikirim Claude Desktop/Code) selalu diarahkan ke model GC.
  if (model.startsWith('claude')) return DEFAULT_MODEL;
  return model; // model GC eksplisit diteruskan apa adanya.
}

function rewriteBody(raw) {
  if (!raw || raw.length === 0) return raw;
  let parsed;
  try {
    parsed = JSON.parse(raw.toString('utf8'));
  } catch {
    return raw; // bukan JSON, teruskan mentah.
  }
  if (parsed && typeof parsed === 'object' && 'model' in parsed) {
    parsed.model = remapModel(parsed.model);
  }
  return Buffer.from(JSON.stringify(parsed), 'utf8');
}

const upstreamUrl = new URL(UPSTREAM);

// Ambil API key dari prefix path, lalu strip dari URL.
// Mendukung base URL seperti http://127.0.0.1:8787/key=KEY atau /k/KEY.
// Setelah client menambah /v1/messages, path jadi /key=KEY/v1/messages.
function extractKeyFromUrl(url) {
  let m = url.match(/^\/key=([^/?]+)(.*)$/);
  if (m) return { key: decodeURIComponent(m[1]), rest: m[2] || '/' };
  m = url.match(/^\/k\/([^/?]+)(.*)$/);
  if (m) return { key: decodeURIComponent(m[1]), rest: m[2] || '/' };
  return { key: null, rest: url };
}

const server = http.createServer((req, res) => {
  // Key dari path (opsional) -> dipakai per-request, override default.
  const { key: pathKey, rest } = extractKeyFromUrl(req.url);
  req.url = rest; // sisa path tanpa prefix key.

  // Kalau client pakai base URL berakhiran /v1, path jadi dobel (/v1/v1/...).
  // Normalkan jadi satu /v1.
  req.url = req.url.replace(/^\/v1\/v1\//, '/v1/');

  // Key yang dikirim client (field API key di Claude Desktop dll).
  // Anthropic format pakai header x-api-key; sebagian tool pakai Authorization: Bearer.
  const authHeader = req.headers['authorization'] || '';
  const bearer = authHeader.replace(/^Bearer\s+/i, '').trim();
  const clientKey = req.headers['x-api-key'] || bearer || '';

  // Prioritas: key di path > key dari client > default/env.
  const apiKey = pathKey || clientKey || GC_API_KEY;

  // Health check sederhana.
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, upstream: UPSTREAM, model: DEFAULT_MODEL }));
    return;
  }

  // /v1/models: GrowthCircle tidak punya route ini, tapi client (Claude Desktop dll)
  // sering pakai untuk validasi koneksi. Balas daftar sintetis biar tes lolos.
  const path = req.url.split('?')[0];
  if (req.method === 'GET' && (path === '/v1/models' || path.startsWith('/v1/models/'))) {
    const now = Math.floor(Date.now() / 1000);
    const mk = (id) => ({ type: 'model', id, display_name: id, created_at: now });
    if (path.startsWith('/v1/models/')) {
      const id = decodeURIComponent(path.slice('/v1/models/'.length));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mk(id || DEFAULT_MODEL)));
      return;
    }
    const data = ADVERTISED_MODELS.map(mk);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ data, has_more: false, first_id: data[0].id, last_id: data[data.length - 1].id }));
    return;
  }

  // Wajib ada key (dari client atau path). Tanpa key -> tolak.
  if (!apiKey) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: { type: 'authentication_error', message: 'API key GrowthCircle tidak ada. Isi key di field API key client (x-api-key).' } }));
    return;
  }

  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = rewriteBody(Buffer.concat(chunks));

    const headers = { ...req.headers };
    // Header yang harus diatur ulang oleh proxy.
    delete headers['host'];
    delete headers['content-length'];
    delete headers['authorization'];
    delete headers['x-api-key'];
    headers['x-api-key'] = apiKey;
    headers['host'] = upstreamUrl.host;
    if (body && body.length) headers['content-length'] = Buffer.byteLength(body);

    // Gabungkan base path upstream + path dari client.
    const basePath = upstreamUrl.pathname.replace(/\/$/, '');
    const targetPath = basePath + req.url;

    const options = {
      protocol: upstreamUrl.protocol,
      hostname: upstreamUrl.hostname,
      port: upstreamUrl.port || (upstreamUrl.protocol === 'https:' ? 443 : 80),
      method: req.method,
      path: targetPath,
      headers,
    };

    const transport = upstreamUrl.protocol === 'https:' ? https : http;
    const proxyReq = transport.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res); // pipe langsung -> streaming SSE jalan otomatis.
    });

    proxyReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { type: 'proxy_error', message: err.message } }));
    });

    if (body && body.length) proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PORT, HOST, () => {
  console.log(`GrowthCircle Anthropic proxy aktif di http://${HOST}:${PORT}`);
  console.log(`  upstream : ${UPSTREAM}`);
  console.log(`  model    : ${DEFAULT_MODEL} (semua claude-* diarahkan ke sini)`);
  console.log(`  set ANTHROPIC_BASE_URL=http://${HOST}:${PORT} di client kamu.`);
});
