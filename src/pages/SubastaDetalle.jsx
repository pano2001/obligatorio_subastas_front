import { useEffect, useState } from "react"
import { useParams, Link } from "react-router"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import api from "../config/api.config"
import { crearPujaSchema } from "../validators/subastas.validators"

const SubastaDetalle = () => {

    const { id } = useParams();

    const [subasta, setSubasta] = useState(null);
    const [pujas, setPujas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [imagenActiva, setImagenActiva] = useState(0);

    const usuario = useSelector((state) => state.auth.usuario);

    const montoMinimo = subasta ? subasta.precioActual + subasta.incrementoMinimo : 0;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        resolver: joiResolver(crearPujaSchema(montoMinimo))
    })

    const cargarPujas = () => {
        return api.get("/pujas", { params: { subasta: id } })
            .then((response) => {
                setPujas(response.data.pujas);
            })
    }

    useEffect(() => {
        setLoading(true);
        setError("");

        api.get(`/subastas/${id}`)
            .then((response) => {
                setSubasta(response.data.subasta);
                return cargarPujas();
            })
            .catch((err) => {
                setError(err.response?.data?.message || "No se pudo cargar la subasta");
            })
            .finally(() => {
                setLoading(false);
            })
    }, [id])

    const pujar = (data) => {
        setEnviando(true);

        api.post("/pujas", { subasta: id, monto: Number(data.monto) })
            .then(() => {
                toast.success("Puja realizada");
                reset({ monto: "" });
                return api.get(`/subastas/${id}`)
                    .then((response) => {
                        setSubasta(response.data.subasta);
                        return cargarPujas();
                    })
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "No se pudo realizar la puja");
            })
            .finally(() => {
                setEnviando(false);
            })
    }

    if (loading) return <div className="container"><p>Cargando...</p></div>
    if (error) return <div className="container"><p className="error">{error}</p></div>
    if (!subasta) return null

    const esPropia = usuario && subasta.vendedor === usuario._id;
    const estaActiva = subasta.estado === "activa";
    const tieneFotos = subasta.imagenes.length > 0;

    return (
        <div className="detalle">
            <nav className="miga">
                <Link to="/">Inicio</Link>
                <span>›</span>
                <Link to="/#subastas">Subastas</Link>
                <span>›</span>
                <span className="miga-actual">{subasta.titulo}</span>
            </nav>

            <header className="detalle-encabezado">
                <h1>{subasta.titulo}</h1>
                <div className="detalle-meta">
                    <span><strong>USD {subasta.precioActual}</strong></span>
                    <span>{pujas.length} {pujas.length === 1 ? "puja" : "pujas"}</span>
                    <span className={`estado estado-${subasta.estado}`}>{subasta.estado}</span>
                    <span>Finaliza {new Date(subasta.fechaFin).toLocaleString()}</span>
                </div>
            </header>

            <div className="chips">
                <div className="chip">
                    <span>Vehículo</span>
                    <strong>{subasta.vehiculo.marca} {subasta.vehiculo.modelo}</strong>
                </div>
                <div className="chip">
                    <span>Año</span>
                    <strong>{subasta.vehiculo.anio}</strong>
                </div>
                <div className="chip">
                    <span>Precio base</span>
                    <strong>USD {subasta.precioBase}</strong>
                </div>
                <div className="chip">
                    <span>Incremento mínimo</span>
                    <strong>USD {subasta.incrementoMinimo}</strong>
                </div>
                <div className="chip">
                    <span>Verificación</span>
                    <strong>{subasta.vehiculo.validadoNHTSA ? "NHTSA ✓" : "Sin verificar"}</strong>
                </div>
            </div>

            <div className="detalle-cuerpo">
                <div className="detalle-principal">
                    {tieneFotos ? (
                        <>
                            <img className="foto-principal" src={subasta.imagenes[imagenActiva]} alt={subasta.titulo} />
                            {subasta.imagenes.length > 1 && (
                                <div className="miniaturas">
                                    {subasta.imagenes.map((url, indice) => (
                                        <img
                                            src={url}
                                            alt={`Foto ${indice + 1}`}
                                            key={url}
                                            className={indice === imagenActiva ? "miniatura activa" : "miniatura"}
                                            onClick={() => setImagenActiva(indice)}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="sin-imagen foto-principal">Sin fotos</div>
                    )}

                    <section className="bloque">
                        <h2>Descripción</h2>
                        <p>{subasta.descripcion}</p>
                    </section>

                    <section className="bloque">
                        <h2>Historial de pujas</h2>
                        {pujas.length === 0 ? (
                            <p className="vacio">Todavía no hay pujas. Podés ser el primero.</p>
                        ) : (
                            <ul className="lista-pujas">
                                {pujas.map((puja) => (
                                    <li key={puja._id}>
                                        <strong>USD {puja.monto}</strong>
                                        <span className={`etiqueta-puja ${puja.estado}`}>{puja.estado}</span>
                                        <span className="fecha-puja">{new Date(puja.createdAt).toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                <aside className="detalle-panel">
                    <div className="panel-caja">
                        <span className="panel-etiqueta">Precio actual</span>
                        <p className="panel-precio">USD {subasta.precioActual}</p>
                        <p className="panel-nota">Próxima puja desde USD {montoMinimo}</p>

                        {!estaActiva ? (
                            <p className="panel-aviso">Esta subasta ya no está activa.</p>
                        ) : !usuario ? (
                            <p className="panel-aviso">
                                <Link to="/login">Iniciá sesión</Link> para participar.
                            </p>
                        ) : esPropia ? (
                            <p className="panel-aviso">Es tu subasta. No podés pujar en ella.</p>
                        ) : (
                            <form onSubmit={handleSubmit(pujar)}>
                                <div className="form-group">
                                    <label htmlFor="monto">Tu oferta (USD)</label>
                                    <input {...register("monto")} type="number" id="monto" placeholder={montoMinimo} />
                                    <span className="error">{errors.monto?.message}</span>
                                </div>
                                <button type="submit" disabled={!isValid || enviando}>
                                    {enviando ? "Enviando..." : "Ofertar"}
                                </button>
                            </form>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default SubastaDetalle