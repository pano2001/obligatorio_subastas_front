import { useState } from "react"
import { useDispatch } from "react-redux"
import api from "../config/api.config"
import { toast } from "../utils/avisos"
import { quitarSubasta, reemplazarSubasta } from "../features/subastas.slice"
import TarjetaSubasta from "./TarjetaSubasta"
import ModalEditarSubasta from "./ModalEditarSubasta"

const SubastaCard = ({ subasta }) => {

    const [editando, setEditando] = useState(false);

    const dispatch = useDispatch();

    const eliminar = () => {
        const confirmado = window.confirm(`¿Eliminar la subasta "${subasta.titulo}"?`);
        if (!confirmado) return;

        api.delete(`/subastas/${subasta._id}`)
            .then(() => {
                dispatch(quitarSubasta(subasta._id));
                toast.success("Subasta eliminada");
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "No se pudo eliminar la subasta");
            })
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
                <button type="button" className="btn-peligro btn-chico" onClick={eliminar}>Eliminar</button>
            </TarjetaSubasta>

            {editando && (
                <ModalEditarSubasta
                    subasta={subasta}
                    alCerrar={() => setEditando(false)}
                    alActualizar={actualizar}
                />
            )}
        </>
    )
}

export default SubastaCard