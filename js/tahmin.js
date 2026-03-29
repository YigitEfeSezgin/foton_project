// tahmin.js - Rüzgar Yönü ve Şiddetine Göre Dinamik Yangın Yayılımı Algoritması

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

    // === HACKATHON ŞOVU: RÜZGAR YÖNÜNE GÖRE YAYILIM MENZİLİ HESAPLAMA ===
    let hiz = window.guncelRuzgar ? window.guncelRuzgar.hiz : 0;
    let derece = window.guncelRuzgar ? window.guncelRuzgar.derece : 0;

    // Varsayılan, rüzgarsız yayılım (Her yöne 2 birim)
    let minDy = -2, maxDy = 2;
    let minDx = -2, maxDx = 2;

    if (hiz > 5) { // Eğer rüzgar 5 km/s'den güçlüyse alevleri savurmaya başla
        
        // Rüzgarın hızı 20'den büyükse sıçrama mesafesini 5'e çıkar, değilse 3 yap
        let siddet = hiz > 20 ? 5 : 3; 

        // Rüzgar Nereden Esiyor? Kural: Ateşi TAM TERSİ yöne savur!
        if (derece >= 315 || derece < 45) { 
            // KUZEY RÜZGARI (Güneye iter, Y ekseni aşağı artar)
            maxDy = siddet; minDy = -1;
        } 
        else if (derece >= 45 && derece < 135) { 
            // DOĞU RÜZGARI (Batıya iter, X ekseni sola azalır)
            minDx = -siddet; maxDx = 1;
        } 
        else if (derece >= 135 && derece < 225) { 
            // GÜNEY RÜZGARI (Kuzeye iter, Y ekseni yukarı azalır)
            minDy = -siddet; maxDy = 1;
        } 
        else if (derece >= 225 && derece < 315) { 
            // BATI RÜZGARI (Doğuya iter, X ekseni sağa artar)
            maxDx = siddet; minDx = -1;
        }
    }

    // --- ESNEK YOL BARİYERİ (Sıçrama menziline göre uyarlandı) ---
    function yolBariyeriVarMi(y, x, hedefY, hedefX) {
        let yonY = hedefY === y ? 0 : (hedefY > y ? 1 : -1);
        let yonX = hedefX === x ? 0 : (hedefX > x ? 1 : -1);
        
        let adimSayisi = Math.max(Math.abs(hedefY - y), Math.abs(hedefX - x));

        for (let i = 1; i <= adimSayisi; i++) {
            let ny = y + (yonY * i);
            let nx = x + (yonX * i);
            if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                if (grid[ny][nx] === 3) return true; // Yol duvarına çarptı!
            }
        }
        return false; 
    }

    // --- YAYILIMI UYGULA ---
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x] === 1) { // Sadece yangın olan hücreler yayılabilir
                
                // Rüzgara göre dinamikleşmiş sınırlar içinde döngü
                for (let dy = minDy; dy <= maxDy; dy++) {
                    for (let dx = minDx; dx <= maxDx; dx++) {
                        if (dy === 0 && dx === 0) continue;

                        let ny = y + dy;
                        let nx = x + dx;

                        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                            // Gidilecek yer ormansa (0) veya dumansa (2) ve yol bariyeri yoksa yak!
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

    // 4. KRİTİK NOKTA: Haritayı güncelle ve ekrana bas
    grid = yeniGrid; 

    if (typeof matrisiEkranaCiz === "function") {
        matrisiEkranaCiz(mCtx); 
        
        // Şeffaf alevi rüzgara göre genişlemiş yeni haliyle çiz
        if (typeof tahminiAtesiCiz === "function") {
            tahminiAtesiCiz(mCtx);
        }
        console.log(`Tahmin başarıyla çizildi. Rüzgar etkisi uygulandı.`);
    }
}

// Buton Bağlantısı
document.addEventListener("click", function(e) {
    if (e.target && (e.target.id === 'tahminBtn' || e.target.innerText === 'TAHMİN')) {
        window.tahminAktifMi = true; // Kilidi aç (harita.js içindeki fonksiyonlar için)
        yanginYayiliminiHesapla();
    }
});