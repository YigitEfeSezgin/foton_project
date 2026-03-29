// tahmin.js - rüzgara göre yönlendişrme

function yanginYayiliminiHesapla() {
    if (typeof grid === 'undefined' || grid.length === 0) {
        console.error("Grid bulunamadı!");
        return;
    }

    const mCanvas = document.getElementById("mainCanvas");
    if (!mCanvas) return;
    const mCtx = mCanvas.getContext("2d");

    // Hızlı Kopyalama
    let yeniGrid = grid.map(row => [...row]);

    let hiz = window.guncelRuzgar ? window.guncelRuzgar.hiz : 0;
    let derece = window.guncelRuzgar ? window.guncelRuzgar.derece : 0;

    // rüzgarsız 2 br
    let minDy = -2, maxDy = 2;
    let minDx = -2, maxDx = 2;

    if (hiz > 5) { // rüzgar 5den bğyükse savur
        
        // 20 den bğyğkse sıçrama 5  değilse 3
        let siddet = hiz > 20 ? 5 : 3; 

        //rüzgarın ters yönüne itecek
        if (derece >= 315 || derece < 45) { 
            
            maxDy = siddet; minDy = -1;
        } 
        else if (derece >= 45 && derece < 135) { 
            minDx = -siddet; maxDx = 1;
        } 
        else if (derece >= 135 && derece < 225) { 
            minDy = -siddet; maxDy = 1;
        } 
        else if (derece >= 225 && derece < 315) { 
            maxDx = siddet; minDx = -1;
        }
    }


    function yolBariyeriVarMi(y, x, hedefY, hedefX) {
        let yonY = hedefY === y ? 0 : (hedefY > y ? 1 : -1);
        let yonX = hedefX === x ? 0 : (hedefX > x ? 1 : -1);
        
        let adimSayisi = Math.max(Math.abs(hedefY - y), Math.abs(hedefX - x));

        for (let i = 1; i <= adimSayisi; i++) {
            let ny = y + (yonY * i);
            let nx = x + (yonX * i);
            if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                if (grid[ny][nx] === 3) return true; // yolu bekler
            }
        }
        return false; 
    }

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x] === 1) { 
                
                for (let dy = minDy; dy <= maxDy; dy++) {
                    for (let dx = minDx; dx <= maxDx; dx++) {
                        if (dy === 0 && dx === 0) continue;

                        let ny = y + dy;
                        let nx = x + dx;

                        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                            if ((grid[ny][nx] === 0 || grid[ny][nx] === 2) && grid[ny][nx] !== 1) {
                                if (!yolBariyeriVarMi(y, x, ny, nx)) {
                                    yeniGrid[ny][nx] = 1;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    grid = yeniGrid; 

    if (typeof matrisiEkranaCiz === "function") {
        matrisiEkranaCiz(mCtx); 
        
        if (typeof tahminiAtesiCiz === "function") {
            tahminiAtesiCiz(mCtx);  //haritayı çizer
        }
        console.log(`Tahmin başarıyla çizildi. Rüzgar etkisi uygulandı.`);
    }
}

// butona basınca gelir
document.addEventListener("click", function(e) {
    if (e.target && (e.target.id === 'tahminBtn' || e.target.innerText === 'TAHMİN')) {
        window.tahminAktifMi = true; 
        yanginYayiliminiHesapla();
    }
});