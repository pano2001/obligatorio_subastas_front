import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { useNavigate, Link } from "react-router"
import { useSelector, useDispatch } from "react-redux"
import { useGSAP } from "@gsap/react"
import api from "../config/api.config"
import { toast } from "../utils/avisos"
import { armarFormDataImagenes, mensajeErrorSubida } from "../utils/imagenes"
import { formatearUSD } from "../utils/formato"
import { crearSubastaSchema } from "../validators/subastas.validators"
import { agregarSubasta } from "../features/subastas.slice"
import { entradaEscalonada } from "../animations/config"
import EditorFotos from "../components/EditorFotos"

const LIMITE_PLAN_PLUS = 4;

const NuevaSubasta = () => {

    const [fotos, setFotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorApi, setErrorApi] = useState("");
    const [sugiriendo, setSugiriendo] = useState(false);
    const [validacion, setValidacion] = useState(null);

    const contenedor = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const usuario = useSelector((state) => state.auth.usuario);
    const subastas = useSelector((state) => state.subastas.subastas);
    const categorias = useSelector((state) => state.categorias.lista);

    const alcanzoLimite = usuario.plan === "plus" && subastas.length >= LIMITE_PLAN_PLUS;

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        resolver: joiResolver(crearSubastaSchema),
        defaultValues: {
            incrementoMinimo: 50
        }
    })

    const titulo = watch("titulo");
    const precioBase = watch("precioBase");
    const marca = watch("vehiculo.marca");
    const modelo = watch("vehiculo.modelo");
    const anio = watch("vehiculo.anio");
    const largoDescripcion = watch("descripcion")?.length || 0;

    const tieneFotos = fotos.length > 0;

    useGSAP(() => {
        entradaEscalonada(contenedor.current.querySelectorAll(".nueva-seccion, .nueva-resumen"));
    }, { scope: contenedor });

    const agregarFotos = (agregadas) => {
        setFotos((actuales) => [...actuales, ...agregadas]);
    }

    const quitarFoto = (indice) => {
        URL.revokeObjectURL(fotos[indice].vista);
        setFotos((actuales) => actuales.filter((_, i) => i !== indice));
    }

    const validarVehiculo = () => {
        if (!marca || !modelo || !anio) {
            setValidacion({ estado: "error", mensaje: "Completá marca, modelo y año para verificar el vehículo" });
            return;
        }

        setValidacion({ estado: "cargando", mensaje: "Consultando la NHTSA..." });

        api.get("/vehiculos/validar", { params: { marca, modelo, anio } })
            .then((response) => {
                if (response.data.modeloExiste === undefined) {
                    setValidacion({ estado: "indeterminado", mensaje: response.data.mensaje });
                } else if (response.data.modeloExiste) {
                    setValidacion({ estado: "ok", mensaje: `El ${marca} ${modelo} ${anio} figura en el registro de la NHTSA` });
                } else {
                    setValidacion({ estado: "no", mensaje: `No encontramos un ${marca} ${modelo} ${anio} en la NHTSA. Revisá los datos.` });
                }
            })
            .catch((err) => {
                setValidacion({ estado: "error", mensaje: err.response?.data?.message || "No se pudo verificar el vehículo" });
            })
    }

    const sugerirConIA = () => {
        const categoria = watch("categoria");

        if (!marca || !modelo || !anio || !categoria) {
            toast.error("Faltan datos", "Completá marca, modelo, año y categoría para usar la IA");
            return;
        }

        setSugiriendo(true);

        api.post("/ia/sugerencias", { marca, modelo, anio: Number(anio), categoria })
            .then((response) => {
                setValue("descripcion", response.data.descripcion, { shouldValidate: true });
                setValue("precioBase", response.data.precioSugerido, { shouldValidate: true });

                if (response.data.generadoPorIA) {
                    toast.success("Sugerencia generada con IA");
                } else {
                    toast.info("La IA no estuvo disponible", "Se usó una descripción genérica y el precio promedio de la categoría");
                }
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "No se pudo generar la sugerencia");
            })
            .finally(() => {
                setSugiriendo(false);
            })
    }

    const procesarForm = (data) => {
        if (!tieneFotos) {
            toast.error("Falta la foto", "La publicación tiene que tener al menos una foto");
            return;
        }

        setErrorApi("");
        setLoading(true);

        let creada = null;

        api.post("/subastas", data)
            .then((response) => {
                creada = response.data.subasta;
                return armarFormDataImagenes(fotos.map((foto) => foto.archivo));
            })
            .then((formData) => api.post(`/subastas/${creada._id}/imagenes`, formData))
            .then((respuestaImagenes) => {
                dispatch(agregarSubasta(respuestaImagenes.data.subasta));
                toast.success("¡Publicada!", "Tu vehículo ya está en subasta");
                navigate(`/subastas/${creada._id}`);
            })
            .catch((err) => {
                if (creada) {
                    api.delete(`/subastas/${creada._id}`).catch(() => {});
                    setErrorApi(`No se pudieron subir las fotos: ${mensajeErrorSubida(err)}. No se publicó nada, probá de nuevo.`);
                } else {
                    setErrorApi(err.response?.data?.message || "No se pudo crear la subasta");
                }
            })
            .finally(() => {
                setLoading(false);
            })
    }

    if (alcanzoLimite) {
        return (
            <div className="container">
                <div className="estado-vacio">
                    <h3>Llegaste al límite de tu plan</h3>
                    <p>El plan Plus permite hasta {LIMITE_PLAN_PLUS} subastas. Pasate a Premium para publicar sin límite.</p>
                    <Link to="/configuracion/plan" className="btn btn-acento">Ver planes</Link>
                </div>
            </div>
        )
    }

    const requisitos = [
        { texto: "Al menos una foto", ok: tieneFotos },
        { texto: "Datos del vehículo", ok: !!marca && !!modelo && !!anio && !errors.vehiculo },
        { texto: "Datos de la publicación", ok: isValid }
    ];

    return (
        <div className="container nueva" ref={contenedor}>
            <header className="pagina-encabezado">
                <span className="eyebrow">Vender</span>
                <h1 className="pagina-titulo">Publicar un vehículo</h1>
                <p className="pagina-bajada">Cargá las fotos y los datos. Podés pedirle a la IA una descripción y un precio sugerido.</p>
            </header>

            <form className="nueva-cuerpo" onSubmit={handleSubmit(procesarForm)}>
                <div className="nueva-principal">

                    <section className="nueva-seccion">
                        <div className="nueva-seccion-cabecera">
                            <span className="nueva-paso">1</span>
                            <div>
                                <h3>Fotos</h3>
                                <p className="modal-ayuda">La primera foto es la portada. Mínimo 1, máximo 5.</p>
                            </div>
                        </div>
                        <EditorFotos
                            existentes={[]}
                            nuevas={fotos}
                            alAgregar={agregarFotos}
                            alQuitarExistente={() => {}}
                            alQuitarNueva={quitarFoto}
                        />
                    </section>

                    <section className="nueva-seccion">
                        <div className="nueva-seccion-cabecera">
                            <span className="nueva-paso">2</span>
                            <div>
                                <h3>Vehículo</h3>
                                <p className="modal-ayuda">Lo verificamos contra el registro de la NHTSA.</p>
                            </div>
                        </div>

                        <div className="campos-fila tres">
                            <div className="form-group">
                                <label htmlFor="marca">Marca</label>
                                <input {...register("vehiculo.marca")} type="text" id="marca" placeholder="Toyota" />
                                <span className="error">{errors.vehiculo?.marca?.message}</span>
                            </div>
                            <div className="form-group">
                                <label htmlFor="modelo">Modelo</label>
                                <input {...register("vehiculo.modelo")} type="text" id="modelo" placeholder="Corolla" />
                                <span className="error">{errors.vehiculo?.modelo?.message}</span>
                            </div>
                            <div className="form-group">
                                <label htmlFor="anio">Año</label>
                                <input {...register("vehiculo.anio")} type="number" id="anio" placeholder="2020" />
                                <span className="error">{errors.vehiculo?.anio?.message}</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="categoria">Categoría</label>
                            <select {...register("categoria")} id="categoria" defaultValue="">
                                <option value="">Elegí una categoría</option>
                                {categorias.map((categoria) => (
                                    <option value={categoria._id} key={categoria._id}>{categoria.nombre}</option>
                                ))}
                            </select>
                            <span className="error">{errors.categoria?.message}</span>
                        </div>

                        <div className="verificacion">
                            <button type="button" className="btn-secundario btn-chico" onClick={validarVehiculo} disabled={validacion?.estado === "cargando"}>
                                Verificar vehículo
                            </button>
                            {validacion && (
                                <span className={`verificacion-estado ${validacion.estado}`}>{validacion.mensaje}</span>
                            )}
                        </div>
                    </section>

                    <section className="nueva-seccion">
                        <div className="nueva-seccion-cabecera">
                            <span className="nueva-paso">3</span>
                            <div>
                                <h3>Publicación</h3>
                                <p className="modal-ayuda">Lo que van a ver los compradores.</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="titulo">Título</label>
                            <input {...register("titulo")} type="text" id="titulo" placeholder="Toyota Corolla XEi impecable" />
                            <span className="error">{errors.titulo?.message}</span>
                        </div>

                        <div className="form-group">
                            <div className="etiqueta-con-accion">
                                <label htmlFor="descripcion">Descripción</label>
                                <button type="button" className="btn-ia" onClick={sugerirConIA} disabled={sugiriendo}>
                                    {sugiriendo ? "Generando..." : "✦ Sugerir con IA"}
                                </button>
                            </div>
                            <textarea {...register("descripcion")} id="descripcion" rows="5"></textarea>
                            <div className="campo-pie">
                                <span className="error">{errors.descripcion?.message}</span>
                                <small>{largoDescripcion}/1000</small>
                            </div>
                        </div>

                        <div className="campos-fila">
                            <div className="form-group">
                                <label htmlFor="precioBase">Precio base (USD)</label>
                                <input {...register("precioBase")} type="number" id="precioBase" />
                                <span className="error">{errors.precioBase?.message}</span>
                            </div>
                            <div className="form-group">
                                <label htmlFor="incrementoMinimo">Incremento mínimo (USD)</label>
                                <input {...register("incrementoMinimo")} type="number" id="incrementoMinimo" />
                                <span className="error">{errors.incrementoMinimo?.message}</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="fechaFin">Finaliza el</label>
                            <input {...register("fechaFin")} type="datetime-local" id="fechaFin" />
                            <span className="error">{errors.fechaFin?.message}</span>
                        </div>
                    </section>
                </div>

                <aside className="nueva-resumen">
                    <div className="resumen-caja">
                        <div className="resumen-foto">
                            {tieneFotos ? (
                                <img src={fotos[0].vista} alt="Portada" />
                            ) : (
                                <span>Tu portada va acá</span>
                            )}
                        </div>

                        <div className="resumen-datos">
                            <strong className="resumen-titulo">{titulo || "Título de la publicación"}</strong>
                            <span className="resumen-vehiculo">
                                {marca || modelo || anio ? `${marca || ""} ${modelo || ""} · ${anio || ""}` : "Marca, modelo y año"}
                            </span>
                            <span className="tarjeta-etiqueta">Precio base</span>
                            <strong className="tarjeta-precio">{precioBase ? formatearUSD(Number(precioBase)) : "USD —"}</strong>
                        </div>

                        <ul className="requisitos">
                            {requisitos.map((requisito) => (
                                <li className={requisito.ok ? "ok" : ""} key={requisito.texto}>
                                    <span className="requisito-marca">{requisito.ok ? "✓" : ""}</span>
                                    {requisito.texto}
                                </li>
                            ))}
                        </ul>

                        {errorApi && <p className="error">{errorApi}</p>}

                        <button type="submit" className="btn btn-acento btn-bloque btn-grande" disabled={!isValid || !tieneFotos || loading}>
                            {loading ? "Publicando..." : "Publicar subasta"}
                        </button>
                    </div>
                </aside>
            </form>
        </div>
    )
}

export default NuevaSubasta