// harita.js - Güvenlik Koridoru ve Yol Genişletme Destekli Analiz

let grid = []; 
let rows, cols;
const cellSize = 10; 
let originalImageData = null;

const renkSistemi = {
    3: "rgba(0, 100, 255, 0.4)",  // YOL: Mavi
    1: "rgba(255, 0, 0, 0.6)",    // YANGIN: Kırmızı
    0: "rgba(0, 255, 0, 0.3)",    // ORMAN: Yeşil
    2: "rgba(150, 150, 150, 0.7)" // DUMAN: Gri
};

const costMap = {
    3: 1,   
    1: 999, 
    0: 5,   
    2: 999  
};

function haritayiAnalizEt() {
    const mCanvas = document.getElementById("mainCanvas");
    if (!mCanvas) return;
    const mCtx = mCanvas.getContext("2d");

    cols = Math.floor(mCanvas.width / cellSize);
    rows = Math.floor(mCanvas.height / cellSize);
    
    grid = Array.from({ length: rows }, () => Array(cols).fill(0));

    if (!originalImageData) {
        originalImageData = mCtx.getImageData(0, 0, mCanvas.width, mCanvas.height);
    } else {
        mCtx.putImageData(originalImageData, 0, 0);
        tahminiAtesiCiz(mCtx);
    }

    const imageData = mCtx.getImageData(0, 0, mCanvas.width, mCanvas.height).data;

    // --- 1. ADIM: İLK RENK ANALİZİ (GÜNCELLENMİŞ VE FİLTRELİ) ---
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const pxIndex = ((y * cellSize) * mCanvas.width + (x * cellSize)) * 4;
            const r = imageData[pxIndex];
            const g = imageData[pxIndex + 1];
            const b = imageData[pxIndex + 2];

            // 1. Yangın (1)
            if (r > 180 && g < 100 && b < 100) {
                grid[y][x] = 1;
            }
            // 2. Duman (2) - Senin verdiğin 5 özel RGB kodunu baz alan genişletilmiş koridor
            else if (r >= 25 && r <= 120 && g >= 25 && g <= 120 && b >= 30 && b <= 130 && Math.abs(r - g) <= 15) {
                grid[y][x] = 2; 
            }
            // 3. Yol (3)
            else if (r > 150 && g > 110 && b > 60 && r > g && g > b) {
                grid[y][x] = 3;
            }
            // 4. Orman (0)
            else {
                grid[y][x] = 0;
            }
        }
    }

    // --- 1.5 ADIM: KONUMSAL TEMİZLİK (SADECE ALEV YAKININI TUT) ---
    let tempGrid = JSON.parse(JSON.stringify(grid));
    let dumanMenzili = 12; // Alevden en fazla 12 birim uzaklık (Sağdaki toprağı silmek için)

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x] === 2) { 
                let yakinindaAlevVar = false;
                for (let dy = -dumanMenzili; dy <= dumanMenzili; dy++) {
                    for (let dx = -dumanMenzili; dx <= dumanMenzili; dx++) {
                        let ny = y + dy, nx = x + dx;
                        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && grid[ny][nx] === 1) {
                            yakinindaAlevVar = true; break;
                        }
                    }
                    if (yakinindaAlevVar) break;
                }
                if (!yakinindaAlevVar) tempGrid[y][x] = 0; // Uzaktaki "sahte" dumanları ormana çevir
            }
        }
    }
    grid = tempGrid;

    // --- YENİ ADIM: UZAKTAKİ DUMANLARI SİL (Sadece alev yakını kalsın) ---
    let cleanGrid = JSON.parse(JSON.stringify(grid));
    let mesafeLimit = 10; // Alevden en fazla kaç birim uzaktaki dumanı kabul edelim?

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x] === 2) { // Eğer hücre dumansa
                let alevVarMi = false;
                // Çevresindeki 10 birimlik alanı tara
                for (let dy = -mesafeLimit; dy <= mesafeLimit; dy++) {
                    for (let dx = -mesafeLimit; dx <= mesafeLimit; dx++) {
                        let ny = y + dy, nx = x + dx;
                        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && grid[ny][nx] === 1) {
                            alevVarMi = true; break;
                        }
                    }
                    if (alevVarMi) break;
                }
                if (!alevVarMi) cleanGrid[y][x] = 0; // Alevden uzaksa sil (Orman yap)
            }
        }
    }
    grid = cleanGrid;

    // --- 2. ADIM: YANGIN GENİŞLETME (Senin mevcut kodun buradan devam etsin) ---

    // --- 2. ADIM: YANGIN GENİŞLETME (Güvenlik Koridoru - 16 Komşuluk/2 Birim) ---
    let fireTempGrid = JSON.parse(JSON.stringify(grid));
    for (let y = 2; y < rows - 2; y++) {
        for (let x = 2; x < cols - 2; x++) {
            if (grid[y][x] === 1) { 
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        fireTempGrid[y + dy][x + dx] = 1;
                    }
                }
            }
        }
    }
    grid = fireTempGrid;

    // --- 3. ADIM: YOL GENİŞLETME (8-Komşuluk Dilation) ---
    let roadTempGrid = JSON.parse(JSON.stringify(grid));
    for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
            if (grid[y][x] === 3) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        // Yol genişlerken yangın veya dumanın üzerine binme
                        if (grid[y + dy][x + dx] !== 1 && grid[y + dy][x + dx] !== 2) {
                            roadTempGrid[y + dy][x + dx] = 3;
                        }
                    }
                }
            }
        }
    }
    grid = roadTempGrid;

    console.log("Analiz Bitti: Yangın Koridoru (2 birim) ve Yol Genişletme uygulandı.");
    matrisiEkranaCiz(mCtx);
}

