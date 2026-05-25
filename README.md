# proxy-anth-GC

Proxy Anthropic-compatible untuk GrowthCircle (`https://ai.growthcircle.id/anthropic`).
Client Anthropic (Claude Desktop / Claude Code / SDK yang pakai Messages API) menembak
proxy ini, lalu proxy meneruskan request ke GrowthCircle dengan key yang **dikirim client**.

Tanpa dependency — cukup Node bawaan, tidak perlu `npm install`.

## Daftar isi

- [Instalasi](#instalasi)
- [Menjalankan proxy](#menjalankan-proxy)
- [Konfigurasi (env var)](#konfigurasi-env-var)
- [Pasang di Claude Desktop](#pasang-di-claude-desktop)
- [Pasang di Claude CLI (Claude Code)](#pasang-di-claude-cli-claude-code)
- [Pasang di tool lain (Cursor, SDK, dll)](#pasang-di-tool-lain-cursor-sdk-dll)
- [Sumber & prioritas key](#sumber--prioritas-key)
- [Perilaku proxy](#perilaku-proxy)
- [Menjalankan di background](#menjalankan-di-background)
- [Tes cepat](#tes-cepat)
- [Troubleshooting](#troubleshooting)

## Instalasi

Prasyarat: **Node.js >= 16** (cek dengan `node -v`). Tidak ada dependency lain.

```bash
git clone https://github.com/Cloud-Dark/proxy-anth-GC.git
cd proxy-anth-GC
```

Tidak perlu `npm install` — proxy hanya memakai modul bawaan Node (`http`, `https`).

## Menjalankan proxy

```bash
node server.js
# atau
npm start
```

Output:

```
GrowthCircle Anthropic proxy aktif di http://127.0.0.1:8787
```

Biarkan jendela ini terbuka selama dipakai. Untuk menjalankan di latar belakang,
lihat [Menjalankan di background](#menjalankan-di-background).

## Konfigurasi (env var)

Semua opsional. Set sebelum menjalankan `node server.js`.

| Env | Default | Keterangan |
|-----|---------|------------|
| `PORT` | `8787` | Port lokal proxy |
| `HOST` | `127.0.0.1` | Host bind |
| `GC_API_KEY` | `(kosong)` | Key default/fallback. Kosong = key wajib dikirim client |
| `GC_BASE_URL` | `https://ai.growthcircle.id/anthropic` | Upstream GrowthCircle |
| `GC_MODEL` | `gpt-5.4-free` | Model tujuan untuk semua request `claude-*` |
| `LOG` | `1` | Log alur request/response ke terminal. Set `0` untuk mematikan |

### Contoh tampilan log di terminal

```
[09:47:43.691] → POST /v1/messages
           model: claude-opus-4-7 → gpt-5.4-free  key: gc-free…8KUD  stream: no
           prompt: Sebutkan 1 fakta singkat tentang laut
[09:47:45.877] ← 200 (2186ms, 476B)
           reply: Laut menutupi sekitar 71% permukaan Bumi.
```

Tiap request menampilkan model (asli → hasil remap), key (disamarkan), mode stream,
preview prompt, lalu status + waktu + preview balasan. Untuk request streaming, isi
balasan tidak di-preview (ditandai `[stream]`).

Contoh set env var:

```powershell
# Windows PowerShell
$env:PORT = "9000"; $env:GC_MODEL = "gpt-5.4-free"; node server.js
```

```bash
# macOS / Linux
PORT=9000 GC_MODEL=gpt-5.4-free node server.js
```

## Pasang di Claude Desktop

1. Jalankan proxy (`node server.js`) — biarkan tetap hidup.
2. Buka **Settings → Connectors / Custom gateway** (atau menu endpoint Anthropic kustom).
3. Isi:
   - **Base URL / Endpoint:** `http://127.0.0.1:8787`
     (boleh juga `http://127.0.0.1:8787/v1` — `/v1` dobel dinormalkan otomatis)
   - **API key:** **key GrowthCircle asli** kamu, mis. `gc-free-xxxx`
4. Simpan, lalu **Test / Reconnect**. Daftar model akan terisi dari `/v1/models`
   (muncul sebagai model Claude modern, bukan "legacy").

## Pasang di Claude CLI (Claude Code)

Claude Code membaca endpoint dan key dari environment variable:

```powershell
# Windows PowerShell
$env:ANTHROPIC_BASE_URL = "http://127.0.0.1:8787"
$env:ANTHROPIC_API_KEY  = "gc-free-xxxx"   # key GrowthCircle asli
claude
```

```bash
# macOS / Linux
export ANTHROPIC_BASE_URL="http://127.0.0.1:8787"
export ANTHROPIC_API_KEY="gc-free-xxxx"
claude
```

Agar permanen, tambahkan baris `export ...` ke `~/.bashrc` / `~/.zshrc`, atau set
env var lewat **System Properties → Environment Variables** di Windows.

> Catatan: kamu juga bisa menaruh key di URL alih-alih variable `ANTHROPIC_API_KEY`,
> mis. `ANTHROPIC_BASE_URL=http://127.0.0.1:8787/key=gc-free-xxxx`.

## Pasang di tool lain (Cursor, SDK, dll)

Tool apa pun yang mendukung **Anthropic Messages API** dengan base URL kustom bisa pakai
proxy ini. Yang penting:

- Base URL: `http://127.0.0.1:8787`
- Path Messages: `/v1/messages` (biasanya ditambahkan otomatis oleh tool)
- Auth: header `x-api-key: gc-free-xxxx` **atau** `Authorization: Bearer gc-free-xxxx`

Contoh dengan Anthropic SDK (Python):

```python
import anthropic

client = anthropic.Anthropic(
    base_url="http://127.0.0.1:8787",
    api_key="gc-free-xxxx",
)
msg = client.messages.create(
    model="claude-opus-4-7",      # diremap ke gpt-5.4-free oleh proxy
    max_tokens=128,
    messages=[{"role": "user", "content": "Halo"}],
)
print(msg.content[0].text)
```

## Sumber & prioritas key

Proxy mencari key dengan urutan berikut:

1. **Path** — base URL `http://127.0.0.1:8787/key=KEY` atau `http://127.0.0.1:8787/k/KEY`
2. **Header client** — `x-api-key: KEY` atau `Authorization: Bearer KEY`
3. **Env** — `GC_API_KEY` sebagai fallback

Kalau tidak ada key sama sekali, proxy balas `401`. Tidak ada key yang di-hardcode di kode.

## Perilaku proxy

- **Remap model:** nama `claude-*` (yang dikirim Claude Desktop/CLI) otomatis diubah ke
  `GC_MODEL` (default `gpt-5.4-free`), karena key Free tidak punya akses model Claude asli.
  Model non-`claude-*` diteruskan apa adanya.
- **`/v1/models`:** dijawab lokal dengan katalog model teks/chat GrowthCircle (OpenAI,
  Anthropic, Gemini, MiniMax, DeepSeek, GLM, Kimi) supaya client menampilkannya sebagai
  model modern (bukan "legacy"). Daftar lengkap semua model ada di [MODELS.md](MODELS.md).
  Model image/video/audio tidak ditampilkan karena tidak jalan lewat Messages API.
- **Normalisasi `/v1` dobel:** base URL yang berakhiran `/v1` (jadi `/v1/v1/...`) diperbaiki otomatis.
- **Streaming:** `"stream": true` didukung; respons SSE diteruskan apa adanya.

## Menjalankan di background

```powershell
# Windows PowerShell — jalan di balik layar, log ke file
Start-Process node -ArgumentList "server.js" -RedirectStandardOutput proxy.log -WindowStyle Hidden
```

```bash
# macOS / Linux
nohup node server.js > proxy.log 2>&1 &
```

Untuk menghentikan, tutup proses Node tersebut (mis. lewat Task Manager di Windows,
atau `kill <pid>` di macOS/Linux).

## Tes cepat

```bash
curl http://127.0.0.1:8787/health

curl -X POST http://127.0.0.1:8787/v1/messages \
  -H "x-api-key: gc-free-xxxx" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-opus-4-7","max_tokens":64,"messages":[{"role":"user","content":"Halo"}]}'
```

## Troubleshooting

| Gejala | Penyebab & solusi |
|--------|-------------------|
| `EADDRINUSE: ...:8787` | Port sudah dipakai proxy lama. Matikan proses Node lama, atau jalankan dengan `PORT` lain. |
| `401` dari proxy | Key tidak terkirim. Isi key di field API key client, atau pakai `/key=...` di base URL. |
| `401 UNAUTHORIZED` dari GrowthCircle | Key salah / sudah di-rotate. Generate key baru di GrowthCircle. |
| `403 HAS_NO_FREE_VARIANT` | Model Claude butuh key **Paid**. Pakai key Free dengan model free, atau key Paid + `GC_MODEL`. |
| `404 /v1/v1/...` | Base URL dobel `/v1`. Sudah dinormalkan; pastikan proxy versi terbaru jalan. |
| Claude Desktop hanya tampil "legacy model" | `/v1/models` belum mengembalikan katalog Claude. Reconnect; pastikan proxy versi terbaru. |

> Catatan: key Free GrowthCircle tidak punya akses model Claude asli (`HAS_NO_FREE_VARIANT`).
> Untuk pakai model Claude betulan, butuh key Paid lalu set `GC_MODEL` ke model Claude tsb.
