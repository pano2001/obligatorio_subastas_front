import { useState } from "react"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { useDispatch } from "react-redux"
import { toast } from "sonner"
import api from "../config/api.config"
import { editarSubastaSchema } from "../validators/subastas.validators"
import { quitarSubasta, reemplazarSubasta } from "../features/subastas.slice"
import TarjetaSubasta from "./TarjetaSubasta"
import ImagenesSubasta from "./ImagenesSubasta"

const SubastaCard = ({ subasta }) => {

    const [editando, setEditando] = useState(false);
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        resolver: joiResolver(editarSubastaSchema),
        defaultValues: {
            titulo: subasta.titulo,
            descripcion: subasta.descripcion,
            incrementoMinimo: subasta.incrementoMinimo
        }
    })

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

    const cancelar = () => {
        reset({
            titulo: subasta.titulo,
            descripcion: subasta.descripcion,
            incrementoMinimo: subasta.incrementoMinimo
        });
        setEditando(false);
    }

    const guardar = (data) => {
        setLoading(true);

        api.patch(`/subastas/${subasta._id}`, data)
            .then((response) => {
                dispatch(reemplazarSubasta(response.data.subasta));
                toast.success("Subasta actualizada");
                setEditando(false);
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "No se pudo actualizar la subasta");
            })
            .finally(() => {
                setLoading(false);
            })
    }

    if (editando) {
        return (
            <article className="tarjeta tarjeta-edicion">
                <span className="eyebrow">Editando</span>
                <h3 className="tarjeta-edicion-titulo">{subasta.titulo}</h3>

                <form onSubmit={handleSubmit(guardar)}>
                    <div className="form-group">
                        <label>Título</label>
                        <input {...register("titulo")} type="text" />
                        <span className="error">{errors.titulo?.message}</span>
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea {...register("descripcion")} rows="3"></textarea>
                        <span className="error">{errors.descripcion?.message}</span>
                    </div>

                    <div className="form-group">
                        <label>Incremento mínimo (USD)</label>
                        <input {...register("incrementoMinimo")} type="number" />
                        <span className="error">{errors.incrementoMinimo?.message}</span>
                    </div>

                    <ImagenesSubasta subasta={subasta} />

                    <div className="acciones-fila">
                        <button type="submit" disabled={!isValid || loading}>
                            {loading ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button type="button" className="btn-secundario" onClick={cancelar}>Cancelar</button>
                    </div>
                </form>
            </article>
        )
    }

    return (
        <TarjetaSubasta subasta={subasta}>
            <button type="button" className="btn-secundario btn-chico" onClick={() => setEditando(true)}>Editar</button>
            <button type="button" className="btn-peligro btn-chico" onClick={eliminar}>Eliminar</button>
        </TarjetaSubasta>
    )
}

export default SubastaCard