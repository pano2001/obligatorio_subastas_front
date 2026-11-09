import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router"
import { useGSAP } from "@gsap/react"
import api from "../config/api.config"
import { pagoSchema } from "../validators/pagos.validators"
import { guardarSesion } from "../features/auth.slice"
import { gsap, EASE, DURACION, sacudir, movimientoReducido } from "../animations/config"
import { formatearNumeroTarjeta, formatearVencimiento, formatearCvv, detectarMarca } from "../utils/tarjeta"
import { formatearUSD } from "../utils/formato"
import logo from "../assets/logo.svg"

const PRECIO = 20;

const IconoCandado = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
);

const Checkout = () => {

    const [procesando, setProcesando] = useState(false);
    const [rechazo, setRechazo] = useState("");
    const [comprobante, setComprobante] = useState(null);

    const caja = useRef(null);
    const dispatch = useDispatch();
    const usuario = useSelector((state) => state.auth.usuario);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        resolver: joiResolver(pagoSchema)
    })

    const marca = detectarMarca(watch("numeroTarjeta") || "");
    const errorTarjeta = errors.numeroTarjeta?.message || errors.vencimiento?.message || errors.cvv?.message;

    useGSAP(() => {
        if (!comprobante || movimientoReducido()) return;

        gsap.timeline()
            .fromTo(".exito-icono",
                { scale: 0, autoAlpha: 0 },
                { scale: 1, autoAlpha: 1, duration: 0.5, ease: EASE.rebote }
            )
            .fromTo(".exito-icono path",
                { strokeDashoffset: 30 },
                { strokeDashoffset: 0, duration: 0.35, ease: EASE.suave },
                "-=0.15"
            )
            .fromTo(".exito-aparecer",
                { autoAlpha: 0, y: 12 },
                { autoAlpha: 1, y: 0, duration: DURACION.rapida, stagger: 0.06, ease: EASE.salida },
                "-=0.1"
            );
    }, { scope: caja, dependencies: [comprobante] });

    const pagar = (data) => {
        setRechazo("");
        setProcesando(true);

        api.post("/pagos", {
            numeroTarjeta: data.numeroTarjeta.replace(/\s/g, ""),
            titular: data.titular.trim(),
            vencimiento: data.vencimiento,
            cvv: data.cvv
        })
            .then((response) => {
                dispatch(guardarSesion({
                    usuario: response.data.usuario,
                    token: response.data.token
                }));
                setComprobante(response.data.pago);
            })
            .catch((error) => {
                setRechazo(error.response?.data?.message || "No se pudo procesar el pago");
                sacudir(caja.current);
            })
            .finally(() => {
                setProcesando(false);
            })
    }

    if (comprobante) {
        return (
            <div className="checkout">
                <div className="checkout-caja checkout-exito" ref={caja}>
                    <div className="exito-icono">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                    </div>

                    <h1 className="exito-aparecer">Pago aprobado</h1>
                    <p className="exito-aparecer">Ya tenés el plan Premium. Podés publicar subastas sin límite.</p>

                    <div className="comprobante-detalle exito-aparecer">
                        <div className="comprobante-fila">
                            <span>Operación</span>
                            <strong>#{comprobante._id.slice(-8).toUpperCase()}</strong>
                        </div>
                        <div className="comprobante-fila">
                            <span>Concepto</span>
                            <strong>{comprobante.concepto}</strong>
                        </div>
                        <div className="comprobante-fila">
                            <span>Tarjeta</span>
                            <strong>{comprobante.marca} •••• {comprobante.ultimosCuatro}</strong>
                        </div>
                        <div className="comprobante-fila">
                            <span>Fecha</span>
                            <strong>{new Date(comprobante.createdAt).toLocaleString("es-UY")}</strong>
                        </div>
                        <div className="comprobante-fila total">
                            <span>Total pagado</span>
                            <strong>{formatearUSD(comprobante.monto)}</strong>
                        </div>
                    </div>

                    <div className="acciones-columna exito-aparecer">
                        <Link to="/subastas/nueva" className="btn btn-acento btn-grande">Publicar una subasta</Link>
                        <Link to="/configuracion/plan" className="btn btn-secundario">Ver mi plan</Link>
                    </div>
                </div>
            </div>
        )
    }

    if (usuario.plan === "premium") {
        return (
            <div className="checkout">
                <div className="checkout-caja checkout-exito">
                    <h1>Ya tenés Premium</h1>
                    <p>Tu cuenta ya publica sin límite. No hace falta volver a pagar.</p>
                    <div className="acciones-columna">
                        <Link to="/subastas/nueva" className="btn btn-grande">Publicar una subasta</Link>
                        <Link to="/configuracion/plan" className="btn btn-secundario">Ver mi plan</Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="checkout">
            <div className="checkout-caja" ref={caja}>
                <div className="checkout-cabecera">
                    <img src={logo} alt="Pano Select" />
                    <span className="checkout-seguro">
                        <IconoCandado />
                        Pago seguro
                    </span>
                </div>

                <div className="checkout-producto">
                    <div>
                        <strong>Plan Premium</strong>
                        <span>Publicaciones ilimitadas · pago único</span>
                    </div>
                    <span className="checkout-total">{formatearUSD(PRECIO)}</span>
                </div>

                <form onSubmit={handleSubmit(pagar)} noValidate>
                    <label className="checkout-label" htmlFor="numeroTarjeta">Información de la tarjeta</label>

                    <div className="grupo-tarjeta">
                        <div className="grupo-fila">
                            <input
                                id="numeroTarjeta"
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="1234 1234 1234 1234"
                                className="input-numero"
                                {...register("numeroTarjeta", {
                                    onChange: (e) => setValue("numeroTarjeta", formatearNumeroTarjeta(e.target.value), { shouldValidate: true })
                                })}
                            />
                            {marca && <span className="marca-tarjeta">{marca}</span>}
                        </div>

                        <div className="grupo-fila dividida">
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="MM / AA"
                                aria-label="Vencimiento"
                                {...register("vencimiento", {
                                    onChange: (e) => setValue("vencimiento", formatearVencimiento(e.target.value), { shouldValidate: true })
                                })}
                            />
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="CVC"
                                aria-label="Código de seguridad"
                                {...register("cvv", {
                                    onChange: (e) => setValue("cvv", formatearCvv(e.target.value), { shouldValidate: true })
                                })}
                            />
                        </div>
                    </div>
                    <span className="error">{errorTarjeta}</span>

                    <div className="form-group">
                        <label htmlFor="titular">Nombre del titular</label>
                        <input
                            id="titular"
                            type="text"
                            autoComplete="off"
                            placeholder="Como figura en la tarjeta"
                            {...register("titular")}
                        />
                        <span className="error">{errors.titular?.message}</span>
                    </div>

                    {rechazo && (
                        <div className="checkout-rechazo" role="alert">
                            <strong>Pago rechazado.</strong> {rechazo}
                        </div>
                    )}

                    <button type="submit" className="boton-pagar" disabled={!isValid || procesando}>
                        {procesando ? (
                            <>
                                <span className="spinner"></span>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <IconoCandado />
                                Pagar {formatearUSD(PRECIO)}
                            </>
                        )}
                    </button>

                    <p className="checkout-legal">
                        Pago simulado con fines académicos. No ingreses datos reales de tu tarjeta.
                    </p>

                    <details className="checkout-pruebas">
                        <summary>Tarjetas de prueba</summary>
                        <ul>
                            <li><code>4111 1111 1111 1111</code> se aprueba</li>
                            <li><code>4000 0000 0000 0002</code> se rechaza por fondos insuficientes</li>
                            <li>Cualquier vencimiento futuro y cualquier CVC de 3 dígitos</li>
                        </ul>
                    </details>

                    <Link to="/configuracion/plan" className="checkout-volver">Cancelar y volver</Link>
                </form>
            </div>
        </div>
    )
}

export default Checkout