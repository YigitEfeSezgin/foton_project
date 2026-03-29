// harita.js- gridere ayıracak olan alan 

let grid = []; 
let rows, cols;
const cellSize = 10; 
let originalImageData = null;
let tahminAktifMi = false;

const renkSistemi = {
    3: "rgba(0, 100, 255, 0.4)",  // yol:mavi
    1: "rgba(255, 0, 0, 0.6)",    // yangın:kırmızı
    0: "rgba(0, 255, 0, 0.3)",    // orman:yeşil
    2: "rgba(150, 150, 150, 0.7)" // duman:gri
};

const costMap = {
    3: 1,   
    1: 999, 
    0: 5,   
    2: 999  
};

function haritayiAnalizEt() {
    window.tahminAktifMi = false;
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

    // renk ayarları
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const pxIndex = ((y * cellSize) * mCanvas.width + (x * cellSize)) * 4;
            const r = imageData[pxIndex];
            const g = imageData[pxIndex + 1];
            const b = imageData[pxIndex + 2];

            // kırmızı
            if (r > 180 && g < 100 && b < 100) {
                grid[y][x] = 1;
            }
            // duman
            else if (r >= 25 && r <= 120 && g >= 25 && g <= 120 && b >= 30 && b <= 130 && Math.abs(r - g) <= 15) {
                grid[y][x] = 2; 
            }
            // yol
            else if (r > 150 && g > 110 && b > 60 && r > g && g > b) {
                grid[y][x] = 3;
            }
            // orman
            else {
                grid[y][x] = 0;
            }
        }
    }

    // duman menzil
    let tempGrid = JSON.parse(JSON.stringify(grid));
    let dumanMenzili = 12; // Alevden 12 br uzaklık mac

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
                if (!yakinindaAlevVar) tempGrid[y][x] = 0; 
            }
        }
    }
    grid = tempGrid;

    // dumanların hepsini algılamamsı için 
    let cleanGrid = JSON.parse(JSON.stringify(grid));
    let mesafeLimit = 10; // en fazla 10 br uzaklık kabul
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x] === 2) { 
                let alevVarMi = false;
                for (let dy = -mesafeLimit; dy <= mesafeLimit; dy++) {
                    for (let dx = -mesafeLimit; dx <= mesafeLimit; dx++) {
                        let ny = y + dy, nx = x + dx;
                        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && grid[ny][nx] === 1) {
                            alevVarMi = true; break;
                        }
                    }
                    if (alevVarMi) break;
                }
                if (!alevVarMi) cleanGrid[y][x] = 0; // orman yap
            }
        }
    }
    grid = cleanGrid;


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

    // yol büyütme
    let roadTempGrid = JSON.parse(JSON.stringify(grid));
    for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
            if (grid[y][x] === 3) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        // birbirlerinin üzerine gwlince
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
    if (originalImageData) {
        ctx.putImageData(originalImageData, 0, 0);
    } else {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
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
    document.getElementById("status").innerHTML = "<b>Analiz Tamamlandı. Rota seçebilirsiniz.</b>" ;
}


// 
function tahminiAtesiCiz(ctx) {
    if(!window.tahminAktifMi) return;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // yangını bul 
            if (grid[y][x] === 1) { 
                ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; 
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}




let ruzgarInterval = null; 

async function ruzgariOtomatikGuncelle() {
    const ruzgarKutusu = document.getElementById("ruzgarKutusu");
    if (!ruzgarKutusu) return; 

    if (typeof ruzgarVerisiAl === "function") {
        
        let lat = window.secilenLat || 36.78;
        let lon = window.secilenLon || 31.44;
        let sehir = window.secilenSehir || "Antalya";

        window.guncelRuzgar = await ruzgarVerisiAl(lat, lon); 
        
        let aci = window.guncelRuzgar.derece;
        
        // Kutuya hem şehri hem de dönen oku ekliyoruz
        ruzgarKutusu.innerHTML = `
            <h3>🌬️ Canlı Rüzgar Verisi</h3>
            <div style="font-size: 13px; color: #a29bfe; margin-bottom: 8px; margin-top: -5px;">
                📍 <b>Bölge:</b> ${sehir}
            </div>
            <div id="ruzgarIcerik" style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <b>Hız:</b> ${window.guncelRuzgar.hiz} km/s <br><br>
                    <b>Yön:</b> ${window.guncelRuzgar.derece}°
                </div>
                
                <div style="
                    font-size: 45px; 
                    transform: rotate(${aci}deg); 
                    transition: transform 0.5s ease-out; 
                    color: #e67e22; 
                    text-shadow: 0 0 10px rgba(230, 126, 34, 0.5);
                    margin-right: 15px;
                ">
                    ⬇
                </div>
            </div>
        `;
    }
}


const inputElement = document.getElementById("imageInput");
if (inputElement) {
    inputElement.addEventListener("change", function(e) {
        originalImageData = null;
        window.mevcutRuzgarHizi = null; 

        // dosya adına göre yapıyor
        let dosyaAdi = "";
        if (e.target.files && e.target.files.length > 0) {
            dosyaAdi = e.target.files[0].name.toLowerCase();
        }

        // konum eşleştirme
        if (dosyaAdi.includes("izmir")) {
            window.secilenLat = 38.42; window.secilenLon = 27.14; window.secilenSehir = "İzmir / Türkiye";
        } else if (dosyaAdi.includes("mugla")) {
            window.secilenLat = 37.21; window.secilenLon = 28.36; window.secilenSehir = "Muğla / Türkiye";
        } else if (dosyaAdi.includes("canakkale")) {
            window.secilenLat = 40.15; window.secilenLon = 26.40; window.secilenSehir = "Çanakkale / Türkiye";
        } else {
            // varsayılan antalya
            window.secilenLat = 36.78; window.secilenLon = 31.44; window.secilenSehir = "Antalya (Manavgat)";
        }

        document.getElementById("status").innerHTML = `<b>${window.secilenSehir}</b> uydusuna bağlanıldı. Sensörler aktif...`;
        
        if (ruzgarInterval) clearInterval(ruzgarInterval); 
        
        ruzgariOtomatikGuncelle(); 
        ruzgarInterval = setInterval(ruzgariOtomatikGuncelle, 3000); 
    });
}



// analiz butonu
const analizBtnRef = document.getElementById("analizBtn");
if (analizBtnRef) {
    analizBtnRef.addEventListener("click", () => {
        document.getElementById("status").innerHTML = `<b>Analiz ediliyor...</b>`;
        setTimeout(haritayiAnalizEt, 100);
    });
}

// tahmin butonu ve şeffaf çizim kilidi
document.addEventListener("click", function(e) {
    if (e.target && (e.target.id === 'tahminBtn' || e.target.innerText === 'TAHMİN')) {
        window.tahminAktifMi = true; 
    }
});