const URL = "https://teachablemachine.withgoogle.com/models/WLZeWzIeM/"; // URL จาก Teachable Machine

let model, webcam, maxPredictions;
let isRunning = false;

const video = document.getElementById("webcam");
const result = document.getElementById("result");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

startBtn.addEventListener("click", startCamera);
stopBtn.addEventListener("click", stopCamera);

async function startCamera() {
  if (isRunning) return;

  isRunning = true;
  result.innerText = "กำลังโหลดโมเดล...";

  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const constraints = {
    video: {
      facingMode: { ideal: "environment" } // กล้องหลังมือถือ
    },
    audio: false
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;

  video.onloadedmetadata = () => {
    video.play();
    result.innerText = "กำลังวิเคราะห์...";
    loop();
  };
}

async function loop() {
  if (!isRunning) return;

  await predict();
  requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(video);

  let bestResult = prediction[0];
  for (let i = 1; i < prediction.length; i++) {
    if (prediction[i].probability > bestResult.probability) {
      bestResult = prediction[i];
    }
  }

  result.innerText =
    `ผลการวิเคราะห์: ${bestResult.className} ` +
    `(${(bestResult.probability * 100).toFixed(2)}%)`;
}

function stopCamera() {
  isRunning = false;

  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }

  result.innerText = "หยุดการทำงาน";
}
