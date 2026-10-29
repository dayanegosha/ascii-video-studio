const bridge = window.vkBridge;

let userSettings = {
  size: null,      // small, medium, large
  symbols: null,   // basic, extended
  mode: null,      // colored, mono
};

let processedVideoBlobUrl = null;
let processingCancelled = false;
let recorder = null;
let progressInterval = null;
let recordingStartTime = 0;

const SYMBOLS_SETS = {
  basic: " .:+-*#%",
  extended: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,\"^`'."
};

const BASE_FONT_SIZES = {
  small: 6,
  medium: 12,
  large: 24
};

function mapGrayToChar(gray, asciiChars) {
  const idx = Math.floor(gray * (asciiChars.length - 1) / 255);
  return asciiChars[idx];
}

function updateProgress(percent) {
  percent = Math.min(100, Math.max(0, percent));
  const circumference = 534;
  const offset = circumference - (percent / 100) * circumference;
  document.getElementById('progress-circle').style.strokeDashoffset = offset;
  document.getElementById('progress-percent').textContent = `${Math.round(percent)}%`;
}

async function processVideoToAscii(file, size, symbols, mode) {
  return new Promise((resolve, reject) => {
    const sourceVideo = document.createElement('video');
    sourceVideo.preload = 'metadata';
    sourceVideo.muted = true;
    sourceVideo.playsInline = true;
    sourceVideo.style.display = 'none';

    const objectUrl = URL.createObjectURL(file);
    sourceVideo.src = objectUrl;

    sourceVideo.onloadedmetadata = () => {
      if (sourceVideo.duration > 180) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Видео должно быть не длиннее 3 минут."));
        return;
      }

      document.body.appendChild(sourceVideo);

      const aspectRatio = sourceVideo.videoWidth / sourceVideo.videoHeight;
      const MAX_DIM = 1920;
      let TARGET_W = aspectRatio > 1 ? MAX_DIM : Math.floor(MAX_DIM * aspectRatio);
      let TARGET_H = aspectRatio > 1 ? Math.floor(MAX_DIM / aspectRatio) : MAX_DIM;

      let fontSize = Math.max(BASE_FONT_SIZES[size], Math.floor(Math.min(TARGET_W, TARGET_H) / 80));
      if (size === 'large') fontSize *= 1.5;

      const canvas = document.createElement('canvas');
      canvas.width = TARGET_W;
      canvas.height = TARGET_H;
      const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });
      ctx.font = `${fontSize}px Courier New, monospace`;
      ctx.textBaseline = 'top';
      ctx.imageSmoothingEnabled = false;

      const asciiChars = SYMBOLS_SETS[symbols];

      const FPS = 30;
      const stream = canvas.captureStream(FPS);

      let mimeType = '';
      let fileExt = 'mp4';

      if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
        mimeType = 'video/mp4;codecs=avc1';
        fileExt = 'mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
        fileExt = 'webm';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        mimeType = 'video/webm;codecs=vp8';
        fileExt = 'webm';
      } else {
        reject(new Error('Браузер не поддерживает запись видео'));
        return;
      }

      recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000
      });

      const chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        clearInterval(progressInterval);
        URL.revokeObjectURL(objectUrl);
        sourceVideo.pause();
        document.body.removeChild(sourceVideo);
        resolve({ url, fileExt });
      };

      recorder.onerror = () => reject(new Error('Ошибка MediaRecorder'));

      // Забираем запись целиком после остановки, без промежуточных фрагментов.
      recorder.start();

      recordingStartTime = performance.now();
      progressInterval = setInterval(() => {
        const elapsed = (performance.now() - recordingStartTime) / 1000;
        const percent = Math.min(100, (elapsed / sourceVideo.duration) * 100);
        updateProgress(percent);
      }, 100);

      // Останавливаем запись, если событие ended не пришло.
      const forceStop = setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, sourceVideo.duration * 1000 + 5000);

      const scaleX = TARGET_W / sourceVideo.videoWidth;
      const scaleY = TARGET_H / sourceVideo.videoHeight;
      const scale = Math.min(scaleX, scaleY);
      const drawW = sourceVideo.videoWidth * scale;
      const drawH = sourceVideo.videoHeight * scale;
      const offsetX = (TARGET_W - drawW) / 2;
      const offsetY = (TARGET_H - drawH) / 2;

      const charWidth = ctx.measureText("@").width;
      const charHeight = fontSize * 1.1;
      const numCols = Math.floor(TARGET_W / charWidth);
      const numRows = Math.floor(TARGET_H / charHeight);

      const drawFrame = () => {
        if (processingCancelled || sourceVideo.ended) {
          clearTimeout(forceStop);
          if (recorder.state === 'recording') recorder.stop();
          return;
        }

        ctx.drawImage(sourceVideo, offsetX, offsetY, drawW, drawH);
        const imageData = ctx.getImageData(0, 0, TARGET_W, TARGET_H);
        const data = imageData.data;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < numRows; y++) {
          for (let x = 0; x < numCols; x++) {
            const sampleX = Math.floor(x * charWidth + charWidth / 2);
            const sampleY = Math.floor(y * charHeight + charHeight / 2);
            const i = (sampleY * TARGET_W + sampleX) * 4;
            if (i + 4 > data.length) continue;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const gray = 0.3 * r + 0.59 * g + 0.11 * b;
            const char = mapGrayToChar(gray, asciiChars);
            ctx.fillStyle = mode === "colored" ? `rgb(${r},${g},${b})` : `rgb(${gray},${gray},${gray})`;
            ctx.fillText(char, x * charWidth, y * charHeight);
          }
        }

        requestAnimationFrame(drawFrame);
      };

      sourceVideo.currentTime = 0;
      sourceVideo.play().then(() => requestAnimationFrame(drawFrame)).catch(reject);
    };

    sourceVideo.onerror = () => reject(new Error('Не удалось загрузить видео'));
    sourceVideo.addEventListener('ended', () => {
      clearTimeout(forceStop);
      if (recorder.state === 'recording') recorder.stop();
    });
  });
}

