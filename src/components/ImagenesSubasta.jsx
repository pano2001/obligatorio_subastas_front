import { useState } from "react"
import api from "../config/api.config"
import { toast } from "../utils/avisos"
import { armarFormDataImagenes, mensajeErrorSubida } from "../utils/imagenes"

const MAX_IMAGENES = 5;

const ImagenesSubasta = ({ subasta, alCambiar }) => {

    const [subiendo, setSubiendo] = useState(false);
    const [quitando, setQuitando] = useState("");

    const lugaresLibres = MAX_IMAGENES - subasta.imagenes.length;

    const elegirArchivos = (e) => {
        const seleccionados = Array.from(e.target.files);
        e.target.value = "";

        if (seleccionados.length === 0) return;

        const noSonImagenes = seleccionados.some((archivo) => !archivo.type.startsWith("image/"));
        if (noSonImagenes) {
            toast.error("Solo se permiten archivos de imagen");
            return;
        }

        if (seleccionados.length > lugaresLibres) {
            toast.error(`Solo podés agregar ${lugaresLibres} foto(s) más`);
            return;
        }

        setSubiendo(true);

        armarFormDataImagenes(seleccionados)
            .then((formData) => api.post(`/subastas/${subasta._id}/imagenes`, formData))
            .then((response) => {
                alCambiar(response.data.subasta);
                toast.success(seleccionados.length === 1 ? "Foto agregada" : "Fotos agregadas");
            })
            .catch((err) => {
                toast.error("No se pudieron subir las fotos", mensajeErrorSubida(err));
            })
            .finally(() => {
                setSubiendo(false);
            })
    }

    const quitarImagen = (url) => {
        setQuitando(url);

        api.delete(`/subastas/${subasta._id}/imagenes`, { data: { url } })
            .then((response) => {
                alCambiar(response.data.subasta);
                toast.success("Foto eliminada");
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "No se pudo eliminar la foto");
            })
            .finally(() => {
                setQuitando("");
            })
    }

    return (
        <div className="fotos-editor">
            {subasta.imagenes.map((url, indice) => (
                <div className={quitando === url ? "foto-item quitando" : "foto-item"} key={url}>
                    <img src={url} alt={`Foto ${indice + 1}`} />
                    {indice === 0 && <span className="foto-portada">Portada</span>}
                    <button
                        type="button"
                        className="foto-quitar"
                        onClick={() => quitarImagen(url)}
                        disabled={quitando !== ""}
                        aria-label="Quitar foto"
                    >×</button>
                </div>
            ))}

            {subiendo && (
                <div className="foto-item foto-cargando">
                    <span>Subiendo...</span>
                </div>
            )}

            {lugaresLibres > 0 && !subiendo && (
                <label className="foto-agregar">
                    <input type="file" accept="image/*" multiple onChange={elegirArchivos} />
                    <span className="foto-agregar-icono">+</span>
                    <span>Agregar fotos</span>
                    <small>{lugaresLibres} {lugaresLibres === 1 ? "lugar libre" : "lugares libres"}</small>
                </label>
            )}
        </div>
    )
}

export default ImagenesSubasta