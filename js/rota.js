// Rota.js - başlangıç ve bitişi ekleme

console.log("Rota.js yüklendi, canvas durumu:", canvas);

let img = new Image();
let points = []; 

// resim yğkleme
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.style.display = "inline-block";
                
                // resim değişince
                if (typeof originalImageData !== 'undefined') originalImageData = null;
                
                resetLogic(); 
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// click
canvas.addEventListener('click', (e) => {
    if (!img.src) return;

    if (points.length === 2) {
        resetLogic();
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    points.push({ 
        x: Math.round(x), 
        y: Math.round(y)
    });

    draw();
    updateStatus(); // tetikleyici
});

function draw() {
   
    if (typeof originalImageData !== 'undefined' && originalImageData !== null) {
        ctx.putImageData(originalImageData, 0, 0);

        //aleyna
        if (typeof tahminiAtesiCiz === "function") {
            tahminiAtesiCiz(ctx);
        }//aleyna bitiş 


    } else {
        ctx.drawImage(img, 0, 0);
    }

    points.forEach((p, index) => {
        ctx.beginPath();
        let radius = 15;
        let color = (index === 0) ? '#27ae60' : '#c0392b'; 
        
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
    });
}


function updateStatus() {
    if (points.length === 1) {
        status.innerHTML = "<b style='color:#27ae60'>BAŞLANGIÇ seçildi.</b> Şimdi <span style='color:#c0392b'>BİTİŞ'i</span> seçin.";
    } 
    else if (points.length === 2) {
        status.innerHTML = "<b style='color:#000080'>ROTA HESAPLANIYOR...</b>";
        
        console.log("📍 Otomatik hesaplama başlatılıyor...");

       
        setTimeout(() => {
            if (typeof solveAStar === "function") {
                solveAStar(); 
                status.innerHTML = "<b style='color:#000080'>Rota Çizildi!</b> Temizlemek için ekrana tıklayın.";
            } else {
                console.error("Hata: astar.js dosyasındaki solveAStar fonksiyonuna ulaşılamıyor!");
            }
        }, 100); 
    }
}


function resetLogic() {
    points = [];
    
    if (typeof originalImageData !== 'undefined' && originalImageData !== null) {// sıfırlarken analşli resim varsa yoksa analizsiz
        ctx.putImageData(originalImageData, 0, 0);

        //aleyna
        if (typeof tahminiAtesiCiz === "function") {
            tahminiAtesiCiz(ctx);
        }
        //aleyna bitiş 


    } else {
        ctx.drawImage(img, 0, 0);
    }
    
    status.innerHTML = "Başlangıç noktasını seçmek için haritaya tıklayın.";
}