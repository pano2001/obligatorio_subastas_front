const LADO_MAXIMO = 1600;
const CALIDAD = 0.8;

export const comprimirImagen = (archivo) => {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(archivo);
        const imagen = new Image();

        imagen.onload = () => {
            const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));

            const canvas = document.createElement("canvas");
            canvas.width = Math.round(imagen.width * escala);
            canvas.height = Math.round(imagen.height * escala);

            const contexto = canvas.getContext("2d");
            contexto.fillStyle = "#ffffff";
            contexto.fillRect(0, 0, canvas.width, canvas.height);
            contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height);

            URL.revokeObjectURL(url);

            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error("No se pudo procesar la imagen"));
                const nombre = archivo.name.replace(/\.[^.]+$/, "") + ".jpg";
                resolve(new File([blob], nombre, { type: "image/jpeg" }));
            }, "image/jpeg", CALIDAD);
        };

        imagen.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`No se pudo leer ${archivo.name}`));
        };

        imagen.src = url;
    });
}

export const armarFormDataImagenes = (archivos) => {
    return Promise.all(archivos.map(comprimirImagen))
        .then((comprimidas) => {
            const formData = new FormData();
            comprimidas.forEach((archivo) => {
                formData.append("imagenes", archivo);
            });
            return formData;
        });
}

export const mensajeErrorSubida = (err) => {
    if (!err.response) return "Las fotos son muy pesadas o el servidor no respondió";
    if (err.response.status === 413) return "Las fotos son muy pesadas";
    return err.response.data?.message || "No se pudieron subir las imágenes";
}