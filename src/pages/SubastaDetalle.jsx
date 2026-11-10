import { useEffect, useRef, useState } from "react"
import { useParams, Link } from "react-router"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { useSelector, useDispatch } from "react-redux"
import { useGSAP } from "@gsap/react"
import api from "../config/api.config"
import { toast } from "../utils/avisos"
import { formatearUSD } from "../utils/formato"
import { crearPujaSchema } from "../validators/subastas.validators"
import { reemplazarSubasta } from "../features/subastas.slice"
import { gsap, EASE, pulso, sacudir, movimientoReducido } from "../animations/config"
import ModalEditarSubasta from "../components/ModalEditarSubasta"
import Descripcion from "../components/Descripcion"
import CuentaRegresiva from "../components/CuentaRegresiva"

const SubastaDetalle = () => {

    const { id } = useParams();

    const [subasta, setSubasta] = useState(null);
    const [pujas, setPujas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [ofertaEnviada, setOfertaEnviada] = useState(false);
    const [miUltimaPuja, setMiUltimaPuja] = useState("");
    const [imagenActiva, setImagenActiva] = useState(0);
    const [editando, setEditando] = useState(false);
    const [precioMostrado, setPrecioMostrado] = useState(null);

    const contenedor = useRef(null);
    const precioRef = useRef(null);
    const flotanteRef = useRef(null);
    const formRef = useRef(null);
    const precioAnterior = useRef(null);

    const dispatch = useDispatch();
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

    // Animación cuando sube el precio: contador, pulso y "+US$" flotando
    const { contextSafe } = useGSAP(() => {
        if (!subasta) return;

        const anterior = precioAnterior.current;
        const actual = subasta.precioActual;
        precioAnterior.current = actual;

        if (anterior === null || actual <= anterior || movimientoReducido()) return;

        setPrecioMostrado(anterior);

        const contador = { valor: anterior };
        gsap.to(contador, {
            valor: actual,
            duration: 1,
            ease: EASE.salida,
            onUpdate: () => setPrecioMostrado(Math.round(contador.valor)),
            onComplete: () => setPrecioMostrado(null)
        });

        pulso(precioRef.current);

        flotanteRef.current.textContent = `+${formatearUSD(actual - anterior)}`;
        gsap.timeline()
            .fromTo(flotanteRef.current, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: -8, duration: 0.35, ease: EASE.salida })
            .to(flotanteRef.current, { autoAlpha: 0, y: -36, duration: 0.6, ease: "power1.in" }, "+=0.5");
    }, { dependencies: [subasta?.precioActual], scope: contenedor });

    const sacudirFormulario = contextSafe(() => {
        sacudir(formRef.current);
    });

    const cargarSubasta = () => {
        return api.get(`/subastas/${id}`)
            .then((response) => {
                setSubasta(response.data.subasta);
                return api.get("/pujas", { params: { subasta: id } });
            })
            .then((response) => {
                setPujas(response.data.pujas);
            })
    }

    useEffect(() => {
        setLoading(true);
        setError("");
        precioAnterior.current = null;

        cargarSubasta()
            .catch((err) => {
                setError(err.response?.data?.message || "No se pudo cargar la subasta");
            })
            .finally(() => {
                setLoading(false);
            })
    }, [id])

    const actualizarSubasta = (subastaActualizada) => {
        setSubasta(subastaActualizada);
        setImagenActiva(0);
        dispatch(reemplazarSubasta(subastaActualizada));
    }

    const alTerminarCuenta = () => {
        setTimeout(() => {
            cargarSubasta().catch(() => {});
        }, 1500);
    }

    const pujar = (data) => {
        setEnviando(true);

        api.post("/pujas", { subasta: id, monto: Number(data.monto) })
            .then((response) => {
                setMiUltimaPuja(response.data.puja._id);
                setOfertaEnviada(true);
                setTimeout(() => setOfertaEnviada(false), 2000);
                reset({ monto: "" });
                toast.success("¡Oferta enviada!", `Ofertaste ${formatearUSD(Number(data.monto))}`);
                return cargarSubasta();
            })
            .catch((err) => {
                sacudirFormulario();
                toast.error("No se pudo ofertar", err.response?.data?.message || "Probá de nuevo");
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

    const ofertaMasAlta = pujas[0];
    const participe = usuario && pujas.some((puja) => puja.usuario?._id === usuario._id);
    const voyGanando = participe && ofertaMasAlta?.usuario?._id === usuario._id;

    return (
        <div className="detalle" ref={contenedor}>
            <nav className="miga">
                <Link to="/">Inicio</Link>
                <span>›</span>
                <Link to="/explorar">Subastas</Link>
                <span>›</span>
                <span className="miga-actual">{subasta.titulo}</span>
            </nav>

            <header className="detalle-encabezado">
                <h1>{subasta.titulo}</h1>
                <div className="detalle-meta">
                    <span><strong>{formatearUSD(subasta.precioActual)}</strong></span>
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
                    <strong>{formatearUSD(subasta.precioBase)}</strong>
                </div>
                <div className="chip">
                    <span>Incremento mínimo</span>
                    <strong>{formatearUSD(subasta.incrementoMinimo)}</strong>
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
                        <Descripcion texto={subasta.descripcion} />
                    </section>

                    <section className="bloque">
                        <h2>Historial de pujas</h2>
                        {pujas.length === 0 ? (
                            <p className="vacio">Todavía no hay pujas. Podés ser el primero.</p>
                        ) : (
                            <ul className="lista-pujas">
                                {pujas.map((puja) => (
                                    <li key={puja._id} className={puja._id === miUltimaPuja ? "recien" : ""}>
                                        <strong>{formatearUSD(puja.monto)}</strong>
                                        <span className="puja-usuario">
                                            @{puja.usuario?.username || "usuario"}
                                            {usuario && puja.usuario?._id === usuario._id && " (vos)"}
                                        </span>
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
                        {estaActiva && (
                            <CuentaRegresiva fechaFin={subasta.fechaFin} alTerminar={alTerminarCuenta} />
                        )}

                        <span className="panel-etiqueta">{estaActiva ? "Oferta actual" : "Precio final"}</span>
                        <div className="panel-precio-fila">
                            <p className="panel-precio" ref={precioRef}>{formatearUSD(precioMostrado ?? subasta.precioActual)}</p>
                            <span className="precio-flotante" ref={flotanteRef}></span>
                        </div>

                        {participe && (
                            <span className={voyGanando ? "mi-estado ganando" : "mi-estado superada"}>
                                {voyGanando
                                    ? (estaActiva ? "Tu oferta es la más alta" : "¡Ganaste esta subasta!")
                                    : (estaActiva ? "Te superaron, ofertá de nuevo" : "Otra persona ganó la subasta")}
                            </span>
                        )}

                        {estaActiva && <p className="panel-nota">Próxima oferta desde {formatearUSD(montoMinimo)}</p>}

                        {esPropia ? (
                            <div className="panel-duenio">
                                {estaActiva ? (
                                    <>
                                        <p className="panel-aviso">Es tu publicación. Podés cambiar las fotos, el título, la descripción y el incremento mínimo.</p>
                                        <button type="button" className="btn-secundario btn-bloque" onClick={() => setEditando(true)}>
                                            Editar publicación
                                        </button>
                                    </>
                                ) : (
                                    <p className="panel-aviso">Esta subasta ya terminó, así que no se puede editar.</p>
                                )}
                            </div>
                        ) : !estaActiva ? (
                            voyGanando ? (
                                <Link to="/mis-pujas" className="btn btn-acento btn-bloque">Ver cómo seguir</Link>
                            ) : (
                                <p className="panel-aviso">Esta subasta ya no está activa.</p>
                            )
                        ) : !usuario ? (
                            <p className="panel-aviso">
                                <Link to="/login">Iniciá sesión</Link> para participar.
                            </p>
                        ) : (
                            <form onSubmit={handleSubmit(pujar)} ref={formRef}>
                                <div className="form-group">
                                    <label htmlFor="monto">Tu oferta (USD)</label>
                                    <input {...register("monto")} type="number" id="monto" placeholder={montoMinimo} />
                                    <span className="error">{errors.monto?.message}</span>
                                </div>
                                <button
                                    type="submit"
                                    className={ofertaEnviada ? "btn-ofertar enviada" : "btn-ofertar"}
                                    disabled={!isValid || enviando}
                                >
                                    {enviando ? "Enviando..." : ofertaEnviada ? "✓ Oferta enviada" : "Ofertar"}
                                </button>
                            </form>
                        )}
                    </div>
                </aside>
            </div>

            {editando && (
                <ModalEditarSubasta
                    subasta={subasta}
                    alCerrar={() => setEditando(false)}
                    alActualizar={actualizarSubasta}
                />
            )}
        </div>
    )
}

export default SubastaDetalle