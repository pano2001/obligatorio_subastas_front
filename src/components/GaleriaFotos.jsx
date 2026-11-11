import { useEffect, useRef, useState } from "react"
import { useGSAP } from "@gsap/react"
import { gsap, EASE, movimientoReducido } from "../animations/config"
import VisorFotos from "./VisorFotos"

const GaleriaFotos = ({ imagenes, titulo }) => {

    const [indice, setIndice] = useState(0);
    const [visorAbierto, setVisorAbierto] = useState(false);
    const [esVertical, setEsVertical] = useState(false);

    const contenedor = useRef(null);
    const primeraVez = useRef(true);

    const cantidad = imagenes.length;
    const hayVarias = cantidad > 1;

    // Cuando termina de cargar la foto, vemos si es más alta que ancha
    const alCargarFoto = (evento) => {
        const { naturalWidth, naturalHeight } = evento.currentTarget;
        setEsVertical(naturalHeight > naturalWidth);
    }

    const cambiar = (direccion) => {
        setIndice((actual) => (actual + direccion + cantidad) % cantidad);
    }

    // Flechas del teclado (salvo que estés escribiendo en un campo o con el visor abierto)
    useEffect(() => {
        if (!hayVarias || visorAbierto) return;

        const alPresionarTecla = (e) => {
            const escribiendo = ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName);
            if (escribiendo) return;
            if (e.key === "ArrowLeft") cambiar(-1);
            if (e.key === "ArrowRight") cambiar(1);
        }

        window.addEventListener("keydown", alPresionarTecla);
        return () => window.removeEventListener("keydown", alPresionarTecla);
    }, [hayVarias, visorAbierto, cantidad]);

    // Transición suave cada vez que cambia la foto
    useGSAP(() => {
        if (primeraVez.current || movimientoReducido()) {
            primeraVez.current = false;
            return;
        }
        gsap.fromTo(".galeria-foto",
            { autoAlpha: 0.3, scale: 1.02 },
            { autoAlpha: 1, scale: 1, duration: 0.35, ease: EASE.salida }
        );
    }, { dependencies: [indice], scope: contenedor });

    if (cantidad === 0) {
        return <div className="sin-imagen foto-principal">Sin fotos</div>
    }

    return (
        <div className="galeria" ref={contenedor}>
            <div className="galeria-principal">
                <button
                    type="button"
                    className={esVertical ? "galeria-ampliar vertical" : "galeria-ampliar"}
                    onClick={() => setVisorAbierto(true)}
                    aria-label="Ver foto en pantalla completa"
                >
                    {esVertical && <img className="galeria-fondo" src={imagenes[indice]} alt="" aria-hidden="true" />}
                    <img
                        className="galeria-foto foto-principal"
                        src={imagenes[indice]}
                        alt={`${titulo}, foto ${indice + 1}`}
                        onLoad={alCargarFoto}
                    />
                </button>

                {hayVarias && (
                    <>
                        <button type="button" className="galeria-flecha izquierda" onClick={() => cambiar(-1)} aria-label="Foto anterior">‹</button>
                        <button type="button" className="galeria-flecha derecha" onClick={() => cambiar(1)} aria-label="Foto siguiente">›</button>
                        <span className="galeria-contador">{indice + 1} / {cantidad}</span>
                    </>
                )}

                <span className="galeria-pista">Clic para ampliar</span>
            </div>

            {hayVarias && (
                <div className="miniaturas">
                    {imagenes.map((url, i) => (
                        <img
                            src={url}
                            alt={`Foto ${i + 1}`}
                            key={url}
                            className={i === indice ? "miniatura activa" : "miniatura"}
                            onClick={() => setIndice(i)}
                        />
                    ))}
                </div>
            )}

            {visorAbierto && (
                <VisorFotos
                    imagenes={imagenes}
                    titulo={titulo}
                    indiceInicial={indice}
                    alCambiar={setIndice}
                    alCerrar={() => setVisorAbierto(false)}
                />
            )}
        </div>
    )
}

export default GaleriaFotos