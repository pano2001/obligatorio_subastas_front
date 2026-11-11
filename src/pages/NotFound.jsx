import { Link } from "react-router"

const NotFound = () => {
    return (
        <div className="container">
            <div className="estado-vacio">
                <h3>No encontramos esta página</h3>
                <p>Puede que el link esté mal escrito o que la publicación ya no exista.</p>
                <Link to="/explorar" className="btn">Ver subastas</Link>
            </div>
        </div>
    )
}

export default NotFound