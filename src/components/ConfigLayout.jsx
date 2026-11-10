import { useEffect, useRef, useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router"
import { useSelector, useDispatch } from "react-redux"
import { useGSAP } from "@gsap/react"
import api from "../config/api.config"
import { guardarSubastas } from "../features/subastas.slice"
import { gsap, DURACION, EASE, entradaPagina, movimientoReducido } from "../animations/config"

const ConfigLayout = () => {

    const [actividadAbierta, setActividadAbierta] = useState(false);
    const [pujasEnCurso, setPujasEnCurso] = useState(0);

    const dispatch = useDispatch();
    const location = useLocation();
    const usuario = useSelector((state) => state.auth.usuario);
    const subastas = useSelector((state) => state.subastas.subastas);

    const contenido = useRef(null);
    const menu = useRef(null);
    const primeraVez = useRef(true);

    const subastasActivas = subastas.filter((subasta) => subasta.estado === "activa").length;

    useEffect(() => {
        api.get("/subastas", { params: { vendedor: usuario._id } })
            .then((response) => {
                dispatch(guardarSubastas(response.data.subastas));
            })
            .catch(() => {
            });

        api.get("/pujas/mias")
            .then((response) => {
                const enCurso = response.data.participaciones.filter(
                    (p) => p.resultado === "ganando" || p.resultado === "superada"
                );
                setPujasEnCurso(enCurso.length);
            })
            .catch(() => {
            });
    }, [usuario._id, dispatch]);

    useGSAP(() => {
        entradaPagina(contenido.current);
    }, { dependencies: [location.pathname] });

    // Despliega o pliega "Tu actividad"
    useGSAP(() => {
        const altura = actividadAbierta ? "auto" : 0;
        const giro = actividadAbierta ? 180 : 0;

        if (primeraVez.current || movimientoReducido()) {
            primeraVez.current = false;
            gsap.set(".actividad-opciones", { height: altura });
            gsap.set(".actividad-flecha", { rotation: giro });
            return;
        }

        gsap.to(".actividad-opciones", { height: altura, duration: DURACION.rapida, ease: EASE.entradaSalida });
        gsap.to(".actividad-flecha", { rotation: giro, duration: DURACION.rapida, ease: EASE.entradaSalida });

        if (actividadAbierta) {
            gsap.fromTo(".actividad-opciones a",
                { autoAlpha: 0, x: -8 },
                { autoAlpha: 1, x: 0, stagger: 0.06, duration: DURACION.rapida, delay: 0.1 }
            );
        }
    }, { dependencies: [actividadAbierta], scope: menu });

    return (
        <div className="config">
            <aside className="config-menu" ref={menu}>
                <div className="config-perfil">
                    <div className="config-avatar">{usuario.nombre.charAt(0).toUpperCase()}</div>
                    <div>
                        <strong>{usuario.nombre}</strong>
                        <span>{usuario.email}</span>
                    </div>
                </div>

                <span className="config-menu-titulo">Cuenta</span>
                <NavLink to="/configuracion/cuenta">Mi cuenta</NavLink>
                <NavLink to="/configuracion/plan">Plan</NavLink>
                <NavLink to="/configuracion/seguridad">Seguridad</NavLink>

                <div className="config-actividad">
                    <button
                        type="button"
                        className="actividad-boton"
                        onClick={() => setActividadAbierta(!actividadAbierta)}
                        aria-expanded={actividadAbierta}
                    >
                        Tu actividad
                        <span className="actividad-flecha">▾</span>
                    </button>

                    <div className="actividad-opciones">
                        <NavLink to="/subastas" end>
                            Mis subastas
                            {subastasActivas > 0 && <span className="actividad-numero">{subastasActivas}</span>}
                        </NavLink>
                        <NavLink to="/mis-pujas">
                            Mis pujas
                            {pujasEnCurso > 0 && <span className="actividad-numero">{pujasEnCurso}</span>}
                        </NavLink>
                    </div>
                </div>

                {usuario.rol === "admin" && (
                    <>
                        <span className="config-menu-titulo">Administración</span>
                        <NavLink to="/configuracion/admin/categorias">Categorías</NavLink>
                    </>
                )}
            </aside>

            <section className="config-contenido" ref={contenido}>
                <Outlet />
            </section>
        </div>
    )
}

export default ConfigLayout