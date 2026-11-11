import { useRef, useState } from "react"
import { useDispatch } from "react-redux"
import api from "../config/api.config"
import { toast } from "../utils/avisos"
import { quitarSubasta, reemplazarSubasta } from "../features/subastas.slice"
import TarjetaSubasta from "./TarjetaSubasta"
import ModalEditarSubasta from "./ModalEditarSubasta"
import ModalConfirmar from "./ModalConfirmar"

const SubastaCard = ({ subasta }) => {

    const [editando, setEditando] = useState(false);
    const [confirmando, setConfirmando] = useState(false);

    const seElimino = useRef(false);

    const dispatch = useDispatch();

    // Si el precio actual superó al base, es porque alguien ofertó
    const tienePujas = subasta.precioActual > subasta.precioBase;

    const eliminar = () => {
        return api.delete(`/subastas/${subasta._id}`)
            .then(() => {
                seElimino.current = true;
                toast.success("Subasta eliminada");
            })
            .catch((err) => {
                toast.error("No se pudo eliminar", err.response?.data?.message || "Probá de nuevo");
                throw err;
            })
    }

    const alCerrarConfirmacion = () => {
        setConfirmando(false);
        if (seElimino.current) {
            dispatch(quitarSubasta(subasta._id));
        }
    }

    const actualizar = (subastaActualizada) => {
        dispatch(reemplazarSubasta(subastaActualizada));
    }

    return (
        <>
            <TarjetaSubasta subasta={subasta}>
                {subasta.estado === "activa" && (
                    <button type="button" className="btn-secundario btn-chico" onClick={() => setEditando(true)}>Editar</button>
                )}
                {tienePujas ? (
                    <span className="tarjeta-nota">Tiene ofertas, no se puede eliminar</span>
                ) : (
                    <button type="button" className="btn-peligro btn-chico" onClick={() => setConfirmando(true)}>Eliminar</button>
                )}
            </TarjetaSubasta>

            {editando && (
                <ModalEditarSubasta
                    subasta={subasta}
                    alCerrar={() => setEditando(false)}
                    alActualizar={actualizar}
                />
            )}

            {confirmando && (
                <ModalConfirmar
                    titulo="¿Eliminar esta subasta?"
                    mensaje={`Se va a borrar "${subasta.titulo}" con sus fotos. Esta acción no se puede deshacer.`}
                    textoConfirmar="Eliminar subasta"
                    alConfirmar={eliminar}
                    alCerrar={alCerrarConfirmacion}
                />
            )}
        </>
    )
}

export default SubastaCard