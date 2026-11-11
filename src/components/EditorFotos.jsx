import { toast } from "../utils/avisos"

const MAX_IMAGENES = 5;

const EditorFotos = ({ existentes, nuevas, alAgregar, alQuitarExistente, alQuitarNueva }) => {

    const total = existentes.length + nuevas.length;
    const lugaresLibres = MAX_IMAGENES - total;

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

        alAgregar(seleccionados.map((archivo) => ({
            archivo,
            vista: URL.createObjectURL(archivo)
        })));
    }

     return (
        <>
            <div className="fotos-editor">
                {existentes.map((url, indice) => (
                    <div className="foto-item" key={url}>
                        <img src={url} alt={`Foto ${indice + 1}`} />
                        {indice === 0 && <span className="foto-portada">Portada</span>}
                        <button type="button" className="foto-quitar" onClick={() => alQuitarExistente(url)} aria-label="Quitar foto">×</button>
                    </div>
                ))}

                {nuevas.map((nueva, indice) => (
                    <div className="foto-item" key={nueva.vista}>
                        <img src={nueva.vista} alt={nueva.archivo.name} />
                        {existentes.length === 0 && indice === 0 && <span className="foto-portada">Portada</span>}
                        <span className="foto-nueva">Nueva</span>
                        <button type="button" className="foto-quitar" onClick={() => alQuitarNueva(indice)} aria-label="Quitar foto">×</button>
                    </div>
                ))}

                {lugaresLibres > 0 && (
                    <label className="foto-agregar">
                        <input type="file" accept="image/*" multiple onChange={elegirArchivos} />
                        <span className="foto-agregar-icono">+</span>
                        <span>Agregar fotos</span>
                        <small>{lugaresLibres} {lugaresLibres === 1 ? "lugar libre" : "lugares libres"}</small>
                    </label>
                )}
            </div>

            <p className="fotos-consejo">
                Consejo: sacá las fotos con el celular en horizontal. Así el auto se ve completo y la publicación queda más prolija.
            </p>
        </>
    )
}

export default EditorFotos