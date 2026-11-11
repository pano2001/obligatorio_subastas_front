import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { NavLink, Link } from "react-router"
import { useGSAP } from "@gsap/react"
import { gsap, DURACION, EASE, movimientoReducido } from "../animations/config"

const DISTANCIA_CERRAR = 60;

const MenuMovil = ({ usuario, alCerrar, alSalir }) => {

    const contenedor = useRef(null);
    const animacion = useRef(null);
    const toqueInicio = useRef(null);

    const { contextSafe } = useGSAP(() => {
        if (movimientoReducido()) return;

        animacion.current = gsap.timeline()
            .fromTo(".cajon-fondo", { autoAlpha: 0 }, { autoAlpha: 1, duration: DURACION.rapida, ease: EASE.suave })
            .fromTo(".cajon-panel", { xPercent: 100 }, { xPercent: 0, duration: DURACION.normal, ease: EASE.salida }, "<")
            .fromTo(".cajon-item", { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0, stagger: 0.035, duration: 0.25 }, "-=0.3");
    }, { scope: contenedor });

    const cerrar = contextSafe((despues) => {
        const terminar = () => {
            alCerrar();
            if (typeof despues === "function") despues();
        }

        if (!animacion.current) return terminar();

        animacion.current
            .timeScale(1.8)
            .eventCallback("onReverseComplete", terminar)
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

    // Deslizar el panel hacia la derecha también lo cierra
    const alEmpezarToque = (e) => {
        toqueInicio.current = e.touches[0].clientX;
    }

    const alTerminarToque = (e) => {
        if (toqueInicio.current === null) return;
        const distancia = e.changedTouches[0].clientX - toqueInicio.current;
        if (distancia > DISTANCIA_CERRAR) cerrar();
        toqueInicio.current = null;
    }

    const salir = () => {
        cerrar(alSalir);
    }

    return createPortal(
        <div className="cajon" ref={contenedor}>
            <div className="cajon-fondo" onClick={() => cerrar()}></div>

            <nav
                className="cajon-panel"
                aria-label="Menú principal"
                onTouchStart={alEmpezarToque}
                onTouchEnd={alTerminarToque}
            >
                <div className="cajon-cabecera">
                    {usuario ? (
                        <div className="cajon-usuario">
                            <span className="cajon-avatar">{usuario.nombre.charAt(0).toUpperCase()}</span>
                            <div>
                                <strong>{usuario.nombre}</strong>
                                <span>@{usuario.username} · Plan {usuario.plan === "premium" ? "Premium" : "Plus"}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="cajon-usuario">
                            <div>
                                <strong>¡Hola!</strong>
                                <span>Ingresá para ofertar y publicar</span>
                            </div>
                        </div>
                    )}
                    <button type="button" className="cajon-cerrar" onClick={() => cerrar()} aria-label="Cerrar menú">×</button>
                </div>

                <div className="cajon-cuerpo">
                    {usuario ? (
                        <>
                            <Link to="/subastas/nueva" className="cajon-item cajon-destacado" onClick={() => cerrar()}>
                                + Publicar un vehículo
                            </Link>

                            <span className="cajon-titulo cajon-item">Comprar y vender</span>
                            <NavLink to="/explorar" className="cajon-item" onClick={() => cerrar()}>Explorar</NavLink>
                            <NavLink to="/mis-pujas" className="cajon-item" onClick={() => cerrar()}>Mis pujas</NavLink>
                            <NavLink to="/subastas" end className="cajon-item" onClick={() => cerrar()}>Mis subastas</NavLink>

                            <span className="cajon-titulo cajon-item">Tu cuenta</span>
                            <NavLink to="/configuracion/cuenta" className="cajon-item" onClick={() => cerrar()}>Mi cuenta</NavLink>
                            <NavLink to="/configuracion/plan" className="cajon-item" onClick={() => cerrar()}>Plan</NavLink>
                            <NavLink to="/configuracion/seguridad" className="cajon-item" onClick={() => cerrar()}>Seguridad</NavLink>
                            {usuario.rol === "admin" && (
                                <NavLink to="/configuracion/admin/categorias" className="cajon-item" onClick={() => cerrar()}>
                                    Panel de administración
                                </NavLink>
                            )}
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="cajon-item cajon-destacado" onClick={() => cerrar()}>Iniciar sesión</Link>
                            <Link to="/registro" className="cajon-item" onClick={() => cerrar()}>Crear cuenta</Link>
                            <span className="cajon-titulo cajon-item">Comprar</span>
                            <NavLink to="/explorar" className="cajon-item" onClick={() => cerrar()}>Explorar subastas</NavLink>
                        </>
                    )}
                </div>

                {usuario && (
                    <div className="cajon-pie">
                        <button type="button" className="cajon-item cajon-salir" onClick={salir}>Cerrar sesión</button>
                    </div>
                )}
            </nav>
        </div>,
        document.body
    )
}

export default MenuMovil