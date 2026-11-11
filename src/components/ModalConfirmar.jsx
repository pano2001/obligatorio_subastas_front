import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useGSAP } from "@gsap/react"
import { gsap, DURACION, EASE, movimientoReducido } from "../animations/config"

const ModalConfirmar = ({ titulo, mensaje, textoConfirmar = "Confirmar", alConfirmar, alCerrar }) => {

    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");

    const contenedor = useRef(null);
    const animacion = useRef(null);

    const { contextSafe } = useGSAP(() => {
        if (movimientoReducido()) return;

        animacion.current = gsap.timeline()
            .fromTo(".modal-fondo", { autoAlpha: 0 }, { autoAlpha: 1, duration: DURACION.rapida, ease: EASE.suave })
            .fromTo(".modal-panel",
                { autoAlpha: 0, y: 24, scale: 0.96 },
                { autoAlpha: 1, y: 0, scale: 1, duration: DURACION.rapida, ease: EASE.salida },
                "<0.05"
            );
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

    const confirmar = () => {
        setProcesando(true);
        setError("");

        alConfirmar()
            .then(() => cerrar())
            .catch((err) => {
                setError(err.response?.data?.message || "No se pudo completar la acción. Probá de nuevo.");
                setProcesando(false);
            });
    }

    return createPortal(
        <div className="modal" ref={contenedor}>
            <div className="modal-fondo" onClick={procesando ? undefined : cerrar}></div>

            <div className="modal-panel modal-confirmar" role="alertdialog" aria-modal="true" aria-labelledby="confirmar-titulo" aria-describedby="confirmar-mensaje">
                <div className="confirmar-cuerpo">
                    <span className="confirmar-icono" aria-hidden="true">!</span>
                    <div>
                        <h2 id="confirmar-titulo">{titulo}</h2>
                        <p id="confirmar-mensaje">{mensaje}</p>
                        {error && <p className="confirmar-error" role="alert">{error}</p>}
                    </div>
                </div>

                <footer className="modal-pie">
                    <button type="button" className="btn-fantasma" onClick={cerrar} disabled={procesando}>
                        {error ? "Cerrar" : "Cancelar"}
                    </button>
                    {!error && (
                        <button type="button" className="btn-peligro" onClick={confirmar} disabled={procesando} autoFocus>
                            {procesando ? "Eliminando..." : textoConfirmar}
                        </button>
                    )}
                </footer>
            </div>
        </div>,
        document.body
    )
}

export default ModalConfirmar