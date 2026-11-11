import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useGSAP } from "@gsap/react"
import { gsap, DURACION, EASE, movimientoReducido } from "../animations/config"

const DISTANCIA_DESLIZAR = 50;

const VisorFotos = ({ imagenes, titulo, indiceInicial, alCambiar, alCerrar }) => {

    const [indice, setIndice] = useState(indiceInicial);
    const [zoom, setZoom] = useState(false);
    const [origen, setOrigen] = useState("50% 50%");

    const contenedor = useRef(null);
    const animacion = useRef(null);
    const toqueInicio = useRef(null);

    const cantidad = imagenes.length;
    const hayVarias = cantidad > 1;

    const { contextSafe } = useGSAP(() => {
        if (movimientoReducido()) return;

        animacion.current = gsap.timeline()
            .fromTo(".visor-fondo", { autoAlpha: 0 }, { autoAlpha: 1, duration: DURACION.rapida, ease: EASE.suave })
            .fromTo(".visor-marco", { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: DURACION.normal, ease: EASE.salida }, "<0.05")
            .fromTo(".visor-control", { autoAlpha: 0 }, { autoAlpha: 1, duration: DURACION.rapida }, "-=0.2");
    }, { scope: contenedor });

    const cerrar = contextSafe(() => {
        if (!animacion.current) return alCerrar();

        animacion.current
            .timeScale(1.8)
            .eventCallback("onReverseComplete", alCerrar)
            .reverse();
    });

    const cambiar = (direccion) => {
        setZoom(false);
        setIndice((actual) => (actual + direccion + cantidad) % cantidad);
    }

    
    useEffect(() => {
        alCambiar(indice);
    }, [indice]);

    useEffect(() => {
        document.body.style.overflow = "hidden";

        const alPresionarTecla = (e) => {
            if (e.key === "Escape") cerrar();
            if (hayVarias && e.key === "ArrowLeft") cambiar(-1);
            if (hayVarias && e.key === "ArrowRight") cambiar(1);
        }
        window.addEventListener("keydown", alPresionarTecla);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", alPresionarTecla);
        }
    }, []);

   
    const puntoEnFoto = (evento) => {
        const caja = evento.currentTarget.getBoundingClientRect();
        const x = ((evento.clientX - caja.left) / caja.width) * 100;
        const y = ((evento.clientY - caja.top) / caja.height) * 100;
        return `${x}% ${y}%`;
    }

    const alternarZoom = (evento) => {
        setOrigen(puntoEnFoto(evento));
        setZoom(!zoom);
    }

    
    const alMoverMouse = (evento) => {
        if (zoom) setOrigen(puntoEnFoto(evento));
    }

    const alEmpezarToque = (evento) => {
        toqueInicio.current = evento.touches[0].clientX;
    }

    const alTerminarToque = (evento) => {
        if (zoom || toqueInicio.current === null || !hayVarias) return;

        const distancia = evento.changedTouches[0].clientX - toqueInicio.current;
        if (Math.abs(distancia) > DISTANCIA_DESLIZAR) {
            cambiar(distancia < 0 ? 1 : -1);
        }
        toqueInicio.current = null;
    }

    return createPortal(
        <div className="visor" ref={contenedor} role="dialog" aria-modal="true" aria-label={`Fotos de ${titulo}`}>
            <div className="visor-fondo" onClick={cerrar}></div>

            <button type="button" className="visor-control visor-cerrar" onClick={cerrar} aria-label="Cerrar">×</button>

            {hayVarias && (
                <span className="visor-control visor-contador">{indice + 1} / {cantidad}</span>
            )}

            <div
                className={zoom ? "visor-marco con-zoom" : "visor-marco"}
                onClick={alternarZoom}
                onMouseMove={alMoverMouse}
                onTouchStart={alEmpezarToque}
                onTouchEnd={alTerminarToque}
            >
                <img
                    className="visor-imagen"
                    src={imagenes[indice]}
                    alt={`${titulo}, foto ${indice + 1}`}
                    style={{ transform: zoom ? "scale(2.2)" : "scale(1)", transformOrigin: origen }}
                    draggable="false"
                />
            </div>

            {hayVarias && (
                <>
                    <button type="button" className="visor-control visor-flecha izquierda" onClick={() => cambiar(-1)} aria-label="Foto anterior">‹</button>
                    <button type="button" className="visor-control visor-flecha derecha" onClick={() => cambiar(1)} aria-label="Foto siguiente">›</button>
                </>
            )}

            <span className="visor-control visor-pista">
                {zoom ? "Mové el mouse para recorrer · clic para alejar" : "Clic en la foto para hacer zoom"}
            </span>
        </div>,
        document.body
    )
}

export default VisorFotos