// api.js - Şifresiz/Key'siz Açık Kaynak Rüzgar Verisi (Open-Meteo)

// Varsayılan koordinatlar: Antalya / Manavgat (Yangın bölgesi örneği)
async function ruzgarVerisiAl(lat = 36.78, lon = 31.44) { 
    try {
        // Open-Meteo API key İSTEMEZ! Direkt çalışır.
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const response = await fetch(url);
        const data = await response.json();
        
        const ruzgarHizi = data.current_weather.windspeed; // km/s cinsinden
        const ruzgarYonu = data.current_weather.winddirection; // Derece (0:Kuzey, 90:Doğu, 180:Güney, 270:Batı)

        console.log(`Canlı Rüzgar Verisi Geldi: ${ruzgarHizi} km/s, Yön: ${ruzgarYonu}°`);
        
        return {
            hiz: ruzgarHizi,
            derece: ruzgarYonu
        };
    } catch (error) {
        console.error("API Hatası (İnternet kopmuş olabilir):", error);
        // Hackathon taktiği: İnternet kopsa bile sistem çökmesin, sahte veri dönsün
        return { hiz: 12, derece: 90 }; // Doğuya esen sahte rüzgar
    }
}