// Rota.js - Kullanıcı Etkileşimi ve Çizim Kontrolcü

console.log("Rota.js yüklendi, canvas durumu:", canvas);

let img = new Image();
let points = []; 

// 1. Resim Yükleme İşlemi
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            img = new Image(); 
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.style.display = "inline-block";
                
                // Resim yüklendiğinde haritayı analiz etmesi için harita.js'yi tetikle
                if (typeof haritayiAnalizEt === 'function') {
                    setTimeout(haritayiAnalizEt, 500); 
                }
                
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

    // Eğer zaten 2 nokta varsa (B ve S), 3. tıklamada her şeyi siler
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
    // Önce resmi çiz (bu işlem ekranı temizler)
    ctx.drawImage(img, 0, 0);

    points.forEach((p, index) => {
        ctx.beginPath();
        let radius = 15;
        let color = (index === 0) ? '#27ae60' : '#c0392b';
        
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
        
        ctx.fillStyle = "white";
        ctx.font = `bold 16px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(index === 0 ? "B" : "S", p.x, p.y + 6);
    });
}

// 4. Durum Mesajı ve Algoritma Tetikleyici
function updateStatus() {
    if (points.length === 1) {
        status.innerHTML = "<b style='color:#27ae60'>BAŞLANGIÇ (Yeşil) seçildi.</b> Şimdi <span style='color:#c0392b'>BİTİŞ'i</span> seçin.";
    } else if (points.length === 2) {
        status.innerHTML = "<b style='color:#000080'>ROTA HESAPLANIYOR...</b>";

        // --- KRİTİK DÜZELTME: ASTAR'I BURADA ÇAĞIRIYORUZ ---
        console.log("📍 İki nokta tamamlandı. solveAStar çağrılıyor...");
        
        // UI'ın donmaması için küçük bir gecikmeyle çalıştır
        setTimeout(() => {
            if (typeof solveAStar === 'function') {
                solveAStar(); 
                status.innerHTML = "<b style='color:#000080'>Rota Çizildi!</b> Temizlemek için ekrana tıklayın.";
            } else {
                console.error("Hata: solveAStar fonksiyonu astar.js içinde bulunamadı!");
                status.innerHTML = "<b style='color:red'>Hata: Algoritma yüklenemedi!</b>";
            }
        }, 100);
    }
}

// 5. Sıfırlama
function resetLogic() {
    points = [];
    draw();
    status.innerHTML = "Başlangıç noktasını seçmek için haritaya tıklayın.";
    console.log("Sistem sıfırlandı.");
}