// harita.js - Yangın Yayılım Simülasyonu

let grid = [];
let rows, cols;
const cellSize = 5; // Performans için pikselleri gruplandırıyoruz (5x5 bloklar)

// main.js'deki resim yükleme işlemi bittiğinde tetiklenecek bir mekanizma
// CustomEvent kullanarak main.js'den haber alabiliriz veya basitçe bir kontrol döngüsü kurabiliriz.

function haritayiAnalizEt() {
    if (!canvas || !ctx) return;

    // Canvas boyutlarına göre grid oluştur
    cols = Math.floor(canvas.width / cellSize);
    rows = Math.floor(canvas.height / cellSize);
    grid = Array.from({ length: rows }, () => Array(cols).fill(0));

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Hücrenin merkezindeki pikselin rengini kontrol et
            const pxIndex = ((y * cellSize) * canvas.width + (x * cellSize)) * 4;
            const r = imageData[pxIndex];
            const g = imageData[pxIndex + 1];
            const b = imageData[pxIndex + 2];

            // Renk Analizi:
            // Eğer kırmızı yoğunluktaysa -> Yangın (1)
            // Eğer yeşil yoğunluktaysa -> Orman (0)
            if (r > 150 && g < 100) {
                grid[y][x] = 1; // Başlangıç yangını
            } else if (g > 100 && r < 150) {
                grid[y][x] = 0; // Yanıcı yeşil alan
            } else {
                grid[y][x] = -1; // Boş alan/Engel (kayalık vs)
            }
        }
    }
    console.log("Harita analiz edildi. Simülasyon başlıyor...");
    simulasyonuBaslat();
}

function simulasyonuBaslat() {
    setInterval(() => {
        yanginiYay();
        ciz();
    }, 200); // Her 200ms'de bir yayılım
}

function yanginiYay() {
    let yeniGrid = grid.map(row => [...row]);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x] === 1) { // Eğer bu hücre yanıyorsa
                // Komşulara bak (Yukarı, Aşağı, Sol, Sağ)
                const komsular = [
                    [y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]
                ];

                komsular.forEach(([ky, kx]) => {
                    if (ky >= 0 && ky < rows && kx >= 0 && kx < cols) {
                        if (grid[ky][kx] === 0) { // Komşu ormansa
                            // %30 ihtimalle yangın sıçrasın (gerçekçilik için)
                            if (Math.random() > 0.7) {
                                yeniGrid[ky][kx] = 1;
                            }
                        }
                    }
                });
                // Yanan yer bir süre sonra söner (siyah olur)
                yeniGrid[y][x] = 2; 
            }
        }
    }
    grid = yeniGrid;
}

function ciz() {
    const haritaCanvas = document.getElementById("haritaCanvas");
    const hCtx = haritaCanvas.getContext("2d");
    
    haritaCanvas.width = canvas.width;
    haritaCanvas.height = canvas.height;

    hCtx.clearRect(0, 0, haritaCanvas.width, haritaCanvas.height);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x] === 1) {
                hCtx.fillStyle = "rgba(255, 69, 0, 0.8)"; // Turuncu/Kırmızı yangın
                hCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            } else if (grid[y][x] === 2) {
                hCtx.fillStyle = "rgba(40, 40, 40, 0.6)"; // Yanmış küllü alan
                hCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

// main.js'de resim yüklendikten sonra çalışması için bir dinleyici
imageInput.addEventListener("change", () => {
    // Resmin yüklenmesi için kısa bir bekleme (veya img.onload callback'i içine konulmalı)
    setTimeout(haritayiAnalizEt, 500);
});