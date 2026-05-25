# proxy-anth-GC

Proxy Anthropic-compatible untuk GrowthCircle (`https://ai.growthcircle.id/anthropic`).
Client Anthropic (Claude Desktop / Claude Code / SDK yang pakai Messages API) menembak
proxy ini, lalu proxy meneruskan request ke GrowthCircle dengan key yang **dikirim client**.

Tanpa dependency — cukup Node bawaan, tidak perlu `npm install`.

## Jalankan

```bash
node server.js
# atau
npm start
```

Proxy listen di `http://127.0.0.1:8787`.

### Konfigurasi (opsional, lewat env var)

| Env | Default | Keterangan |
|-----|---------|------------|
| `PORT` | `8787` | Port lokal proxy |
| `HOST` | `127.0.0.1` | Host bind |
| `GC_API_KEY` | `(kosong)` | Key default/fallback. Kosong = key wajib dikirim client |
| `GC_BASE_URL` | `https://ai.growthcircle.id/anthropic` | Upstream GrowthCircle |
| `GC_MODEL` | `gpt-5.4-free` | Model tujuan untuk semua request `claude-*` |

## Pakai di Claude Desktop / client Anthropic

- **Base URL:** `http://127.0.0.1:8787` (boleh juga `http://127.0.0.1:8787/v1` — `/v1` dobel dinormalkan otomatis)
- **API key:** isi **key GrowthCircle asli** kamu (mis. `gc-free-xxxx`)

Proxy meneruskan key tersebut apa adanya ke GrowthCircle. Tidak ada key yang di-hardcode.

### Sumber key (urutan prioritas)

1. **Path** — base URL `http://127.0.0.1:8787/key=KEY` atau `http://127.0.0.1:8787/k/KEY`
2. **Header client** — `x-api-key: KEY` atau `Authorization: Bearer KEY`
3. **Env** — `GC_API_KEY` sebagai fallback

Kalau tidak ada key sama sekali, proxy balas `401`.

## Perilaku

- **Remap model:** nama `claude-*` (yang dikirim Claude Desktop) otomatis diubah ke
  `GC_MODEL` (default `gpt-5.4-free`), karena key Free tidak punya akses model Claude asli.
  Model non-`claude-*` diteruskan apa adanya.
- **`/v1/models`:** dijawab lokal dengan katalog model Claude supaya Claude Desktop
  menampilkannya sebagai model modern (bukan "legacy"). Request tetap diremap saat dipakai.
- **Streaming:** `"stream": true` didukung; respons SSE diteruskan apa adanya.

## Tes cepat

```bash
curl http://127.0.0.1:8787/health

curl -X POST http://127.0.0.1:8787/v1/messages \
  -H "x-api-key: gc-free-xxxx" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-opus-4-7","max_tokens":64,"messages":[{"role":"user","content":"Halo"}]}'
```

> Catatan: key Free GrowthCircle tidak punya akses model Claude asli (`HAS_NO_FREE_VARIANT`).
> Untuk pakai model Claude betulan, butuh key Paid lalu set `GC_MODEL` ke model Claude tsb.
