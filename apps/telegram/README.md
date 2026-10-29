# .ascii video studio — telegram

бот превращает видео в ASCII-анимацию и отправляет результат в MP4. кадры обрабатываются на сервере через Python, Pillow и MoviePy, видео собирается с помощью FFmpeg.

можно выбрать детализацию, цветной или монохромный режим и качество: обычное до 1080p или ультра до 4K. видео ограничено тремя минутами, команда `/stop` отменяет обработку.

браузерная версия находится в [`apps/web`](../web).

## запуск

нужны Python 3.10+, FFmpeg в `PATH` и токен от [@BotFather](https://t.me/BotFather). бот ищет моноширинный TTF-шрифт в системных папках macOS и Linux; если не найдёт, использует стандартный шрифт Pillow.

```sh
git clone https://github.com/dayanegosha/ascii-video-studio.git
cd ascii-video-studio/apps/telegram
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export BOT_TOKEN="token-from-botfather"
python bot.py
```

на Windows окружение активируется командой `.venv\Scripts\activate`, токен задаётся через `set BOT_TOKEN=...` в cmd или `$env:BOT_TOKEN="..."` в PowerShell.

## использование

отправьте `/start`, выберите размер, режим и качество, затем загрузите видео сообщением или файлом. бот покажет прогресс и отправит готовый MP4. для отмены отправьте `/stop`.

## лицензия

[MIT](../../LICENSE) © George Zhurik
