console.log("Merhaba FOTON.");
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Afet Yönetimi - 3 Adımlı Döngü</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; text-align: center; background: #f0f2f5; margin: 20px; }
    .header { margin-bottom: 20px; padding: 10px; background: white; border-radius: 8px; display: inline-block; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    #mainCanvas { 
      border: 3px solid #2c3e50; 
      background-color: #fff;
      max-width: 95vw; 
      max-height: 75vh;
      cursor: crosshair;
      display: none; /* Resim yüklenene kadar gizle */
    }
    .status-info { font-weight: bold; font-size: 1.2em; margin: 15px; color: #34495e; }
    .hint { color: #7f8c8d; font-size: 0.9em; }
  </style>
</head>
<body>

  <div class="header">
    <h2>Afet Rota Belirleme</h2>
    <input type="file" id="imageInput" accept="image/*">
    <div class="hint">1. Tık: Başlangıç | 2. Tık: Bitiş | 3. Tık: Temizle</div>
  </div>

  <div id="status" class="status-info">Lütfen bir harita fotoğrafı yükleyin.</div>
  
  <canvas id="mainCanvas"></canvas>

  <script>
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    const imageInput = document.getElementById('imageInput');
    const status = document.getElementById('status');

    let img = new Image();
    let points = []; 

    // 1. Resmi Yükleme
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.style.display = "inline-block";
            resetLogic();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    // 2. Tıklama Döngüsü (3 Adımlı Mantık)
    canvas.addEventListener('click', (e) => {
      if (!img.src) return;

      // 3. Tıklama yapıldıysa her şeyi sıfırla
      if (points.length === 2) {
        resetLogic();
        return;
      }

      // Koordinat hesaplama
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      points.push({ x, y });
      draw();
      updateStatus();
    });

    // Çizim İşlemi
    function draw() {
      // Resmi tazele
      ctx.drawImage(img, 0, 0);

      // Noktaları çiz
      points.forEach((p, index) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = (index === 0) ? '#27ae60' : '#c0392b'; // 0: Yeşil, 1: Kırmızı
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.closePath();
        
        // Etiket ekle
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(index === 0 ? "B" : "S", p.x, p.y + 6); 
      });
    }

    function updateStatus() {
      if (points.length === 1) {
        status.innerHTML = "Başlangıç Tamam. <span style='color:#c0392b'>Şimdi Bitiş'i seçin.</span>";
      } else if (points.length === 2) {
        status.innerHTML = "<span style='color:#2980b9'>Rota Belirlendi.</span> Silmek için herhangi bir yere tıklayın.";
      }
    }

    function resetLogic() {
      points = [];
      draw();
      status.innerHTML = "<span style='color:#27ae60'>Başlangıç noktasını seçin.</span>";
    }
  </script>

</body>
</html>