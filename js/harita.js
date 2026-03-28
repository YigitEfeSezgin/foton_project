// --- js/harita.js (SENİN KODLARIN) ---

const canvas = document.getElementById('haritaCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const img = new Image();

// DİKKAT: Fotoğrafının adını buraya doğru yazdığından emin ol!
img.src = 'img/yangın_1.png'; 

// Hassasiyet ayarı (Matrisin boyutları - 50x50 ızgara)
const SATIR = 50; 
const SUTUN = 50; 

// Bu değişkeni "export" ediyoruz ki A* yazan arkadaşın astar.js içinden alabilsin.
export let haritaMatrisi = []; 

img.onload = function() {
    // 1. Canvas'ı fotoğrafa göre boyutlandır ve fotoğrafı çiz
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const hucreGenisligi = canvas.width / SUTUN;
    const hucreYuksekligi = canvas.height / SATIR;

    let geciciMatris = []; 

    // 2. AŞAMA: RENK OKUMA VE SINIFLANDIRMA
    for (let y = 0; y < SATIR; y++) {
        let satirDizisi = [];
        for (let x = 0; x < SUTUN; x++) {
            const pikselX = Math.floor((x * hucreGenisligi) + (hucreGenisligi / 2));
            const pikselY = Math.floor((y * hucreYuksekligi) + (hucreYuksekligi / 2));

            const pikselVerisi = ctx.getImageData(pikselX, pikselY, 1, 1).data;
            const r = pikselVerisi[0];
            const g = pikselVerisi[1];
            const b = pikselVerisi[2];

            let hucreDegeri = 0; // Varsayılan: 0 (Yol / Güvenli)

            // RENK AYARLARI (Senin fotoğrafına göre test edip sayıları değiştirebilirsin)
            if (r > 150 && g < 100 && b < 100) {
                hucreDegeri = 9; // Kırmızı/Turuncu yoğunsa -> Yangın
            } else if (g > 100 && r < 120 && b < 120) {
                hucreDegeri = 1; // Yeşil yoğunsa -> Orman
            }

            satirDizisi.push(hucreDegeri);
        }
        geciciMatris.push(satirDizisi); 
    }

    // 3. AŞAMA: YANGIN SIÇRAMA RİSKİ (Etrafı 8 Yapma Algoritması)
    // Orijinal 9'ları kaybetmemek için matrisin kopyasını alıyoruz
    haritaMatrisi = JSON.parse(JSON.stringify(geciciMatris)); 

    for (let y = 0; y < SATIR; y++) {
        for (let x = 0; x < SUTUN; x++) {
            if (geciciMatris[y][x] === 9) { // Eğer bu kare yanıyorsa
                // Üst, Alt, Sol ve Sağ komşuları 8 (Tehlikeli) yap
                if (y > 0 && haritaMatrisi[y-1][x] !== 9) haritaMatrisi[y-1][x] = 8; 
                if (y < SATIR - 1 && haritaMatrisi[y+1][x] !== 9) haritaMatrisi[y+1][x] = 8; 
                if (x > 0 && haritaMatrisi[y][x-1] !== 9) haritaMatrisi[y][x-1] = 8; 
                if (x < SUTUN - 1 && haritaMatrisi[y][x+1] !== 9) haritaMatrisi[y][x+1] = 8; 
            }
        }
    }

    // 4. AŞAMA: EKRANDA GÖRSELLEŞTİRME (Kareleri ve Sayıları Çizme)
    for (let y = 0; y < SATIR; y++) {
        for (let x = 0; x < SUTUN; x++) {
            const deger = haritaMatrisi[y][x];
            
            // Izgara çizgileri
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.strokeRect(x * hucreGenisligi, y * hucreYuksekligi, hucreGenisligi, hucreYuksekligi);

            // Renklere göre sayılar
            if (deger === 9) ctx.fillStyle = "red";
            else if (deger === 8) ctx.fillStyle = "orange";
            else if (deger === 1) ctx.fillStyle = "#00ff00"; // Açık yeşil
            else ctx.fillStyle = "white";

            ctx.font = "14px Arial"; // Yazı boyutu
            ctx.fillText(deger, (x * hucreGenisligi) + 4, (y * hucreYuksekligi) + 16);
        }
    }

    // Konsola Tablo Olarak Yazdır
    console.log("Matris Başarıyla Üretildi! Kırmızı=9, Turuncu=8, Yeşil=1, Beyaz=0");
    console.table(haritaMatrisi);
    
    // A* yazan arkadaşa sinyal gönderiyoruz: "Matris hazır, okuyabilirsin!"
    document.dispatchEvent(new Event('matrisHazir'));
};