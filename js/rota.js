console.log("Rota.js yüklendi, canvas durumu:", canvas);
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('imageInput');
const status = document.getElementById('status');

let img = new Image();
let points = []; // Koordinatları tutan ana dizimiz

// 1. Resim Yükleme İşlemi
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            img.onload = () => {
                // Canvas boyutlarını orijinal resme göre ayarla
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.style.display = "inline-block";
                resetLogic(); // Her yeni resimde sistemi sıfırla
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// 2. Tıklama Döngüsü (3 Adımlı: Başlangıç -> Bitiş -> Sıfırla)
canvas.addEventListener('click', (e) => {
    if (!img.src) return;

    // Eğer zaten 2 nokta varsa, 3. tıklama her şeyi siler
    if (points.length === 2) {
        resetLogic();
        return;
    }

    // Koordinat hesaplama (Resim ölçeklendirilmiş olsa bile doğru çalışır)
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Noktayı kaydet
    points.push({ 
        x: Math.round(x), 
        y: Math.round(y),
        label: points.length === 0 ? "Baslangic" : "Bitis"
    });

    draw();
    updateStatus();
});

// 3. Çizim Fonksiyonu
function draw() {
    // Önce resmi çizerek ekranı tazele
    ctx.drawImage(img, 0, 0);

    points.forEach((p, index) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
        
        // Renk Belirleme: 1. Nokta Yeşil, 2. Nokta Kırmızı
        ctx.fillStyle = (index === 0) ? '#27ae60' : '#c0392b'; 
        ctx.fill();
        
        // Beyaz Kenarlık
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.closePath();
        
        // Nokta İçine Harf Yazma (B: Başlangıç, S: Son/Bitiş)
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(index === 0 ? "B" : "S", p.x, p.y + 6);
    });
}

// 4. Durum Bilgisi ve JSON Veri Çıktısı
function updateStatus() {
    if (points.length === 1) {
        status.innerHTML = "Başlangıç Kaydedildi. <span style='color:#c0392b'>Şimdi Bitiş'i seçin.</span>";
    } else if (points.length === 2) {
        status.innerHTML = "<span style='color:#2980b9'>Rota Tamam!</span> Silmek için herhangi bir yere tıklayın.";
        
        // --- Ekibiniz için JSON Veri Çıktısı ---
        const routeData = {
            missionId: "AFET-" + Math.floor(Math.random() * 1000), // Örnek görev ID
            coordinates: points,
            created_at: new Date().toLocaleString()
        };

        console.log("📍 Yeni Rota Verisi Oluşturuldu:", routeData);
        // İleride buraya 'fetch' kullanarak veriyi server'a gönderme kodu eklenebilir.
    }
}

// 5. Sıfırlama Mantığı
function resetLogic() {
    points = [];
    draw();
    status.innerHTML = "<span style='color:#27ae60'>Başlangıç noktasını seçin.</span>";
    console.clear(); // Konsolu temizleyerek karmaşayı önler
}