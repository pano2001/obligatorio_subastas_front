import { useState } from "react"
import { useDispatch } from "react-redux"
import { toast } from "sonner"
import api from "../config/api.config"
import { reemplazarSubasta } from "../features/subastas.slice"

const MAX_IMAGENES = 5;
const MAX_MB = 5;

const ImagenesSubasta = ({ subasta }) => {

    const [archivos, setArchivos] = useState([]);
    const [subiendo, setSubiendo] = useState(false);

    const dispatch = useDispatch();

    const lugaresLibres = MAX_IMAGENES - subasta.imagenes.length;

    const elegirArchivos = (e) => {
        const seleccionados = Array.from(e.target.files);

        const noSonImagenes = seleccionados.some((archivo) => !archivo.type.startsWith("image/"));
        if (noSonImagenes) {
            toast.error("Solo se permiten archivos de imagen");
            e.target.value = "";
            return;
        }

        const pesadas = seleccionados.some((archivo) => archivo.size > MAX_MB * 1024 * 1024);
        if (pesadas) {
            toast.error(`Cada imagen debe pesar menos de ${MAX_MB} MB`);
            e.target.value = "";
            return;
        }

        if (seleccionados.length > lugaresLibres) {
            toast.error(`Solo podés subir ${lugaresLibres} imagen(es) más`);
            e.target.value = "";
            return;
        }

        setArchivos(seleccionados);
        }

        const subir = () => {

            if(archivos.length === 0) return;

            const formData = new FormData();
            archivos.forEach((archivo) => {
                formData.append("imagenes", archivo);
            });

            setSubiendo(true);

            api.post(`/subastas/${subasta._id}/imagenes`, formData)
            .then((response) => {
                dispatch(reemplazarSubasta(response.data.subasta));
                toast.success("Imágenes subidas");
                setArchivos([]);
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "No se pudieron subir las imágenes");
            })
            .finally(() => {
                setSubiendo(false);
            })

        }

        const eliminarImagen = (url) => {
            api.delete(`/subastas/${subasta._id}/imagenes`, { data: { url } })
            .then((response) => {
                dispatch(remplazarSubasta(response.data.subasta))
                toast.success("Imagen eliminada");
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "No se pudo eliminar la imagen");
            })
        }

        return (
        <div className="imagenes-subasta">
            <div className="galeria">
                {subasta.imagenes.map((url) => (
                    <div className="imagen" key={url}>
                        <img src={url} alt={subasta.titulo} width="120" />
                        <button type="button" onClick={() => eliminarImagen(url)}>Quitar</button>
                    </div>
                ))}
            </div>

            {lugaresLibres > 0 ? (
                <div>
                    <input type="file" accept="image/*" multiple onChange={elegirArchivos} />
                    {archivos.length > 0 && (
                        <div className="previews">
                            {archivos.map((archivo) => (
                                <img src={URL.createObjectURL(archivo)} alt={archivo.name} width="80" key={archivo.name} />
                            ))}
                        </div>
                    )}
                    <button type="button" onClick={subir} disabled={archivos.length === 0 || subiendo}>
                        {subiendo ? "Subiendo..." : "Subir imágenes"}
                    </button>
                </div>
            ) : (
                <p>Llegaste al máximo de {MAX_IMAGENES} imágenes.</p>
            )}
        </div>
    )
}

export default ImagenesSubasta



    

