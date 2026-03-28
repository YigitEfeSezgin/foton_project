// tahmin.js - Optimize Edilmiş Versiyon (Hızlı Yayılım)

function yanginYayiliminiHesapla() {
    if (typeof grid === 'undefined' || grid.length === 0) return;

    const mCanvas = document.getElementById("mainCanvas");
    const mCtx = mCanvas.getContext("2d");
    
    // 1. ADIM: Sadece yanan hücrelerin listesini çıkar (Performans anahtarı)
    let yananlar = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x] === 1) {
                yananlar.push({y, x});
            }
        }
    }

    let yeniGrid = JSON.parse(JSON.stringify(grid));

    // Yol bariyeri kontrolü (4 birim kuralı)
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

    // 2. ADIM: Sadece yanan hücrelerin etrafını tara (Tüm haritayı değil!)
    yananlar.forEach(hucre => {
        // 2 birim yayılım için -2'den +2'ye
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                if (dy === 0 && dx === 0) continue;

                let ny = hucre.y + dy;
                let nx = hucre.x + dx;

                if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                    // Eğer hedef yanabilir durumdaysa
                    if (grid[ny][nx] !== 3 && grid[ny][nx] !== 1) {
                        
                        // Yön tespiti (Bariyer kontrolü için)
                        let yonY = dy === 0 ? 0 : dy / Math.abs(dy);
                        let yonX = dx === 0 ? 0 : dx / Math.abs(dx);

                        if (!yolBariyeriVarMi(hucre.y, hucre.x, yonY, yonX)) {
                            yeniGrid[ny][nx] = 1;
                        }
                    }
                }
            }
        }
    });

    grid = yeniGrid;

    if (typeof matrisiEkranaCiz === "function") {
        matrisiEkranaCiz(mCtx);
    }
}