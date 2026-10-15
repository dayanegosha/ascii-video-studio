# .ascii video studio

Два способа превратить обычное видео в движущийся ASCII-арт.

В репозитории живут браузерное приложение для VK Mini Apps и Telegram-бот. Браузерная версия обрабатывает видео прямо на устройстве, а бот рендерит его на сервере с помощью Python и FFmpeg.

## версии

- [`apps/web`](apps/web) — JavaScript, Canvas и MediaRecorder;
- [`apps/telegram`](apps/telegram) — Python, Pillow, MoviePy и FFmpeg.

Обе версии умеют делать цветное и монохромное видео, менять детализацию и показывать ход обработки. Входное видео ограничено тремя минутами.

Инструкции по запуску находятся в README каждой версии:

- [браузерное приложение](apps/web/README.md);
- [Telegram-бот](apps/telegram/README.md).

## лицензия

[MIT](LICENSE)
