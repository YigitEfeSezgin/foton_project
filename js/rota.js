// Rota.js - Kullanıcı Etkileşimi, Görsel Koruma ve Otomatik Hesaplama

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
                
                // Resim değiştiğinde analiz verisini sıfırla
                if (typeof originalImageData !== 'undefined') originalImageData = null;
                
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
    updateStatus(); // İkinci nokta seçildiğinde tetikleyici burada çalışacak
});

// 3. Çizim Fonksiyonu
function draw() {
    // --- KRİTİK: NUMARALANDIRILMIŞ HALİ KORU ---
    // Eğer harita.js analiz yapmışsa ve originalImageData doluysa onu ekrana basar.
    // Böylece noktaları koyarken numaralar silinmez.
    if (typeof originalImageData !== 'undefined' && originalImageData !== null) {
        ctx.putImageData(originalImageData, 0, 0);

        //aleyna
        if (typeof tahminiAtesiCiz === "function") {
            tahminiAtesiCiz(ctx);
        }//aleyna bitiş 


    } else {
        // Analiz yapılmamışsa (ilk yükleme) orijinal resmi çiz
        ctx.drawImage(img, 0, 0);
    }

    points.forEach((p, index) => {
        ctx.beginPath();
        let radius = 15;
        let color = (index === 0) ? '#27ae60' : '#c0392b'; // Başlangıç Yeşil, Bitiş Kırmızı
        
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Beyaz Kenarlık
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
    });
}

// 4. Durum Mesajı ve OTOMATİK HESAPLAMA
function updateStatus() {
    if (points.length === 1) {
        status.innerHTML = "<b style='color:#27ae60'>BAŞLANGIÇ seçildi.</b> Şimdi <span style='color:#c0392b'>BİTİŞ'i</span> seçin.";
    } 
    else if (points.length === 2) {
        status.innerHTML = "<b style='color:#000080'>ROTA HESAPLANIYOR...</b>";
        
        console.log("📍 Otomatik hesaplama başlatılıyor...");

        // --- DÜZELTME: F12'YE GEREK KALMADAN ÇALIŞTIRAN KISIM ---
        // 100ms gecikme veriyoruz ki tarayıcı önce kırmızı noktayı çizsin, sonra algoritmayı başlatsın.
        setTimeout(() => {
            if (typeof solveAStar === "function") {
                solveAStar(); 
                status.innerHTML = "<b style='color:#000080'>Rota Çizildi!</b> Temizlemek için ekrana tıklayın.";
            } else {
                console.error("Hata: astar.js dosyasındaki solveAStar fonksiyonuna ulaşılamıyor!");
            }
        }, 100); 
    }
}

// 5. Sıfırlama
function resetLogic() {
    points = [];
    
    // Sıfırlarken eğer analiz varsa analizli görüntüyü, yoksa ana resmi bas
    if (typeof originalImageData !== 'undefined' && originalImageData !== null) {
        ctx.putImageData(originalImageData, 0, 0);

        //aleyna
        if (typeof tahminiAtesiCiz === "function") {
            tahminiAtesiCiz(ctx);
        }
        //aleyna bitiş 


    } else {
        ctx.drawImage(img, 0, 0);
    }
    
    status.innerHTML = "Başlangıç noktasını seçmek için haritaya tıklayın.";
}