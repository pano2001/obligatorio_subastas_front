import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { toast } from "sonner"
import api from "../config/api.config"
import { categoriaSchema } from "../validators/categorias.validators"

const AdminCategorias = () => {

    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [editandoId, setEditandoId] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        resolver: joiResolver(categoriaSchema),
        defaultValues: { nombre: "", descripcion: "" }
    })

    const cargarCategorias = () => {
        setLoading(true);
        setError("");

        return api.get("/categorias")
            .then((response) => {
                setCategorias(response.data.categorias);
            })
            .catch((err) => {
                setError(err.response?.data?.message || "No se pudieron cargar las categorías");
            })
            .finally(() => {
                setLoading(false);
            })
    }

    useEffect(() => {
        cargarCategorias();
    }, [])

    const guardar = (data) => {
        const datos = { nombre: data.nombre };
        if (data.descripcion) {
            datos.descripcion = data.descripcion;
        }

        setGuardando(true);

        const peticion = editandoId
            ? api.patch(`/categorias/${editandoId}`, datos)
            : api.post("/categorias", datos);

        peticion
            .then(() => {
                toast.success(editandoId ? "Categoría actualizada" : "Categoría creada");
                reset({ nombre: "", descripcion: "" });
                setEditandoId(null);
                return cargarCategorias();
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "No se pudo guardar la categoría");
            })
            .finally(() => {
                setGuardando(false);
            })
    }

    const editar = (categoria) => {
        setEditandoId(categoria._id);
        reset({ nombre: categoria.nombre, descripcion: categoria.descripcion || "" });
    }

    const cancelarEdicion = () => {
        setEditandoId(null);
        reset({ nombre: "", descripcion: "" });
    }

    const eliminar = (categoria) => {
        const confirmado = window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`);
        if (!confirmado) return;

        api.delete(`/categorias/${categoria._id}`)
            .then(() => {
                toast.success("Categoría eliminada");
                return cargarCategorias();
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "No se pudo eliminar la categoría");
            })
    }

    return (
        <div className="container">
            <h1>Administrar categorías</h1>

            <form onSubmit={handleSubmit(guardar)}>
                <h2>{editandoId ? "Editar categoría" : "Nueva categoría"}</h2>

                <div className="form-group">
                    <label htmlFor="nombre">Nombre:</label>
                    <input {...register("nombre")} type="text" id="nombre" />
                    <span className="error">{errors.nombre?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="descripcion">Descripción (opcional):</label>
                    <input {...register("descripcion")} type="text" id="descripcion" />
                    <span className="error">{errors.descripcion?.message}</span>
                </div>

                <button type="submit" disabled={!isValid || guardando}>
                    {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear categoría"}
                </button>
                {editandoId && (
                    <button type="button" onClick={cancelarEdicion}>Cancelar</button>
                )}
            </form>

            <h2>Categorías</h2>

            {loading ? (
                <p>Cargando...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : categorias.length === 0 ? (
                <p>Todavía no hay categorías.</p>
            ) : (
                <ul>
                    {categorias.map((categoria) => (
                        <li key={categoria._id}>
                            <strong>{categoria.nombre}</strong>
                            {categoria.descripcion && <span> — {categoria.descripcion}</span>}
                            <button onClick={() => editar(categoria)}>Editar</button>
                            <button onClick={() => eliminar(categoria)}>Eliminar</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default AdminCategorias