function matrisiEkranaCiz(ctx) {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const deger = grid[y][x];
            ctx.fillStyle = renkSistemi[deger] || "transparent";
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

            ctx.shadowColor = "black";
            ctx.shadowBlur = 2;
            ctx.fillStyle = "white";
            ctx.font = "bold 8px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(deger, x * cellSize + (cellSize / 2), y * cellSize + (cellSize / 2));
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
        }
    }

    let ruzgarBilgisi = "";
    if (window.guncelRuzgar) {
        ruzgarBilgisi = `<br><span style="color:#e67e22;">🌬️ Anlık Rüzgar: ${window.guncelRuzgar.hiz} km/s | Yön: ${window.guncelRuzgar.derece}°</span>`;
    }
    document.getElementById("status").innerHTML = `<b>Analiz Tamamlandı. Rota seçebilirsiniz.</b> ${ruzgarBilgisi}`;
}


// ==========================================================
// === YENİ EKLENEN KOD BAŞLANGICI ==========================
// ==========================================================
function tahminiAtesiCiz(ctx) {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Sadece yangın (1) olan hücreleri bul
            if (grid[y][x] === 1) { 
                ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Yarı saydam (%50) kırmızı
                ctx.beginPath();
                // Hücrenin tam ortasına daire çiziyoruz
                ctx.arc(
                    x * cellSize + (cellSize / 2), 
                    y * cellSize + (cellSize / 2), 
                    cellSize / 2, 
                    0, 2 * Math.PI
                );
                ctx.fill();
            }
        }
    }
}
// ==========================================================
// === YENİ EKLENEN KOD BİTİŞİ ==============================
// ==========================================================


// Olay Dinleyiciler
const inputElement = document.getElementById("imageInput");
if (inputElement) {
    inputElement.addEventListener("change", function() {
        originalImageData = null;
        document.getElementById("status").innerText = "Fotoğraf yüklendi. Analiz bekleniyor...";
    });
}

const analizBtnRef = document.getElementById("analizBtn");
if (analizBtnRef) {
    analizBtnRef.addEventListener("click", async () => {
        document.getElementById("status").innerText = "Hava durumu çekiliyor ve Analiz ediliyor...";
        
        // Önce rüzgarı çek (Otomatik çalışır)
        window.guncelRuzgar = await ruzgarVerisiAl(); 
        
        // Ekrana rüzgarı yazdır
        document.getElementById("status").innerHTML = 
            `<b>Analiz ediliyor...</b> <br> 🌬️ Rüzgar: ${window.guncelRuzgar.hiz} km/s | Yön: ${window.guncelRuzgar.derece}°`;
        
        setTimeout(haritayiAnalizEt, 100);
    });
}
