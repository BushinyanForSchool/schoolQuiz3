const video = document.getElementById('video');
    let contentWidth, contentHeight;

    // スマホで外カメラを優先して起動
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: { ideal: "environment" } // ★ 外カメラを優先
      }
    }).then((stream) => {
      video.srcObject = stream;
      video.onloadeddata = () => {
        video.play();
        contentWidth = video.videoWidth;
        contentHeight = video.videoHeight;
        canvasUpdate();
        checkImage();
      };
    }).catch((e) => {
      console.error("カメラの取得に失敗:", e);
      document.getElementById('qr-msg').textContent = "カメラが使用できません";
    });

    const cvs = document.getElementById('camera-canvas');
    const ctx = cvs.getContext('2d');
    const canvasUpdate = () => {
      cvs.width = contentWidth;
      cvs.height = contentHeight;
      ctx.drawImage(video, 0, 0, contentWidth, contentHeight);
      requestAnimationFrame(canvasUpdate);
    };

    const rectCvs = document.getElementById('rect-canvas');
    const rectCtx = rectCvs.getContext('2d');
    const checkImage = () => {
      const imageData = ctx.getImageData(0, 0, contentWidth, contentHeight);
      const code = jsQR(imageData.data, contentWidth, contentHeight);

      if (code) {
        console.log("QRコードが見つかりました:", code.data);
        drawRect(code.location);
        document.getElementById('qr-msg').textContent = `QRコード: ${code.data}`;
      } else {
        rectCtx.clearRect(0, 0, contentWidth, contentHeight);
        document.getElementById('qr-msg').textContent = "QRコード: 見つかりません";
      }

      setTimeout(checkImage, 500);
    };

    const drawRect = (location) => {
      rectCvs.width = contentWidth;
      rectCvs.height = contentHeight;
      drawLine(location.topLeftCorner, location.topRightCorner);
      drawLine(location.topRightCorner, location.bottomRightCorner);
      drawLine(location.bottomRightCorner, location.bottomLeftCorner);
      drawLine(location.bottomLeftCorner, location.topLeftCorner);
    };

    const drawLine = (begin, end) => {
      rectCtx.lineWidth = 4;
      rectCtx.strokeStyle = "#F00";
      rectCtx.beginPath();
      rectCtx.moveTo(begin.x, begin.y);
      rectCtx.lineTo(end.x, end.y);
      rectCtx.stroke();
    };