function showStep(stepId) {
  document.querySelectorAll('.step').forEach(el => el.classList.add('hidden'));
  document.getElementById(stepId).classList.remove('hidden');
}

document.querySelectorAll('[data-size]').forEach(btn => {
  btn.addEventListener('click', () => {
    userSettings.size = btn.dataset.size;
    showStep('step-symbols');
  });
});

document.querySelectorAll('[data-symbols]').forEach(btn => {
  btn.addEventListener('click', () => {
    userSettings.symbols = btn.dataset.symbols;
    showStep('step-mode');
  });
});

document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    userSettings.mode = btn.dataset.mode;
    showStep('step-upload');
  });
});

document.getElementById('btn-back-symbols')?.addEventListener('click', () => showStep('step-size'));
document.getElementById('btn-back-mode')?.addEventListener('click', () => showStep('step-symbols'));
document.getElementById('btn-back-upload')?.addEventListener('click', () => showStep('step-mode'));

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');

function resetFileInput() {
  fileInput.value = '';
}

dropArea.addEventListener('click', () => {
  resetFileInput();
  fileInput.click();
});

dropArea.addEventListener('dragover', e => {
  e.preventDefault();
  dropArea.style.borderColor = '#2196F3';
  dropArea.classList.add('drag-over');
});

dropArea.addEventListener('dragleave', () => {
  dropArea.style.borderColor = '#505050';
  dropArea.classList.remove('drag-over');
});

dropArea.addEventListener('drop', e => {
  e.preventDefault();
  dropArea.style.borderColor = '#505050';
  dropArea.classList.remove('drag-over');
  if (e.dataTransfer.files.length) handleVideoFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) {
    handleVideoFile(fileInput.files[0]);
    resetFileInput();
  }
});

function isValidVideoType(file) {
  const valid = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska', 'video/3gpp', 'video/3gpp2'];
  return valid.includes(file.type) || file.name.toLowerCase().endsWith('.mov') || file.name.toLowerCase().endsWith('.mkv');
}

async function handleVideoFile(file) {
  if (!isValidVideoType(file)) {
    alert('Пожалуйста, загрузите видеофайл (MP4, MOV, WEBM, MKV и др.).');
    return;
  }

  processingCancelled = false;
  showStep('step-processing');
  updateProgress(0);

  try {
    const { url, fileExt } = await processVideoToAscii(file, userSettings.size, userSettings.symbols, userSettings.mode);

    processedVideoBlobUrl = url;

    const resultVideo = document.getElementById('result-video');
    resultVideo.src = url;
    resultVideo.loop = true;

    window.currentFileExt = fileExt;

    showStep('step-result');
    setTimeout(showAdAndEnableButtons, 1000);
  } catch (err) {
    if (!processingCancelled) {
      alert('Ошибка: ' + err.message);
      console.error(err);
      showStep('step-upload');
    }
  }
}

document.getElementById('play-btn')?.addEventListener('click', () => document.getElementById('result-video').play());
document.getElementById('pause-btn')?.addEventListener('click', () => document.getElementById('result-video').pause());

document.getElementById('cancel-btn')?.addEventListener('click', () => {
  processingCancelled = true;
  if (recorder && recorder.state !== 'inactive') recorder.stop();
  clearInterval(progressInterval);
  showStep('step-upload');
});

async function showAdAndEnableButtons() {
  try {
    if (bridge) await bridge.send('VKWebAppShowNativeAds', { ad_format: 'reward' });
  } catch (e) { /* Ошибка рекламы не мешает скачать результат. */ }
  document.getElementById('download-btn').disabled = false;
  document.getElementById('retry-btn').disabled = false;
}

document.getElementById('download-btn').addEventListener('click', async () => {
  if (!processedVideoBlobUrl) return;

  const filename = `ascii_video.${window.currentFileExt || 'mp4'}`;

  if (bridge) {
    try {
      await bridge.send('VKWebAppDownloadFile', { url: processedVideoBlobUrl, filename });
      return;
    } catch (e) { console.warn('VK download failed', e); }
  }

  const a = document.createElement('a');
  a.href = processedVideoBlobUrl;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(processedVideoBlobUrl), 3000);
});

document.getElementById('retry-btn').addEventListener('click', () => {
  userSettings = { size: null, symbols: null, mode: null };
  processedVideoBlobUrl = null;
  showStep('step-size');
});

document.addEventListener('DOMContentLoaded', () => {
  showStep('step-size');
  if (bridge) bridge.send('VKWebAppInit');
});
