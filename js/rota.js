

// Şimdi log basabiliriz
console.log("Rota.js yüklendi, canvas durumu:", canvas);

let img = new Image();
let points = []; 

// 1. Resim Yükleme İşlemi
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            img = new Image(); // Resmi sıfırla
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

// 2. Tıklama Döngüsü
canvas.addEventListener('click', (e) => {
    if (!img.src) return;

    // Eğer zaten 2 nokta varsa (B ve S), 3. tıklamada her şeyi sil
    if (points.length === 2) {
        resetLogic();
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    points.push({ 
        x: Math.round(x), 
        y: Math.round(y)
    });

    draw();
    updateStatus();
});

// 3. Çizim Fonksiyonu
function draw() {
    // Önce resmi çiz (temizle-yaz döngüsü)
    ctx.drawImage(img, 0, 0);

    points.forEach((p, index) => {
        ctx.beginPath();
        
        // --- BOYUT VE RENK MANTIĞI ---
        // 1. nokta (index 0): Yeşil ve Büyük (radius: 15)
        // 2. nokta (index 1): Kırmızı ve Normal (radius: 15)
        let radius = (index === 0) ? 15 : 15;
        let color = (index === 0) ? '#27ae60' : '#c0392b';
        
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Beyaz Kenarlık
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
        
        // Etiket Yazısı
        /*ctx.fillStyle = "white";
        ctx.font = `bold ${index === 0 ? '22px' : '16px'} Arial`;
        ctx.textAlign = "center";
        ctx.fillText(index === 0 ? "B" : "S", p.x, p.y + (index === 0 ? 8 : 6));*/
    });
}

// 4. Durum Mesajı
function updateStatus() {
    if (points.length === 1) {
        status.innerHTML = "<b style='color:#27ae60'>BAŞLANGIÇ (Yeşil) seçildi.</b> Şimdi <span style='color:#c0392b'>BİTİŞ'i</span> seçin.";
    } else if (points.length === 2) {
        status.innerHTML = "<b style='color:#c0392b'>BİTİŞ (Kırmızı) seçildi.</b> Temizlemek için ekrana tekrar tıklayın.";
    }
}

// 5. Sıfırlama
function resetLogic() {
    points = [];
    draw();
    status.innerHTML = "Başlangıç noktasını (Büyük Yeşil) seçmek için haritaya tıklayın.";
}