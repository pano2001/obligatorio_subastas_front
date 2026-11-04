import { useState } from "react"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { useDispatch } from "react-redux"
import { toast } from "sonner"
import api from "../config/api.config"
import { editarSubastaSchema } from "../validators/subastas.validators"
import { quitarSubasta, reemplazarSubasta } from "../features/subastas.slice"
import ImagenesSubasta from "./ImagenesSubasta"

import React from 'react'

const SubastaCard = ({subasta}) => {

    const [editando, setEditando] = useState(false);
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();

    const{
        register, 
        handleSubmit,
        reset, 
        formState: {errors, isValid}
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
        const confirmado = window.confirm(`¿Estás seguro de que deseas eliminar la subasta "${subasta.titulo}"?`);
        if (!confirmado) return;

        api.delete(`/subastas/${subasta._id}`)
        .then(() => {
            dispatch(quitarSubasta(subasta._id));
            toast.success("Subasta eliminada");
        })
        .catch((err) => {
            toast.error(err.response?.data?.message || "No se pudo eliminar la subasta");
        });
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
        {setLoading(true);}

        api.patch(`/subastas/${subasta._id}`, data)
        .then ((response) => {
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
            <div className="card-subasta">
                <form onSubmit={handleSubmit(guardar)}>
                    <div className="form-group">
                        <label>Título:</label>
                        <input {...register("titulo")} type="text" />
                        <span className="error">{errors.titulo?.message}</span>
                    </div>

                    <div className="form-group">
                        <label>Descripción:</label>
                        <textarea {...register("descripcion")} rows="3"></textarea>
                        <span className="error">{errors.descripcion?.message}</span>
                    </div>

                    <div className="form-group">
                        <label>Incremento mínimo:</label>
                        <input {...register("incrementoMinimo")} type="number" />
                        <span className="error">{errors.incrementoMinimo?.message}</span>
                    </div>

                    <ImagenesSubasta subasta={subasta} />

                    <button type="submit" disabled={!isValid || loading}>
                        {loading ? "Guardando..." : "Guardar"}
                    </button>
                    <button type="button" onClick={cancelar}>Cancelar</button>
                </form>
            </div>
        )
    }

    
  return (
        <div className="card-subasta">
            <h3>{subasta.titulo}</h3>

            {subasta.imagenes.length > 0 && (
                <div className="galeria">
                    {subasta.imagenes.map((url) => (
                        <img src={url} alt={subasta.titulo} width="120" key={url} />
                    ))}
                </div>
            )}

            <p>{subasta.vehiculo.marca} {subasta.vehiculo.modelo} ({subasta.vehiculo.anio})</p>
            <p>{subasta.descripcion}</p>
            <p>Precio actual: ${subasta.precioActual}</p>
            <p>Incremento mínimo: ${subasta.incrementoMinimo}</p>
            <p>Estado: {subasta.estado}</p>
            <p>Finaliza: {new Date(subasta.fechaFin).toLocaleDateString()}</p>

            <button onClick={() => setEditando(true)}>Editar</button>
            <button onClick={eliminar}>Eliminar</button>
        </div>
    )
}

export default SubastaCard