import { Link } from "react-router"
import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import Procesos from "../components/Procesos"
import { useLocation } from "react-router"
import { useEffect } from "react"
import Explorar from "./Explorar"

const Landing = () => {

    const contenedor = useRef(null);

    useGSAP(() => {
        gsap.fromTo(".hero-linea",
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", clearProps: "transform,opacity" }
        );
    }, { scope: contenedor });

    const location = useLocation();

    useEffect(() => {
        if (location.hash === "#subastas") {
            document.querySelector("#subastas")?.scrollIntoView({ behavior: "smooth" });
        }
    }, [location]);

    return (
        <div ref={contenedor}>
            <section className="hero">
                <h1 className="hero-titulo">
                    <span className="hero-linea">Comprar o vender.</span>
                    <span className="hero-linea">Nunca fue tan simple.</span>
                </h1>

                <p className="hero-bajada hero-linea">
                    Pano Select — el arte de encontrar tu siguiente vehículo.
                </p>

                <div className="hero-acciones hero-linea">
                    <Link to="/explorar" className="boton-primario">Explorar subastas</Link>
                    <Link to="/registro" className="boton-secundario">Crear cuenta</Link>
                </div>
            </section>

            <Procesos />
            <section id="subastas">
            <Explorar />
        </section>
        </div>
    )
}

export default Landing