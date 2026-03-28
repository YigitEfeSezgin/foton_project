// harita.js - Gelişmiş Navigasyon ve Yayılım Analizi

let grid = [];
let rows, cols;
const cellSize = 5; // Hassasiyet için 5x5 pikselblokları. (Düşürürsen yolları daha iyi yakalar ama yavaşlar)

// Navigasyon Ağırlıkları (İtfaiyeciler için rota hesaplamada kullanılacak)
// Yüksek puan = Gidilmesi zor/tehlikeli.
const costMap = {
    3: 1,   // YOL: En iyi seçenek (Maliyet 1)
    2: 10,  // Yanmış Alan: Güvenli ama engebeli (Maliyet 10)
    0: 20,  // Orman: Gidilebilir ama riskli (Maliyet 20)
    1: 999, // Yangın: Kesinlikle gidilemez (Maliyet max)
   -1: 999  // Engel/Duman: Gidilemez (Maliyet max)
};

function haritayiAnalizEt() {
    if (!canvas || !ctx) return;

    cols = Math.floor(canvas.width / cellSize);
    rows = Math.floor(canvas.height / cellSize);
    grid = Array.from({ length: rows }, () => Array(cols).fill(-1)); // Varsayılan: Engel

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const pxIndex = ((y * cellSize) * canvas.width + (x * cellSize)) * 4;
            const r = imageData[pxIndex];
            const g = imageData[pxIndex + 1];
            const b = imageData[pxIndex + 2];

            // -----------------------------------------------------
            // GELİŞMİŞ RENK ANALİZİ (image_1.png uyumlu)
            // -----------------------------------------------------

            // 1. YOLLARI BULMAK (Toprak/Asfalt yollar genelde sarı/gri tonlarındadır, R ve G yakındır)
            // image_1.png'deki açık renkli yollar için hassas eşik:
            if (r > 160 && g > 130 && Math.abs(r - g) < 50) {
                grid[y][x] = 3; // YOL
            }
            // 2. YANGIN (Canlı Kırmızı)
            else if (r > 200 && g < 100) {
                grid[y][x] = 1; // YANGIN
            }
            // 3. YOĞUN DUMAN / SU (Grimsi, puslu, gidilemez alan)
            else if (r < 100 && g < 100 && b < 100 && Math.abs(r-b) < 20) {
                grid[y][x] = -1; // ENGEL/DUMAN
            }
            // 4. ORMAN (Yoğun Yeşil)
            else if (g > 80 && r < 140) {
                grid[y][x] = 0; // ORMAN
            }
            // 5. YANMIŞ ALAN (Koyu gri/Siyah, yeşilden farklı)
            else if (g < 60 && r < 60 && b < 60) {
                grid[y][x] = 2; // YANMIŞ ALAN
            }
        }
    }
    console.log("Navigasyon haritası oluşturuldu.");
    cizHaritayi(); // İlk analizden sonra çiz
}

function cizHaritayi() {
    const haritaCanvas = document.getElementById("haritaCanvas");
    const hCtx = haritaCanvas.getContext("2d");
    
    haritaCanvas.width = canvas.width;
    haritaCanvas.height = canvas.height;
    hCtx.clearRect(0, 0, haritaCanvas.width, haritaCanvas.height);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let color = "rgba(0,0,0,0)"; // Şeffaf

            if (grid[y][x] === 3) { // YOL
                color = "rgba(0, 0, 255, 0.4)"; // Mavi Şeffaf (Yolları görmeleri için)
            } else if (grid[y][x] === 1) { // YANGIN
                color = "rgba(255, 0, 0, 0.6)"; // Kırmızı
            } else if (grid[y][x] === 2) { // YANMIŞ
                color = "rgba(60, 60, 60, 0.6)"; // Siyah/Gri
            } else if (grid[y][x] === -1) { // ENGEL/DUMAN
                color = "rgba(200, 200, 200, 0.5)"; // Beyaz puslu
            }
            // Orman (0) şeffaf kalıyor çünkü alttaki orijinal fotoğraf orman.

            if (color !== "rgba(0,0,0,0)") {
                hCtx.fillStyle = color;
                hCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

// Navigasyon Rota Hesaplama (Taslak)
// Bu fonksiyonu itfaiyeci tıkladığında çalıştırabilirsin.
function rotaHesapla(startX, startY, endX, endY) {
    // Burada A* (A-Star) veya Dijkstra algoritması kullanılmalı.
    // Algoritma komşulara bakarken grid[y][x]'in costMap'teki değerini kullanacak.
    // Maliyeti düşük (yani Yollar (3)) olan yerleri tercih edecek.
    console.log("A* Rotası bu grid üzerinde hesaplanacak.");
}

// main.js'de resim yüklendikten sonra çalışması için bir dinleyici
imageInput.addEventListener("change", () => {
    // Resmin yüklenmesi için kısa bir bekleme (veya img.onload callback'i içine konulmalı)
    setTimeout(haritayiAnalizEt, 500);
});