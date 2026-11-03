import {Outlet, useNavigate, Link} from "react-router";
import {useSelector, useDispatch} from "react-redux";
import {cerrarSesion} from "../features/auth.slice";

const Contenedor = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const usuario = useSelector((state) => state.auth.usuario);

    const salir = () => {
        dispatch(cerrarSesion());
        navigate("/");
    }

    return (
    <>
      <header className="main-header">
        <div className="header-content">
          <Link to="/" className="app-logo">🚗<span>Subastas</span></Link>
            {usuario && (
            <div className="usuario-header">
              <span>{usuario.nombre}</span>
              <span className="badge-plan"> {usuario.plan}</span>
              <Link to="/account">Mi cuenta</Link>
              <Link to="/subastas">Mis subastas</Link>
              <button className="logout-btn" onClick={salir} title="Cerrar sesión">Salir</button>
            </div>
          )}
        </div>
      </header>
      <Outlet />
    </>
  )
}

export default Contenedor;

