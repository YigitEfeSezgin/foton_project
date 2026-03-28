// tahmin.js - Performanslı ve Görsel Destekli Versiyon

function yanginYayiliminiHesapla() {
    // 1. Veri Kontrolü
    if (typeof grid === 'undefined' || grid.length === 0) {
        console.error("Grid bulunamadı!");
        return;
    }

    const mCanvas = document.getElementById("mainCanvas");
    if (!mCanvas) return;
    const mCtx = mCanvas.getContext("2d");

    // 2. Hızlı Kopyalama (JSON.parse yerine daha hızlı yöntem)
    let yeniGrid = grid.map(row => [...row]);

    // --- 4 BİRİM YOL KURALI ---
    function yolBariyeriVarMi(y, x, dy, dx) {
        for (let i = 1; i <= 4; i++) {
            let ny = y + (dy * i);
            let nx = x + (dx * i);
            if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                if (grid[ny][nx] !== 3) return false; 
            } else return false;
        }
        return true; 
    }

    // 3. Yayılım Hesaplama (2 Birim)
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x] === 1) { // Sadece yangın olan hücreler
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        if (dy === 0 && dx === 0) continue;

                        let ny = y + dy;
                        let nx = x + dx;

                        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                            if (grid[ny][nx] !== 3 && grid[ny][nx] !== 1) {
                                // Yön tayini
                                let yonY = dy === 0 ? 0 : dy / Math.abs(dy);
                                let yonX = dx === 0 ? 0 : dx / Math.abs(dx);

                                if (!yolBariyeriVarMi(y, x, yonY, yonX)) {
                                    yeniGrid[ny][nx] = 1;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 4. KRİTİK NOKTA: Global değişkeni güncelle ve ÇİZ
    grid = yeniGrid; 

    // harita.js'deki çizim fonksiyonunu çağırıyoruz
    // Bu fonksiyon ctx.fillText kullanarak sayıları ekrana basar
    if (typeof matrisiEkranaCiz === "function") {
        matrisiEkranaCiz(mCtx); 
        console.log("Tahmin başarıyla çizildi.");
    }
}

// Buton Bağlantısı
document.addEventListener("click", function(e) {
    if (e.target && (e.target.id === 'tahminBtn' || e.target.innerText === 'TAHMİN')) {
        yanginYayiliminiHesapla();
    }
});