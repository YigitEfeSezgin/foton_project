// api.js - rüzgar simülasyonu için 

async function ruzgarVerisiAl(lat = 36.78, lon = 31.44) { 
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        
        let gercekYon = 150; 
        try {
            const response = await fetch(url);
            const data = await response.json();
            gercekYon = data.current_weather.winddirection; 
        } catch(e) {
            console.warn("Yön API'den alınamadı, varsayılan kullanılıyor.");
        }

        let canliYon = Math.round(gercekYon + (Math.random() * 6 - 3));

        
        if (!window.mevcutRuzgarHizi) {
            window.mevcutRuzgarHizi = (Math.random() * 15) + 15; 
        } else {
            let degisim = (Math.random() * 5) - 2.5; 
            window.mevcutRuzgarHizi += degisim;

            if (window.mevcutRuzgarHizi < 5) window.mevcutRuzgarHizi = 5 + Math.random();
            if (window.mevcutRuzgarHizi > 45) window.mevcutRuzgarHizi = 45 - Math.random();
        }

        let canliHiz = window.mevcutRuzgarHizi.toFixed(1); 

        console.log(`Sensör: ${canliHiz} km/s, Yön: ${canliYon}°`);
        
        return {
            hiz: parseFloat(canliHiz),
            derece: canliYon
        };
    } catch (error) {
        console.error("API Hatası:", error);
        return { hiz: 20, derece: 150 }; 
    }
}