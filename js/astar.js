// astar.js - Güvenlik ve Mesafe Odaklı A*

function solveAStar() {
    console.log("A* Matris Analizi Başlatıldı...");

    if (typeof grid === 'undefined' || grid.length === 0 || points.length < 2) {
        console.error("Hata: Grid matrisi veya noktalar bulunamadı.");
        return;
    }

    const scale = (typeof cellSize !== 'undefined') ? cellSize : 15; 
    
    const start = { 
        x: Math.max(0, Math.min(Math.floor(points[0].x / scale), cols - 1)), 
        y: Math.max(0, Math.min(Math.floor(points[0].y / scale), rows - 1)) 
    };
    const end = { 
        x: Math.max(0, Math.min(Math.floor(points[1].x / scale), cols - 1)), 
        y: Math.max(0, Math.min(Math.floor(points[1].y / scale), rows - 1)) 
    };

    let openSet = []; 
    let closedSet = new Set();

    openSet.push({
        x: start.x, y: start.y,
        g: 0,
        h: Math.abs(start.x - end.x) + Math.abs(start.y - end.y),
        f: 0,
        parent: null
    });

    while (openSet.length > 0) {
        let currentIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[currentIndex].f) currentIndex = i;
        }
        let current = openSet[currentIndex];

        if (current.x === end.x && current.y === end.y) {
            console.log("Hedef bulundu!");
            drawFinalPath(current, scale);
            return;
        }

        openSet.splice(currentIndex, 1);
        closedSet.add(`${current.x},${current.y}`);

        // --- KOMŞU TARAMASI (Maksimum 2 Kare Atlama) ---
        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                if (dx === 0 && dy === 0) continue; 
                if (Math.abs(dx) !== Math.abs(dy) && dx !== 0 && dy !== 0) continue;

                let nx = current.x + dx;
                let ny = current.y + dy;

                if (ny < 0 || ny >= rows || nx < 0 || nx >= cols) continue;
                if (!grid[ny] || grid[ny][nx] === undefined) continue; 
                if (closedSet.has(`${nx},${ny}`)) continue;

                // --- GÜVENLİK KONTROLÜ 1: Yangın veya Duman Üstü ---
                const terrainType = grid[ny][nx]; 
                if (terrainType === 1 || terrainType === 2) continue;

                // --- GÜVENLİK KONTROLÜ 2: Yangına 8 Kare Mesafe (Güvenlik Koridoru) ---
                if (checkFireProximity(nx, ny, 8)) continue;

                const moveCost = costMap[terrainType] || 20;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                // Maliyeti ağırlaştırıyoruz (Özellikle orman için)
                let stepCost = (terrainType === 3) ? distance : (distance * moveCost * 5);
                let gScore = current.g + stepCost;
                
                let existingNode = openSet.find(o => o.x === nx && o.y === ny);

                if (!existingNode) {
                    let h = Math.abs(nx - end.x) + Math.abs(ny - end.y);
                    openSet.push({
                        x: nx, y: ny,
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
    alert("Yangından 8 kare uzakta kalacak güvenli bir yol bulunamadı!");
}

/**
 * Belirli bir hücrenin çevresinde yangın olup olmadığını kontrol eder.
 * @param {number} x Hücre X koordinatı
 * @param {number} y Hücre Y koordinatı
 * @param {number} radius Kontrol yarıçapı (8 kare)
 */
function checkFireProximity(x, y, radius) {
    for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
            let cx = x + i;
            let cy = y + j;
            if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
                if (grid[cy][cx] === 1) return true; // Çevrede 1 (Yangın) varsa geçiş yasak
            }
        }
    }
    return false;
}

function drawFinalPath(node, scale) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#000080"; // Lacivert
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    
    // Beyaz dış ışıma (Görünürlük için)
    ctx.shadowColor = "white";
    ctx.shadowBlur = 8;

    ctx.moveTo(node.x * scale + scale / 2, node.y * scale + scale / 2);
    while (node.parent) {
        node = node.parent;
        ctx.lineTo(node.x * scale + scale / 2, node.y * scale + scale / 2);
    }
    ctx.stroke();
    ctx.restore();
}