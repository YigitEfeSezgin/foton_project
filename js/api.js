// api.js - Gerçekçi Rüzgar Simülasyonu (Random Walk Algorithm)

async function ruzgarVerisiAl(lat = 36.78, lon = 31.44) { 
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        
        // Yönü api'den alıyoruz ama API çökükse diye bir varsayılan ekliyoruz
        let gercekYon = 150; 
        try {
            const response = await fetch(url);
            const data = await response.json();
            gercekYon = data.current_weather.winddirection; 
        } catch(e) {
            console.warn("Yön API'den alınamadı, varsayılan kullanılıyor.");
        }

        // Pusula okunun hafif titremesi için yöne -3 ile +3 derece dalgalanma
        let canliYon = Math.round(gercekYon + (Math.random() * 6 - 3));

        // === EFSANE KISIM: GERÇEKÇİ RÜZGAR HIZI ALGORİTMASI ===
        
        // Eğer rüzgar hızı henüz belirlenmediyse (yani fotoğraf yeni yüklendiyse)
        // 15 ile 30 arasında rastgele bir başlangıç değeri ver (15 + (0 ile 15 arası))
        if (!window.mevcutRuzgarHizi) {
            window.mevcutRuzgarHizi = (Math.random() * 15) + 15; 
        } else {
            // Eğer zaten bir hız varsa, üzerine -2.5 ile +2.5 arasında küçük bir artış/azalış ekle
            let degisim = (Math.random() * 5) - 2.5; 
            window.mevcutRuzgarHizi += degisim;

            // Güvenlik kilidi: Rüzgar çok saçma yerlere gitmesin (5'in altına düşmesin, 45'i geçmesin)
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