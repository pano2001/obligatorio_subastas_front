import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useGSAP } from "@gsap/react"
import { formatearUSD } from "../utils/formato"
import { gsap, DURACION, EASE, movimientoReducido } from "../animations/config"

const leerProgreso = (clave) => {
    try {
        const guardado = localStorage.getItem(clave);
        return guardado ? JSON.parse(guardado) : { pasos: [false, false, false], visita: "" };
    } catch {
        return { pasos: [false, false, false], visita: "" };
    }
}

const ModalComoSeguir = ({ participacion, alCerrar }) => {

    const { subasta } = participacion;
    const vendedor = subasta.vendedor;
    const clave = `pano-compra-${subasta._id}`;

    const [progreso, setProgreso] = useState(() => leerProgreso(clave));
    const [fechaVisita, setFechaVisita] = useState(progreso.visita);

    const contenedor = useRef(null);
    const animacion = useRef(null);

    const completados = progreso.pasos.filter(Boolean).length;
    const terminado = completados === 3;

    useEffect(() => {
        try {
            localStorage.setItem(clave, JSON.stringify(progreso));
        } catch {
            // Si el navegador no deja guardar, el progreso vive solo mientras el modal está abierto
        }
    }, [progreso]);

    const { contextSafe } = useGSAP(() => {
        if (movimientoReducido()) return;

        animacion.current = gsap.timeline()
            .fromTo(".modal-fondo", { autoAlpha: 0 }, { autoAlpha: 1, duration: DURACION.rapida, ease: EASE.suave })
            .fromTo(".modal-panel",
                { autoAlpha: 0, y: 40, scale: 0.97 },
                { autoAlpha: 1, y: 0, scale: 1, duration: DURACION.normal, ease: EASE.salida },
                "<0.05"
            )
            .fromTo(".paso", { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, stagger: 0.08, duration: DURACION.rapida }, "-=0.2");
    }, { scope: contenedor });

    const cerrar = contextSafe(() => {
        if (!animacion.current) return alCerrar();

        animacion.current
            .timeScale(1.6)
            .eventCallback("onReverseComplete", alCerrar)
            .reverse();
    });

    useEffect(() => {
        document.body.style.overflow = "hidden";

        const alPresionarTecla = (e) => {
            if (e.key === "Escape") cerrar();
        }
        window.addEventListener("keydown", alPresionarTecla);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", alPresionarTecla);
        }
    }, []);

    const completarPaso = (indice) => {
        setProgreso((actual) => ({
            ...actual,
            pasos: actual.pasos.map((hecho, i) => (i === indice ? true : hecho))
        }));
    }

    const confirmarVisita = () => {
        setProgreso((actual) => ({
            visita: fechaVisita,
            pasos: actual.pasos.map((hecho, i) => (i === 1 ? true : hecho))
        }));
    }

    const claseDelPaso = (indice) => {
        if (progreso.pasos[indice]) return "paso hecho";
        const anteriorHecho = indice === 0 || progreso.pasos[indice - 1];
        return anteriorHecho ? "paso actual" : "paso bloqueado";
    }

    const asunto = encodeURIComponent(`Pano Select: gané la subasta "${subasta.titulo}"`);

    return createPortal(
        <div className="modal" ref={contenedor}>
            <div className="modal-fondo" onClick={cerrar}></div>

            <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="seguir-titulo">
                <header className="modal-cabecera">
                    <div>
                        <span className="eyebrow">¡Ganaste la subasta!</span>
                        <h2 id="seguir-titulo">{subasta.titulo}</h2>
                        <p>Precio final {formatearUSD(subasta.precioActual)}</p>
                    </div>
                    <button type="button" className="modal-cerrar" onClick={cerrar} aria-label="Cerrar">×</button>
                </header>

                <div className="modal-cuerpo">
                    <div className="progreso-compra">
                        <div className="progreso-barra">
                            <span style={{ width: `${(completados / 3) * 100}%` }}></span>
                        </div>
                        <small>{completados} de 3 pasos</small>
                    </div>

                    <ol className="pasos">
                        <li className={claseDelPaso(0)}>
                            <span className="paso-numero">{progreso.pasos[0] ? "✓" : "1"}</span>
                            <div className="paso-contenido">
                                <h3>Contactá al vendedor</h3>
                                <p>
                                    <strong>{vendedor?.nombre}</strong> (@{vendedor?.username}) ya sabe que ganaste.
                                    Escribile para presentarte y coordinar.
                                </p>
                                {!progreso.pasos[0] && (
                                    <div className="paso-acciones">
                                        {vendedor?.email && (
                                            <a className="btn btn-chico" href={`mailto:${vendedor.email}?subject=${asunto}`}>
                                                Escribir a {vendedor.email}
                                            </a>
                                        )}
                                        <button type="button" className="btn-fantasma btn-chico" onClick={() => completarPaso(0)}>
                                            Ya lo contacté
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>

                        <li className={claseDelPaso(1)}>
                            <span className="paso-numero">{progreso.pasos[1] ? "✓" : "2"}</span>
                            <div className="paso-contenido">
                                <h3>Coordiná la revisión</h3>
                                {progreso.pasos[1] ? (
                                    <p>Visita agendada para el <strong>{new Date(progreso.visita).toLocaleString()}</strong>.</p>
                                ) : (
                                    <>
                                        <p>Revisá el auto en persona y, si querés, llevalo a un mecánico de confianza antes de pagar.</p>
                                        {progreso.pasos[0] && (
                                            <div className="paso-acciones">
                                                <input
                                                    type="datetime-local"
                                                    value={fechaVisita}
                                                    onChange={(e) => setFechaVisita(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-chico"
                                                    onClick={confirmarVisita}
                                                    disabled={!fechaVisita || new Date(fechaVisita) < new Date()}
                                                >
                                                    Confirmar visita
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </li>

                        <li className={claseDelPaso(2)}>
                            <span className="paso-numero">{progreso.pasos[2] ? "✓" : "3"}</span>
                            <div className="paso-contenido">
                                <h3>Pago y transferencia</h3>
                                <p>
                                    El pago de {formatearUSD(subasta.precioActual)} se hace directo al vendedor, el día de la firma
                                    ante escribano. Pano Select no cobra comisión al comprador.
                                </p>
                                <ul className="paso-lista">
                                    <li>Cédula de identidad</li>
                                    <li>Título y libreta de propiedad del vehículo</li>
                                    <li>Certificado de no adeudo de patente</li>
                                </ul>
                                {progreso.pasos[1] && !progreso.pasos[2] && (
                                    <div className="paso-acciones">
                                        <button type="button" className="btn btn-acento btn-chico" onClick={() => completarPaso(2)}>
                                            Ya firmé la transferencia
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                    </ol>

                    {terminado && (
                        <div className="compra-terminada">
                            <strong>¡Listo! El {subasta.vehiculo.marca} {subasta.vehiculo.modelo} es tuyo.</strong>
                            <span>Gracias por comprar en Pano Select.</span>
                        </div>
                    )}
                </div>

                <footer className="modal-pie">
                    <button type="button" className="btn-fantasma" onClick={cerrar}>Cerrar</button>
                </footer>
            </div>
        </div>,
        document.body
    )
}

export default ModalComoSeguir