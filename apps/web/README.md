# .ascii video studio — браузер

Конвертер видео в ASCII-анимацию для VK Mini Apps. Работает на устройстве: кадры обрабатываются через Canvas, результат записывается через MediaRecorder.

Можно выбрать детализацию, набор символов и цветной или монохромный режим. Видео ограничено тремя минутами, обработку можно отменить.

Серверная версия находится в [`apps/telegram`](../telegram).

## запуск

```sh
git clone https://github.com/dayanegosha/ascii-video-studio.git
cd ascii-video-studio/apps/web
npm install
npm start
```

Откройте адрес, который напечатает сервер. Для запуска внутри VK укажите этот адрес или адрес опубликованной копии в настройках Mini App.

## сборка

```sh
npm run build
```

Команда копирует `index.html`, `style.css` и `script.js` в `dist/`.

## лицензия

[MIT](../../LICENSE) © George Zhurik
