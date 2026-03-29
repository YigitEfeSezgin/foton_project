

imageInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                
                canvas.style.display = "block";
                canvas.width = img.width;
                canvas.height = img.height;
                
                ctx.drawImage(img, 0, 0);
                
                console.log("Sistem Hazır: Fotoğraf ortak Canvas'a yüklendi.");
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});