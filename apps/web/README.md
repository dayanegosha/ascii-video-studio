# .ascii video studio — браузер

конвертер видео в ASCII-анимацию для VK Mini Apps. работает на устройстве: кадры обрабатываются через Canvas, результат записывается через MediaRecorder.

можно выбрать детализацию, набор символов и цветной или монохромный режим. видео ограничено тремя минутами, обработку можно отменить.

серверная версия находится в [`apps/telegram`](../telegram).

## запуск

```sh
git clone https://github.com/dayanegosha/ascii-video-studio.git
cd ascii-video-studio/apps/web
npm install
npm start
```

откройте адрес, который напечатает сервер. для запуска внутри VK укажите этот адрес или адрес опубликованной копии в настройках mini app.

## сборка

```sh
npm run build
```

команда копирует `index.html`, `style.css` и `script.js` в `dist/`.

## лицензия

[MIT](../../LICENSE) © George Zhurik
