import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap, EASE, DURACION, movimientoReducido } from "../animations/config"

const AuthLayout = ({ titulo, bajada, children }) => {

    const raiz = useRef(null);

    useGSAP(() => {
        if (movimientoReducido()) return;

        gsap.fromTo(".auth-aparecer",
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: DURACION.normal, stagger: 0.05, ease: EASE.salida }
        );

        gsap.fromTo(".auth-marca-contenido > *",
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: DURACION.lenta, stagger: 0.08, ease: EASE.salida, delay: 0.1 }
        );
    }, { scope: raiz });

    return (
        <div className="auth" ref={raiz}>
            <div className="auth-formulario">
                <div className="auth-caja">
                    <header className="auth-aparecer">
                        <h1>{titulo}</h1>
                        <p>{bajada}</p>
                    </header>
                    {children}
                </div>
            </div>

            <aside className="auth-marca">
                <div className="auth-marca-contenido">
                    <span className="eyebrow">Pano Select</span>
                    <h2>El arte de encontrar tu siguiente vehículo.</h2>
                    <ul>
                        <li>Publicá tu auto con hasta cinco fotos.</li>
                        <li>Datos verificados contra el registro NHTSA.</li>
                        <li>Un precio que deciden las ofertas.</li>
                    </ul>
                </div>
            </aside>
        </div>
    )
}

export default AuthLayout