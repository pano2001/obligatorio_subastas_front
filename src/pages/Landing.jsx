import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { useSelector, useDispatch } from "react-redux"
import { useGSAP } from "@gsap/react"
import api from "../config/api.config"
import { guardarPublicas } from "../features/subastas.slice"
import { gsap, SplitText, ScrollTrigger, EASE, DURACION, movimientoReducido } from "../animations/config"
import TarjetaSubasta from "../components/TarjetaSubasta"
import EsqueletoTarjetas from "../components/EsqueletoTarjetas"

const Landing = () => {

    const [loading, setLoading] = useState(true);

    const dispatch = useDispatch();
    const publicas = useSelector((state) => state.subastas.publicas);
    const raiz = useRef(null);

    // 8 = dos filas completas de 4 en la compu (y 4 filas de 2 en tablet)
    const destacadas = [...publicas]
    .filter((subasta) => subasta.estado === "activa")
    .sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin))
    .slice(0, 8);

    useEffect(() => {
        api.get("/subastas", { params: { estado: "activa" } })
            .then((response) => {
                dispatch(guardarPublicas(response.data.subastas));
            })
            .catch(() => {
            })
            .finally(() => {
                setLoading(false);
            });
    }, [dispatch]);

    useGSAP(() => {
        if (movimientoReducido()) return;

        const division = SplitText.create(".hero-titulo", { type: "words" });

        gsap.timeline()
            .from(division.words, { autoAlpha: 0, y: 32, duration: DURACION.lenta, stagger: 0.05, ease: EASE.salida })
            .from(".hero-aparecer", { autoAlpha: 0, y: 20, duration: DURACION.normal, stagger: 0.08, ease: EASE.salida }, "-=0.45");

        gsap.to(".franja-pista", { xPercent: -50, duration: 28, ease: "none", repeat: -1 });

        return () => division.revert();
    }, { scope: raiz });

    useGSAP(() => {
        if (loading || movimientoReducido()) return;

        const tarjetas = raiz.current.querySelectorAll(".destacadas .tarjeta");
        gsap.set(tarjetas, { autoAlpha: 0, y: 24 });

        ScrollTrigger.batch(tarjetas, {
            once: true,
            start: "top 90%",
            onEnter: (lote) => gsap.to(lote, {
                autoAlpha: 1,
                y: 0,
                duration: DURACION.normal,
                stagger: 0.08,
                ease: EASE.salida,
                clearProps: "transform"
            })
        });
    }, { scope: raiz, dependencies: [loading] });

    return (
        <div ref={raiz}>
            <div className="portada">
                <section className="hero">
                    <span className="eyebrow hero-aparecer">Subastas de vehículos · Uruguay</span>

                    <h1 className="hero-titulo">
                        <span>Comprar o vender.</span>
                        <span>Nunca fue tan simple.</span>
                    </h1>

                    <p className="hero-bajada hero-aparecer">
                        Publicá tu auto o pujá por el que buscás. Datos verificados, fotos reales y un precio que deciden las ofertas.
                    </p>

                    <div className="hero-acciones hero-aparecer">
                        <Link to="/explorar" className="btn btn-grande">Ver subastas activas</Link>
                        <Link to="/subastas/nueva" className="btn btn-secundario btn-grande">Publicar mi auto</Link>
                    </div>

                    <div className="hero-datos hero-aparecer">
                        <div>
                            <strong>Publicá en minutos</strong>
                            <span>Hasta cinco fotos por vehículo</span>
                        </div>
                        <div>
                            <strong>Datos verificados</strong>
                            <span>Marca, modelo y año contra el registro NHTSA</span>
                        </div>
                        <div>
                            <strong>Pujas transparentes</strong>
                            <span>El precio lo define el mercado</span>
                        </div>
                    </div>
                </section>

                <div className="franja">
                    <div className="franja-pista">
                        <span>Subastas activas — Vehículos seleccionados — Pujas transparentes — Publicá gratis — </span>
                        <span>Subastas activas — Vehículos seleccionados — Pujas transparentes — Publicá gratis — </span>
                    </div>
                </div>
            </div>

            <section className="destacadas">
                <div className="seccion-cabecera">
                    <div>
                        <span className="eyebrow">La vidriera</span>
                        <h2 className="seccion-titulo">Subastas activas</h2>
                    </div>
                    <Link to="/explorar" className="btn btn-secundario">Ver todas</Link>
                </div>

                {loading ? (
                    <EsqueletoTarjetas cantidad={4} />
                ) : destacadas.length === 0 ? (
                    <div className="estado-vacio">
                        <h3>Todavía no hay subastas activas</h3>
                        <p>Sé el primero en publicar un vehículo.</p>
                        <Link to="/subastas/nueva" className="btn">Publicar mi auto</Link>
                    </div>
                ) : (
                    <div className="grilla">
                        {destacadas.map((subasta) => (
                            <TarjetaSubasta subasta={subasta} key={subasta._id} />
                        ))}
                    </div>
                )}
            </section>

            <section className="cierre">
                <h2 className="cierre-titulo">¿Tenés un auto para vender?</h2>
                <p className="cierre-texto">Publicalo hoy y dejá que los interesados compitan por él.</p>
                <Link to="/subastas/nueva" className="btn btn-claro btn-grande">Publicar mi vehículo</Link>
            </section>

            <footer className="pie">
                <span>Pano Select</span>
                <span>
                    Desarrollo Full Stack · 2026 · <Link to="/privacidad">Política de privacidad</Link>
                </span>
            </footer>
        </div>
    )
}

export default Landing