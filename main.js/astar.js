// astar.js - Gelişmiş A* Algoritması (8 Yönlü + 4 Kare Menzilli Atlama)

function solveAStar() {
    console.log("A* Algoritması başlatıldı...");

    // 1. Veri Kontrolü
    if (typeof points === 'undefined' || points.length < 2 || typeof grid === 'undefined') {
        console.error("Hata: Başlangıç/Bitiş noktaları veya harita verisi (grid) bulunamadı.");
        return;
    }

    // harita.js içindeki cellSize (15) ile senkronize oluyoruz
    const scale = (typeof cellSize !== 'undefined') ? cellSize : 15;
    
    const start = { 
        x: Math.floor(points[0].x / scale), 
        y: Math.floor(points[0].y / scale) 
    };
    const end = { 
        x: Math.floor(points[1].x / scale), 
        y: Math.floor(points[1].y / scale) 
    };

    let openSet = [];
    let closedSet = new Set();

    // Başlangıç düğümünü ekle
    openSet.push({
        x: start.x, y: start.y,
        g: 0,
        h: Math.abs(start.x - end.x) + Math.abs(start.y - end.y),
        f: 0,
        parent: null
    });

    while (openSet.length > 0) {
        // En düşük f skoruna sahip düğümü bul
        let currentIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[currentIndex].f) currentIndex = i;
        }
        let current = openSet[currentIndex];

        // HEDEFE ULAŞILDI MI?
        if (current.x === end.x && current.y === end.y) {
            console.log("Hedef bulundu, rota çiziliyor...");
            drawFinalPath(current, scale);
            return;
        }

        openSet.splice(currentIndex, 1);
        closedSet.add(`${current.x},${current.y}`);

        // --- 8 YÖNLÜ VE 4 KARE MENZİLLİ TARAMA (Atlama Mantığı) ---
        // dx ve dy: -4 ile +4 arası tarama yaparak 4 kare ötedeki '3' (Yol) hücrelerini görür.
        for (let dx = -4; dx <= 4; dx++) {
            for (let dy = -4; dy <= 4; dy++) {
                if (dx === 0 && dy === 0) continue; // Kendini atla

                // Sadece 8 ana yönü kontrol et (Yatay, Dikey ve Tam Çaprazlar)
                // Bu, 4 birimlik bir "yıldız" şeklinde tarama yapar.
                if (Math.abs(dx) !== Math.abs(dy) && dx !== 0 && dy !== 0) continue;

                let n = { x: current.x + dx, y: current.y + dy };

                // Harita sınırları ve Kapalı liste kontrolü
                if (n.x < 0 || n.x >= cols || n.y < 0 || n.y >= rows || closedSet.has(`${n.x},${n.y}`)) continue;

                const terrainType = grid[n.y][n.x];
                const baseCost = costMap[terrainType] || 20;

                // Yangın (1) olan yerden asla geçme
                if (baseCost >= 900) continue;

                // MESAFE VE MALİYET HESABI
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                // Eğer hedef hücre '3' (Yol) ise, aradaki boşluğu (4 kareye kadar) atlayabilir.
                // Yolun maliyetini çok düşük tutuyoruz (distance * 1)
                let stepCost = (terrainType === 3) ? (distance * 1) : (distance * baseCost);
                
                let gScore = current.g + stepCost;

                let existingNode = openSet.find(o => o.x === n.x && o.y === n.y);

                if (!existingNode) {
                    let h = Math.abs(n.x - end.x) + Math.abs(n.y - end.y);
                    openSet.push({
                        x: n.x, y: n.y,
                        g: gScore, h: h, f: gScore + h,
                        parent: current
                    });
                } else if (gScore < existingNode.g) {
                    existingNode.g = gScore;
                    existingNode.f = existingNode.g + existingNode.h;
                    existingNode.parent = current;
                }
            }
        }
    }

    console.warn("A* başarısız: Yol bulunamadı.");
    alert("Güvenli bir yol bulunamadı! Kırmızı bölgeler yolu tamamen kapatıyor olabilir.");
}

// Yolu Canvas üzerine LACİVERT olarak çizen fonksiyon
function drawFinalPath(node, scale) {
    // Çizimin resmin ve noktaların üzerinde görünmesini sağla
    ctx.save(); 
    ctx.beginPath();
    
    ctx.strokeStyle = "#000080"; // Lacivert (Navy Blue)
    ctx.lineWidth = 6;            // Kalın ve belirgin çizgi
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Rotayı belirginleştirmek için hafif beyaz gölge
    ctx.shadowColor = "white";
    ctx.shadowBlur = 4;

    // Sondan başa doğru koordinatları takip et
    ctx.moveTo(node.x * scale + scale / 2, node.y * scale + scale / 2);

    while (node.parent) {
        node = node.parent;
        ctx.lineTo(node.x * scale + scale / 2, node.y * scale + scale / 2);
    }

    ctx.stroke();
    ctx.restore(); // Canvas ayarlarını eski haline getir

    console.log("Rota başarıyla çizildi.");
}