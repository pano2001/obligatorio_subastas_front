import {Outlet, useNavigate, Link} from "react-router";
import {useSelector, useDispatch} from "react-redux";
import {cerrarSesion} from "../features/auth.slice";
import logo from "../assets/logo.svg";

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
          <Link to="/" className="app-logo">
            <img src={logo} alt="Pano Select" />
           </Link>

          <nav>
            <Link to="/#subastas">Explorar</Link>
            {usuario ? (
              <>
                <Link to="/subastas">Mis subastas</Link>
                <Link to="/account">Mi cuenta</Link>
                {usuario.rol === "admin" && <Link to="/admin/categorias">Categorías</Link>}
                <span>{usuario.nombre}</span>
                <span className="badge-plan">{usuario.plan}</span>
                <button className="logout-btn" onClick={salir} title="Cerrar sesión">Salir</button>
              </>
            ) : (
              <>
                <Link to="/login">Ingresar</Link>
                <Link to="/registro">Crear cuenta</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
    </>
  )
}

export default Contenedor;

