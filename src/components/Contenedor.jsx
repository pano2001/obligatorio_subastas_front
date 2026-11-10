import { useEffect, useRef, useState } from "react"
import { Outlet, useNavigate, useLocation, Link, NavLink } from "react-router"
import { useSelector, useDispatch } from "react-redux"
import { useGSAP } from "@gsap/react"
import api from "../config/api.config"
import { gsap, DURACION, EASE, entradaPagina } from "../animations/config"
import { cerrarSesion } from "../features/auth.slice"
import { guardarCategorias } from "../features/categorias.slice"
import logo from "../assets/logo.svg"

const Contenedor = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const usuario = useSelector((state) => state.auth.usuario);

    const [menuAbierto, setMenuAbierto] = useState(false);

    const menuRef = useRef(null);
    const panelRef = useRef(null);
    const paginaRef = useRef(null);
    const animacionMenu = useRef(null);

    useEffect(() => {
        api.get("/categorias")
            .then((response) => {
                dispatch(guardarCategorias(response.data.categorias));
            })
            .catch(() => {
            });
    }, [dispatch]);

    useGSAP(() => {
        if (!panelRef.current) return;

        animacionMenu.current = gsap.timeline({ paused: true })
            .fromTo(panelRef.current,
                { autoAlpha: 0, y: -8, scale: 0.97 },
                { autoAlpha: 1, y: 0, scale: 1, duration: DURACION.rapida, ease: EASE.salida }
            )
            .fromTo(panelRef.current.querySelectorAll(".menu-item"),
                { autoAlpha: 0, y: -4 },
                { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.04, ease: EASE.suave },
                "-=0.15"
            );
    }, { dependencies: [usuario] });

    useEffect(() => {
        if (!animacionMenu.current) return;

        if (menuAbierto) {
            animacionMenu.current.play();
        } else {
            animacionMenu.current.reverse();
        }
    }, [menuAbierto]);

    useEffect(() => {
        const alClickear = (evento) => {
            if (menuRef.current && !menuRef.current.contains(evento.target)) {
                setMenuAbierto(false);
            }
        };

        document.addEventListener("mousedown", alClickear);
        return () => document.removeEventListener("mousedown", alClickear);
    }, []);

    useGSAP(() => {
        entradaPagina(paginaRef.current);
    }, { dependencies: [location.pathname.split("/")[1]] });

    const cerrarMenu = () => {
        setMenuAbierto(false);
    }

    const salir = () => {
        setMenuAbierto(false);
        dispatch(cerrarSesion());
        navigate("/");
    }

    const inicial = usuario?.nombre?.charAt(0).toUpperCase();

    return (
        <>
            <header className="navbar">
                <div className="navbar-contenido">
                    <Link to="/" className="navbar-logo">
                        <img src={logo} alt="Pano Select" />
                    </Link>

                    <nav className="navbar-links">
                        <NavLink to="/explorar">Explorar</NavLink>
                        {usuario && <NavLink to="/subastas" end>Mis subastas</NavLink>}
                        {usuario && <NavLink to="/mis-pujas">Mis pujas</NavLink>}
                    </nav>

                    <div className="navbar-acciones">
                        {usuario ? (
                            <div className="menu-usuario" ref={menuRef}>
                                <button
                                    type="button"
                                    className="avatar"
                                    onClick={() => setMenuAbierto(!menuAbierto)}
                                    aria-expanded={menuAbierto}
                                    aria-label="Abrir el menú de usuario"
                                >
                                    {inicial}
                                </button>

                                <div className="menu-panel" ref={panelRef}>
                                    <Link to="/configuracion/cuenta" className="menu-item" onClick={cerrarMenu}>Mi cuenta</Link>
                                    <Link to="/configuracion/plan" className="menu-item" onClick={cerrarMenu}>Plan</Link>
                                    <Link to="/subastas" className="menu-item" onClick={cerrarMenu}>Mis subastas</Link>
                                    <Link to="/mis-pujas" className="menu-item" onClick={cerrarMenu}>Mis pujas</Link>
                                    <Link to="/subastas/nueva" className="menu-item" onClick={cerrarMenu}>Publicar un vehículo</Link>
                                    <hr className="menu-separador" />
                                    <Link to="/configuracion/seguridad" className="menu-item" onClick={cerrarMenu}>Seguridad</Link>
                                    {usuario.rol === "admin" && (
                                        <Link to="/configuracion/admin/categorias" className="menu-item" onClick={cerrarMenu}>Panel de administración</Link>
                                    )}
                                    <hr className="menu-separador" />
                                    <button type="button" className="menu-item menu-salir" onClick={salir}>
                                        Cerrar sesión
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="boton-texto">Iniciar sesión</Link>
                                <Link to="/registro" className="btn btn-chico">Registrarse</Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main ref={paginaRef}>
                <Outlet />
            </main>
        </>
    )
}

export default Contenedor