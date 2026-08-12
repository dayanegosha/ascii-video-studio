# ascii-app

A **VK Mini App** that converts a video into **ASCII-art video** entirely in the
browser — no upload, no backend. Pick a few options, and every frame is redrawn
as ASCII on a `<canvas>` and recorded back into a playable clip.

> Prefer Telegram? See the companion **[ascii-bot](https://github.com/dayanegosha/ascii-bot)**.

## Features

- 100% client-side: frames are processed with `<canvas>` and saved via
  `MediaRecorder` — the video never leaves the device
- Detail **size** (small / medium / large) via adjustable font size
- Two **character sets**: basic (` .:+-*#%`) and extended (70+ glyphs)
- **Colored** or **monochrome** output
- Circular progress indicator with cancel support
- Runs inside VK through [`@vkontakte/vk-bridge`](https://dev.vk.com/mini-apps/getting-started)
- Input limited to 3 minutes to keep things responsive

## Tech stack

Vanilla JavaScript, HTML5 Canvas & MediaRecorder, `@vkontakte/vk-bridge`.
No framework, no build step required to run.

## Run locally

```bash
git clone https://github.com/dayanegosha/ascii-app.git
cd ascii-app

npm install
npm start          # serves the folder on a local static server
```

Then open the printed URL. To test inside VK, point your Mini App's settings to
this origin (or a deployed copy).

## Build

```bash
npm run build      # copies index.html, style.css and script.js into dist/
```

## How it works

Each video frame is drawn to an offscreen canvas, sampled on a character grid,
and every cell's brightness is mapped to an ASCII glyph. The glyphs are rendered
onto the visible canvas and the canvas stream is captured with `MediaRecorder`
into the final video.

## License

[MIT](LICENSE) © George Zhurik
