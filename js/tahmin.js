// tahmin.js - Senin bölümün

function yanginYayiliminiHesapla() {
    // 1. KONTROL: harita.js'deki global değişkenlere erişim var mı?
    // 'grid', 'rows' ve 'cols' harita.js'de tanımlı olmalı.
    if (typeof grid === 'undefined' || grid.length === 0) {
        console.error("Hata: Grid verisi bulunamadı. Önce Analiz yapmalısınız.");
        return;
    }

    const mCanvas = document.getElementById("mainCanvas");
    const mCtx = mCanvas.getContext("2d");
    
    // Mevcut grid'in kopyasını oluştur (Sadece 1 birim yayılma için şart)
    let yeniGrid = JSON.parse(JSON.stringify(grid));

    // --- 4 BİRİM YOL KURALI ---
    function yolBariyeriVarMi(y, x, dy, dx) {
        let yolSayaci = 0;
        for (let i = 1; i <= 4; i++) {
            let ny = y + (dy * i);
            let nx = x + (dx * i);
            
            if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                // harita.js'de yol değeri 3 olarak tanımlanmış
                if (grid[ny][nx] === 3) {
                    yolSayaci++;
                } else {
                    break; 
                }
            }
        }
        return yolSayaci >= 4; // Eğer 4 veya daha fazla yol varsa TRUE döner
    }

    // Grid taraması
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x] === 1) { // Sadece yangın (1) olan yerlere bak
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        if (dy === 0 && dx === 0) continue;

                        let ny = y + dy;
                        let nx = x + dx;

                        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                            // Eğer hedef yol (3) değilse ve bariyer yoksa
                            if (grid[ny][nx] !== 3 && grid[ny][nx] !== 1) {
                                if (!yolBariyeriVarMi(y, x, dy, dx)) {
                                    yeniGrid[ny][nx] = 1;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Global grid'i güncelle
    grid = yeniGrid;

    // harita.js içindeki çizim fonksiyonunu tetikle
    if (typeof matrisiEkranaCiz === "function") {
        matrisiEkranaCiz(mCtx);
        console.log("Ekran güncellendi.");
    } else {
        console.error("Hata: matrisiEkranaCiz fonksiyonu bulunamadı!");
    }
}

// Buton ID'si HTML'de neyse onu buraya yazmalısın (Örn: tahminBtn)
document.addEventListener("click", function(e) {
    if (e.target && (e.target.id === 'tahminBtn' || e.target.innerText === 'TAHMİN')) {
        yanginYayiliminiHesapla();
    }
});