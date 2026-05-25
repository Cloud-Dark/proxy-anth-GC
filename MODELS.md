# Katalog Model GrowthCircle

Daftar semua model GrowthCircle (per 25 Mei 2026). Harga dalam Gems per 1M token
(estimasi, bisa berubah). Varian `-free` = bucket Free (bisa kena limit saat padat);
tanpa `-free` = bucket Paid/Team.

> **Penting untuk proxy ini:** hanya **model teks/chat** yang bisa dipakai lewat
> Claude Desktop / Messages API (`/v1/messages`). Model **image / video / audio**
> memakai endpoint berbeda (`/v1/images/generations`, `/v1/video/generations`,
> `/v1/audio/speech`, `/v1/music/generations`) dan **tidak** akan jalan via chat.
> Model teks-lah yang ditampilkan proxy di `/v1/models`.

## Model teks / chat (dipakai di Claude Desktop)

### OpenAI
| Model ID | Context | Max out |
|----------|---------|---------|
| `gpt-5.4` / `gpt-5.4-free` | 1.1M | 128K |
| `gpt-5.5` / `gpt-5.5-free` | 1.1M | 128K |
| `gpt-5.4-mini` / `gpt-5.4-mini-free` | 400K | 128K |
| `gpt-5.3-codex` / `gpt-5.3-codex-free` | 400K | 128K |
| `gpt-5.3-codex-spark` / `gpt-5.3-codex-spark-free` | 128K | 33K |

### Anthropic
| Model ID | Context | Max out |
|----------|---------|---------|
| `claude-opus-4-7` | 200K | 32K |
| `claude-opus-4-6` | 200K | 32K |
| `claude-opus-4-6-thinking` | 200K | 32K |
| `claude-opus-4-5-20251101` | 200K | 32K |
| `claude-opus-4-5-20251101-thinking` | 200K | 32K |
| `claude-sonnet-4-6` | 200K | 64K |
| `claude-sonnet-4-6-thinking` | 200K | 32K |
| `claude-sonnet-4-5-20250929` | 200K | 32K |
| `claude-sonnet-4-5-20250929-thinking` | 200K | 32K |
| `claude-haiku-4-5-20251001` | 200K | 64K |
| `claude-haiku-4-5-20251001-thinking` | 200K | 32K |
| `claude-3-5-haiku-latest` | 200K | 8K |

### Google Gemini
| Model ID | Context | Max out |
|----------|---------|---------|
| `gemini-3.1-pro-preview` / `-thinking` | 1.0M | 66K |
| `gemini-3-pro-preview` / `-thinking` | 1.0M | 66K |
| `gemini-3-flash-preview` / `-thinking` / `-nothinking` | 1.0M | 66K |
| `gemini-3.5-flash` | 1.0M | 66K |
| `gemini-3.1-flash-lite-preview` | 1.0M | 66K |
| `gemini-2.5-pro` / `-thinking` / `-nothinking` | 1.0M | 66K |
| `gemini-2.5-flash` / `-thinking` / `-nothinking` | 1.0M | 66K |
| `gemini-2.5-flash-lite` | 1.0M | 66K |
| `gemini-2.0-flash` | 1.0M | 66K |

### MiniMax
| Model ID | Context | Max out |
|----------|---------|---------|
| `MiniMax-M2.7` / `MiniMax-M2.7-free` | 205K | 64K |
| `MiniMax-M2.7-highspeed` / `-free` | 205K | 64K |
| `minimax-m2.1` | — | — |
| `minimax-m2.5` | — | — |

### DeepSeek
| Model ID | Catatan |
|----------|---------|
| `deepseek-r1-0528` | penalaran |
| `deepseek-r1-250528` | penalaran, coding |
| `deepseek-v3-0324` | chat |
| `deepseek-v3.1-terminus` | coding, agentic |
| `deepseek-v3.2` | chat |
| `deepseek-v3.2-exp` | penalaran, agentic |
| `deepseek-v4-flash` | multimodal |
| `deepseek-v4-pro` | multimodal |

### Zhipu GLM
| Model ID | Catatan |
|----------|---------|
| `glm-4.6` | penalaran, coding, agentic |
| `glm-4.7` | penalaran, coding |
| `glm-5` | chat |
| `glm-5.1` | penalaran, coding, agentic |

### Moonshot Kimi
| Model ID | Catatan |
|----------|---------|
| `kimi-k2-instruct` | penalaran, coding, agentic |
| `kimi-k2-thinking` | penalaran, agentic |
| `kimi-k2.5` | multimodal |

## Model image (endpoint `/v1/images/generations`)

`gemini-2.5-flash-image-preview` · `gemini-2.5-flash-image-preview-official` ·
`gemini-3-pro-image-preview` · `gemini-3-pro-image-preview-official` ·
`gemini-3.1-flash-image-preview` · `gemini-3.1-flash-image-preview-official` ·
`gpt-4o-image` · `gpt-image-1-official` · `gpt-image-1.5-official` ·
`gpt-image-2` · `gpt-image-2-official` ·
`doubao-seedance-4-0` · `doubao-seedance-4-5` · `doubao-seedream-5-0-lite` ·
`flux-2-flex` · `flux-2-pro` · `flux-kontext-max` · `flux-kontext-pro` ·
`gc-image-pro` · `gc-image-pro-landscape` · `gc-image-pro-portrait` · `gc-image-pro-square` ·
`grok-imagine-1.0` · `grok-imagine-1.0-edit` ·
`image-01` · `imagen-4.0` ·
`qwen-image-2.0` · `qwen-image-2.0-pro` ·
`wan2.7-image` · `wan2.7-image-pro` ·
`ltx-2.3-text-image` · `z-image-turbo`
(banyak punya varian `-free`)

## Model video (endpoint `/v1/video/generations`)

`doubao-seedance-1-0-pro-fast` · `doubao-seedance-1-0-pro-quality` ·
`doubao-seedance-1-5-pro` · `doubao-seedance-2.0` · `doubao-seedance-2.0-face` ·
`doubao-seedance-2.0-fast` · `doubao-seedance-2.0-fast-face` ·
`grok-imagine-1.0-video` · `happyhorse-1.0` ·
`kling-v2-6` · `kling-v2-6-motion-control` · `kling-v3` · `kling-v3-motion-control` ·
`kling-v3-omni` · `kling-video-o1` ·
`ltx-2.3-image-video` · `ltx-2.3-text-video` ·
`MiniMax-Hailuo-2.3` · `Omni-Flash-Ext` ·
`skyreels-v4-fast` · `skyreels-v4-std` ·
`sora-2` · `sora-2-preview` · `sora-2-pro` ·
`veo3.1-fast` · `veo3.1-fast-official` · `veo3.1-lite` ·
`veo3.1-quality` · `veo3.1-quality-official` ·
`viduq3` · `viduq3-mix` · `viduq3-pro` · `viduq3-turbo` ·
`wan2.5-preview` · `wan2.6` · `wan2.6-i2v` · `wan2.6-i2v-flash` ·
`wan2.7` · `wan2.7-r2v` · `wan2.7-videoedit`
(banyak punya varian `-free`)

## Model audio

- Speech (`/v1/audio/speech`): `speech-2.8-hd`
- Music (`/v1/music/generations`): `music-2.6`

## Model OCR

- `deepseek-ocr`
