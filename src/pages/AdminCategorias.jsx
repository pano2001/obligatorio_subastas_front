import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { useDispatch } from "react-redux"
import { useGSAP } from "@gsap/react"
import { toast } from "sonner"
import api from "../config/api.config"
import { categoriaSchema } from "../validators/categorias.validators"
import { guardarCategorias } from "../features/categorias.slice"
import { entradaEscalonada } from "../animations/config"

const AdminCategorias = () => {

    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [busqueda, setBusqueda] = useState("");

    const lista = useRef(null);
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        reset,
        setFocus,
        watch,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        resolver: joiResolver(categoriaSchema),
        defaultValues: { nombre: "", descripcion: "" }
    })

    const descripcionActual = watch("descripcion") || "";

    const cargarCategorias = () => {
        setLoading(true);
        setError("");

        return api.get("/categorias")
            .then((response) => {
                setCategorias(response.data.categorias);
                dispatch(guardarCategorias(response.data.categorias));
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

    useGSAP(() => {
        if (loading) return;
        entradaEscalonada(lista.current.querySelectorAll(".fila-categoria"));
    }, { scope: lista, dependencies: [loading] });

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
        setFocus("nombre");
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
                if (editandoId === categoria._id) cancelarEdicion();
                return cargarCategorias();
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "No se pudo eliminar la categoría");
            })
    }

    const texto = busqueda.trim().toLowerCase();
    const visibles = texto
        ? categorias.filter((c) => `${c.nombre} ${c.descripcion || ""}`.toLowerCase().includes(texto))
        : categorias;

    const enEdicion = categorias.find((c) => c._id === editandoId);

    return (
        <>
            <header className="pagina-encabezado encabezado-con-datos">
                <div>
                    <span className="eyebrow">Panel de administración</span>
                    <h1 className="pagina-titulo">Categorías</h1>
                    <p className="pagina-bajada">Organizá cómo se clasifican las subastas del sitio.</p>
                </div>
                <div className="indicador">
                    <strong>{categorias.length}</strong>
                    <span>{categorias.length === 1 ? "categoría" : "categorías"}</span>
                </div>
            </header>

            <div className="admin-grilla">
                <div className={`panel admin-formulario ${editandoId ? "editando" : ""}`}>
                    <div className="panel-cabecera">
                        <div>
                            <h2>{enEdicion ? "Editar categoría" : "Nueva categoría"}</h2>
                            <p>
                                {enEdicion
                                    ? `Estás editando "${enEdicion.nombre}".`
                                    : "Aparece en el alta de subastas y en los filtros."}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(guardar)}>
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre</label>
                            <input id="nombre" type="text" placeholder="Por ejemplo: SUV" {...register("nombre")} />
                            <span className="error">{errors.nombre?.message}</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="descripcion">
                                Descripción <span className="opcional">opcional</span>
                            </label>
                            <textarea id="descripcion" rows="3" placeholder="Una línea que la describa" {...register("descripcion")}></textarea>
                            <div className="campo-pie">
                                <span className="error">{errors.descripcion?.message}</span>
                                <span className="contador-caracteres">{descripcionActual.length}/200</span>
                            </div>
                        </div>

                        <div className="acciones-fila">
                            <button type="submit" disabled={!isValid || guardando}>
                                {guardando ? "Guardando..." : enEdicion ? "Guardar cambios" : "Crear categoría"}
                            </button>
                            {editandoId && (
                                <button type="button" className="btn-secundario" onClick={cancelarEdicion}>Cancelar</button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="panel" ref={lista}>
                    <div className="panel-cabecera">
                        <div>
                            <h2>Todas las categorías</h2>
                            <p>{texto ? `${visibles.length} de ${categorias.length}` : "Pasá el mouse por una fila para ver las acciones."}</p>
                        </div>
                        <input
                            type="search"
                            className="buscador-chico"
                            placeholder="Buscar"
                            aria-label="Buscar categorías"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <ul className="lista-categorias">
                            {[0, 1, 2].map((indice) => (
                                <li className="fila-categoria" key={indice}>
                                    <span className="monograma brillo"></span>
                                    <div className="fila-categoria-texto">
                                        <span className="linea-esqueleto brillo"></span>
                                        <span className="linea-esqueleto corta brillo"></span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : categorias.length === 0 ? (
                        <div className="estado-vacio">
                            <h3>Todavía no hay categorías</h3>
                            <p>Creá la primera con el formulario de la izquierda.</p>
                        </div>
                    ) : visibles.length === 0 ? (
                        <p className="vacio">No hay categorías que coincidan con "{busqueda}".</p>
                    ) : (
                        <ul className="lista-categorias">
                            {visibles.map((categoria) => (
                                <li
                                    className={`fila-categoria ${categoria._id === editandoId ? "editando" : ""}`}
                                    key={categoria._id}
                                >
                                    <span className="monograma">{categoria.nombre.charAt(0).toUpperCase()}</span>
                                    <div className="fila-categoria-texto">
                                        <strong>{categoria.nombre}</strong>
                                        <span>{categoria.descripcion || "Sin descripción"}</span>
                                    </div>
                                    <div className="fila-categoria-acciones">
                                        <button type="button" className="btn-fantasma btn-chico" onClick={() => editar(categoria)}>Editar</button>
                                        <button type="button" className="btn-peligro btn-chico" onClick={() => eliminar(categoria)}>Eliminar</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    )
}

export default AdminCategorias