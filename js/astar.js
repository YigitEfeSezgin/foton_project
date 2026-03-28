// astar.js

function solveAStar() {
    // 1. Verileri rota.js ve harita.js'den çek
    if (points.length < 2 || typeof grid === 'undefined') return;

    // Koordinatları Grid (Hücre) sistemine çevir (cellSize = 5 olduğu için)
    const scale = 5; 
    const start = { x: Math.floor(points[0].x / scale), y: Math.floor(points[0].y / scale) };
    const end = { x: Math.floor(points[1].x / scale), y: Math.floor(points[1].y / scale) };

    let openSet = []; // İncelenecek düğümler
    let closedSet = new Set();

    // Başlangıç düğümü
    openSet.push({
        x: start.x, y: start.y,
        g: 0, // Gerçek maliyet
        h: Math.abs(start.x - end.x) + Math.abs(start.y - end.y), // Kuş uçuşu mesafe
        f: 0,
        parent: null
    });

    while (openSet.length > 0) {
        // En düşük f değerine sahip olanı bul
        let currentIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[currentIndex].f) currentIndex = i;
        }
        let current = openSet[currentIndex];

        // HEDEFE ULAŞTIK MI?
        if (current.x === end.x && current.y === end.y) {
            drawFinalPath(current, scale);
            return;
        }

        openSet.splice(currentIndex, 1);
        closedSet.add(`${current.x},${current.y}`);

        // Komşuları Tara (Sağ, Sol, Yukarı, Aşağı)
        const neighbors = [
            { x: current.x + 1, y: current.y }, { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 }, { x: current.x, y: current.y - 1 }
        ];

        for (let n of neighbors) {
            // Sınır kontrolü
            if (n.x < 0 || n.x >= cols || n.y < 0 || n.y >= rows || closedSet.has(`${n.x},${n.y}`)) continue;

            // --- KRİTİK NOKTA: MALİYET HESABI ---
            const terrainType = grid[n.y][n.x]; // 3, 2, 1 veya 0
            const moveCost = costMap[terrainType]; // 1, 10, 20 veya 999

            if (moveCost >= 999) continue; // Yangın olan yere asla girme!

            let gScore = current.g + moveCost; // Sabit +1 yerine arazinin zorluğunu ekliyoruz
            
            let existingNode = openSet.find(o => o.x === n.x && o.y === n.y);

            if (!existingNode) {
                openSet.push({
                    x: n.x, y: n.y,
                    g: gScore,
                    h: Math.abs(n.x - end.x) + Math.abs(n.y - end.y),
                    f: gScore + (Math.abs(n.x - end.x) + Math.abs(n.y - end.y)),
                    parent: current
                });
            } else if (gScore < existingNode.g) {
                existingNode.g = gScore;
                existingNode.f = existingNode.g + existingNode.h;
                existingNode.parent = current;
            }
        }
    }
    alert("Güvenli bir yol bulunamadı!");
}

// Yolu Canvas'a çizme
function drawFinalPath(node, scale) {
    ctx.beginPath();
    ctx.strokeStyle = "#3498db"; // Mavi rota
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";

    // Merkez noktadan başlatmak için +scale/2 ekliyoruz
    ctx.moveTo(node.x * scale + scale/2, node.y * scale + scale/2);

    while (node.parent) {
        node = node.parent;
        ctx.lineTo(node.x * scale + scale/2, node.y * scale + scale/2);
    }
    ctx.stroke();
}