<div align="center">

# ASCII Video Studio

**One video, two ways to turn it into moving ASCII art.**

[![License: MIT](https://img.shields.io/badge/license-MIT-2ea44f.svg)](LICENSE)
[![Web](https://img.shields.io/badge/Web-Canvas%20%2B%20MediaRecorder-1769aa.svg)](apps/web)
[![Telegram](https://img.shields.io/badge/Telegram-Python%20%2B%20FFmpeg-26a5e4.svg)](apps/telegram)

</div>

ASCII Video Studio contains two video converters: a browser version for VK
Mini Apps and a Telegram bot. Both turn ordinary clips into animated ASCII art
with adjustable detail, character density and color.

## Choose an edition

| Edition | Best for | Processing | Stack |
| --- | --- | --- | --- |
| [Web / VK Mini App](apps/web) | Instant conversion on a phone or desktop | Entirely on the user's device | JavaScript, Canvas, MediaRecorder, VK Bridge |
| [Telegram bot](apps/telegram) | Convenient chat workflow and high-resolution rendering | Server-side, multi-core | Python, aiogram, Pillow, MoviePy, FFmpeg |

## Shared capabilities

- Colored and monochrome ASCII video
- Multiple detail levels and character ramps
- Progress feedback and cancellation
- Three-minute input guardrail
- Output returned as a playable video

## Repository layout

```text
ascii-video-studio/
├── apps/
│   ├── web/       # VK Mini App and standalone browser converter
│   └── telegram/  # Telegram bot and rendering pipeline
├── LICENSE
└── README.md
```

Each edition has its own setup guide and dependencies. Start with
[`apps/web/README.md`](apps/web/README.md) or
[`apps/telegram/README.md`](apps/telegram/README.md).

## Project history

The browser application and Telegram bot started as separate projects. They
now live together because they solve the same conversion task, while retaining
their original commit history.

## License

[MIT](LICENSE) © George Zhurik
