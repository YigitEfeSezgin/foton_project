// harita.js - Güvenlik Koridoru ve Yol Genişletme Destekli Analiz

let grid = []; 
let rows, cols;
const cellSize = 8; 
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
    }

    const imageData = mCtx.getImageData(0, 0, mCanvas.width, mCanvas.height).data;

    // --- 1. ADIM: İLK RENK ANALİZİ ---
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const pxIndex = ((y * cellSize) * mCanvas.width + (x * cellSize)) * 4;
            const r = imageData[pxIndex];
            const g = imageData[pxIndex + 1];
            const b = imageData[pxIndex + 2];

            // Yangın (1)
            if (r > 180 && g < 100 && b < 100) {
                grid[y][x] = 1;
            }
            // Duman (2)
            else if (r >= 0 && r <= 60 && g >= 0 && g <= 60 && b >= 0 && b <= 60 && r > g + 10 && r > b + 10) {
                grid[y][x] = 2; // Gri (İsli Duman)
            }
            // Yol (3)
            else if (r > 150 && g > 110 && b > 60 && r > g && g > b) {
                grid[y][x] = 3;
            }
            // Orman (0)
            else if (r >= 20 && r <= 90 && g >= 30 && g <= 110 && b >= 10 && b <= 60 && g >= r && g >= b) {
                grid[y][x] = 0;
            }
        }
    }

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
    document.getElementById("status").innerText = "Analiz Tamamlandı. Rota seçebilirsiniz.";
}

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
    analizBtnRef.addEventListener("click", () => {
        document.getElementById("status").innerText = "Analiz ediliyor...";
        setTimeout(haritayiAnalizEt, 100);
    });
}