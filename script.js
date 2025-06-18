// Webカメラの起動
const video = document.getElementById('video');
let contentWidth;
let contentHeight;

const media = navigator.mediaDevices.getUserMedia({ audio: false,
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: { exact: "environment" }
  }})
   .then((stream) => {
      video.srcObject = stream;
      video.onloadeddata = () => {
         video.play();
         contentWidth = video.clientWidth;
         contentHeight = video.clientHeight;
         canvasUpdate();
         checkImage();
      }
   }).catch((e) => {
      console.log(e);
   });

// カメラ映像のキャンバス表示
const cvs = document.getElementById('camera-canvas');
const ctx = cvs.getContext('2d');
const canvasUpdate = () => {
   // 画面サイズに合わせる
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  cvs.width = screenW;
  cvs.height = screenH;

  // アスペクト比を保って描画（中央に表示）
  const scale = Math.min(screenW / contentWidth, screenH / contentHeight);
  const drawW = contentWidth * scale;
  const drawH = contentHeight * scale;
  const offsetX = (screenW - drawW) / 2;
  const offsetY = (screenH - drawH) / 2;

  ctx.clearRect(0, 0, cvs.width, cvs.height);
  ctx.drawImage(video, offsetX, offsetY, drawW, drawH);

  requestAnimationFrame(canvasUpdate);
}

// QRコードの検出
const rectCvs = document.getElementById('rect-canvas');
const rectCtx =  rectCvs.getContext('2d');
const checkImage = () => {
   // imageDataを作る
   const imageData = ctx.getImageData(0, 0, contentWidth, contentHeight);
   // jsQRに渡す
   const code = jsQR(imageData.data, contentWidth, contentHeight);

   // 検出結果に合わせて処理を実施
   if (code) {
      console.log("QRcodeが見つかりました", code);
      drawRect(code.location);
      document.getElementById('qr-msg').textContent = `QRコード：${code.data}`;
   } else {
      console.log("QRcodeが見つかりません…", code);
      rectCtx.clearRect(0, 0, contentWidth, contentHeight);
      document.getElementById('qr-msg').textContent = `QRコード: 見つかりません`;
   }
   setTimeout(()=>{ checkImage() }, 500);
}

// 四辺形の描画
const drawRect = (location) => {
   rectCvs.width = contentWidth;
   rectCvs.height = contentHeight;
   drawLine(location.topLeftCorner, location.topRightCorner);
   drawLine(location.topRightCorner, location.bottomRightCorner);
   drawLine(location.bottomRightCorner, location.bottomLeftCorner);
   drawLine(location.bottomLeftCorner, location.topLeftCorner)
}

// 線の描画
const drawLine = (begin, end) => {
   rectCtx.lineWidth = 4;
   rectCtx.strokeStyle = "#F00";
   rectCtx.beginPath();
   rectCtx.moveTo(begin.x, begin.y);
   rectCtx.lineTo(end.x, end.y);
   rectCtx.stroke();
}
