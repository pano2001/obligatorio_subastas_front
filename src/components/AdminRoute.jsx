import { Navigate, Outlet } from "react-router"
import { useSelector } from "react-redux"

const AdminRoute = () => {

    const usuario = useSelector((state) => state.auth.usuario);

    return (
        usuario && usuario.rol === "admin" ? <Outlet /> : <Navigate to="/" />
    )
}   

export default AdminRoute
