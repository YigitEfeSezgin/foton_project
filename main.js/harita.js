// harita.js - Maliyet Odaklı Hücresel Otomat Matrisi

let grid = []; // Sayısal harita (Örn: 3, 2, 0, 1)
let rows, cols;
const cellSize = 15; // Her 5x5 piksellik alan 1 hücredir

const renkSistemi = {
    3: "rgba(0, 100, 255, 0.4)",  // YOL: Mavi
    1: "rgba(255, 0, 0, 0.6)",    // YANGIN VE KÜL: Kırmızı
    0: "rgba(0, 255, 0, 0.3)"     // ORMAN: Yeşil
};

// Senin istediğin maliyet tablosu (A* algoritması için hazır)
const costMap = {
    3: 1,   // YOL: En iyi seçenek
    1: 999, // YANGIN VE KÜL: Kesinlikle gidilemez (Kırmızı bölge)
    0: 20   // ORMAN: Gidilebilir ama riskli
};

function haritayiAnalizEt() {
    // Arayüzdeki canvas'ı kontrol et
    const mCanvas = document.getElementById("mainCanvas");
    if (!mCanvas) return;
    const mCtx = mCanvas.getContext("2d");

    cols = Math.floor(mCanvas.width / cellSize);
    rows = Math.floor(mCanvas.height / cellSize);
    
    // Matrisi oluştur
    grid = Array.from({ length: rows }, () => Array(cols).fill(0));

    const imageData = mCtx.getImageData(0, 0, mCanvas.width, mCanvas.height).data;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const pxIndex = ((y * cellSize) * mCanvas.width + (x * cellSize)) * 4;
            const r = imageData[pxIndex];
            const g = imageData[pxIndex + 1];
            const b = imageData[pxIndex + 2];

            // --- HASSAS RENK ANALİZİ VE DUMAN FİLTRELEMESİ ---

            if (r > 180 && g < 100 && b < 100) {
                grid[y][x] = 1; // Kırmızı
            }
            // 2. YOL (3): Hassas Toprak/Asfalt Tonları
            //if (r > 150 && g > 110 && b > 60 && r > g && g > b) {
    // Mantık: R > G > B sıralaması kahverengi/toprak tonlarının imzasıdır.
    // Aradaki farkların çok aşırı olmamasını sağlıyoruz (Alevden ayırmak için).
   // if ((r - g) < 80 && (g - b) < 80) {
       // grid[y][x] = 3;
            // Bej/toprak tonları: Kırmızı ve Yeşil benzer, Maviden daha baskın.
            else if (r > 150 && g > 110 && b > 60 && r > g && g > b) {
                grid[y][x] = 3; // Mavi
            }
            // 3. ORMAN (0): Varsayılan alan
            else if (r >= 20 && r <= 90 && g >= 30 && g <= 110 && b >= 10 && b <= 60 && g >= r && g >= b) {
                grid[y][x] = 0; // Yeşil
            }
            
        }
    }

    console.log("Harita Numaralandırıldı!");
    console.log("Örnek Maliyet Analizi:", {
        "Sol Üst Hücre Değeri": grid[0][0],
        "Hücre Maliyeti": costMap[grid[0][0]] || "Bilinmiyor"
    });

    matrisiEkranaCiz(mCtx);
}

// Resmin üzerine sayısal karşılıkları ve kareleri çizen fonksiyon
function matrisiEkranaCiz(ctx) {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const deger = grid[y][x];
            
            // 1. Hücreyi Renklendir (Matris karesi)
            ctx.fillStyle = renkSistemi[deger] || "transparent";
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

            // 2. Hücre Sınırlarını Çiz (Grid çizgileri - isteğe bağlı)
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"; // Çok hafif beyaz çizgiler
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

            // 3. SAYIYI ÜZERİNE YAZ (0, 1, 2, 3)
            // Sayıları daha okunaklı yapmak için arka planına küçük bir gölge ekleyebiliriz
            ctx.shadowColor = "black";
            ctx.shadowBlur = 2;
            
            ctx.fillStyle = "white"; // Sayı rengi
            ctx.font = "bold 8px Arial"; // Küçük ama kalın font
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(deger, x * cellSize + (cellSize / 2), y * cellSize + (cellSize / 2));
            
            // Gölgeyi sıfırla (sonraki çizimler etkilenmesin)
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
        }
    }
    
    document.getElementById("status").innerText = "Sistem Hazır. Rota seçimi yapabilirsiniz.";
}



// Görsel yüklendiğinde analizi tetikle
const inputElement = document.getElementById("imageInput");
if (inputElement) {
    inputElement.addEventListener("change", function() {
        // main.js'nin resmi çizmesi için kısa bir bekleme
        setTimeout(haritayiAnalizEt, 1000);
    });
}

const analizBtnRef = document.getElementById("analizBtn");
if (analizBtnRef) {
    analizBtnRef.addEventListener("click", () => setTimeout(haritayiAnalizEt, 100));
}