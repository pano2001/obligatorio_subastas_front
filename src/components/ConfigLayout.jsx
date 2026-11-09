import { useEffect, useRef } from "react"
import { NavLink, Outlet, useLocation } from "react-router"
import { useSelector, useDispatch } from "react-redux"
import { useGSAP } from "@gsap/react"
import api from "../config/api.config"
import { guardarSubastas } from "../features/subastas.slice"
import { entradaPagina } from "../animations/config"

const ConfigLayout = () => {

    const dispatch = useDispatch();
    const location = useLocation();
    const usuario = useSelector((state) => state.auth.usuario);
    const contenido = useRef(null);

    useEffect(() => {
        api.get("/subastas", { params: { vendedor: usuario._id } })
            .then((response) => {
                dispatch(guardarSubastas(response.data.subastas));
            })
            .catch(() => {
            });
    }, [usuario._id, dispatch]);

    useGSAP(() => {
        entradaPagina(contenido.current);
    }, { dependencies: [location.pathname] });

    return (
        <div className="config">
            <aside className="config-menu">
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