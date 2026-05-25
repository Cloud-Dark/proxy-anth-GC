# proxy-anth-GC

Proxy Anthropic-compatible untuk GrowthCircle (`https://ai.growthcircle.id/anthropic`).
Client Anthropic (Claude Code / SDK / tool yang pakai Messages API) menembak proxy ini,
proxy menyuntikkan API key GrowthCircle dan me-remap nama model `claude-*` ke model GC.

## Jalankan

```bash
node server.js
```

Proxy listen di `http://127.0.0.1:8787`. Tanpa dependency (pakai Node bawaan).

### Konfigurasi (opsional, lewat env var)

| Env | Default | Keterangan |
|-----|---------|------------|
| `PORT` | `8787` | Port lokal proxy |
| `HOST` | `127.0.0.1` | Host bind |
| `GC_API_KEY` | `gc-free-...` | API key GrowthCircle |
| `GC_BASE_URL` | `https://ai.growthcircle.id/anthropic` | Upstream |
| `GC_MODEL` | `gpt-5.4-free` | Model tujuan untuk semua request `claude-*` |

## Pakai di Claude Code / client Anthropic

Set base URL ke proxy, lalu jalankan client seperti biasa:

```powershell
$env:ANTHROPIC_BASE_URL = "http://127.0.0.1:8787"
$env:ANTHROPIC_API_KEY  = "apa-saja"   # diabaikan proxy, key asli ada di server
claude
```

Client kirim model `claude-sonnet-4-...`, proxy otomatis ubah jadi `gpt-5.4-free`.

## Tes cepat

```bash
curl http://127.0.0.1:8787/health

curl -X POST http://127.0.0.1:8787/v1/messages \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4","max_tokens":64,"messages":[{"role":"user","content":"Halo"}]}'
```

Streaming (`"stream": true`) didukung — respons SSE diteruskan apa adanya.
