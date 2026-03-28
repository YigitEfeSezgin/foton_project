// astar.js - Matris Odaklı ve Atlama Yetenekli A*

function solveAStar() {
    console.log("A* Matris Analizi Başlatıldı...");

    // 1. Veri Kontrolü
    if (typeof grid === 'undefined' || grid.length === 0 || points.length < 2) {
        console.error("Hata: Grid matrisi veya noktalar bulunamadı.");
        return;
    }

    const scale = (typeof cellSize !== 'undefined') ? cellSize : 15; 
    
    // Koordinatları Grid sistemine çevir ve matris sınırları içinde tut (Hata Koruması)
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

        for (let dx = -4; dx <= 4; dx++) {
            for (let dy = -4; dy <= 4; dy++) {
                if (dx === 0 && dy === 0) continue; 
                if (Math.abs(dx) !== Math.abs(dy) && dx !== 0 && dy !== 0) continue;

                let nx = current.x + dx;
                let ny = current.y + dy;

                // --- KRİTİK HATA KORUMASI ---
                if (ny < 0 || ny >= rows || nx < 0 || nx >= cols) continue;
                if (!grid[ny] || grid[ny][nx] === undefined) continue; 
                if (closedSet.has(`${nx},${ny}`)) continue;

                const terrainType = grid[ny][nx]; 
                const moveCost = costMap[terrainType] || 20;

                if (moveCost >= 999) continue; 

                let distance = Math.sqrt(dx * dx + dy * dy);
                let gScore = current.g + (terrainType === 3 ? distance : distance * moveCost);
                
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
    alert("Matris üzerinde güvenli bir yol bulunamadı!");
}

function drawFinalPath(node, scale) {
    ctx.beginPath();
    ctx.strokeStyle = "#000080"; 
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.moveTo(node.x * scale + scale / 2, node.y * scale + scale / 2);
    while (node.parent) {
        node = node.parent;
        ctx.lineTo(node.x * scale + scale / 2, node.y * scale + scale / 2);
    }
    ctx.stroke();
}