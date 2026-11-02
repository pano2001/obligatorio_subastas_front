import {Navigate, Outlet} from "react-router";
import {useSelector} from "react-redux";


const ProtectedRoute = () => {
    const token = useSelector((state) => state.auth.token);

    return(
        token ? <Outlet /> : <Navigate to="/" />
    )
}

export default ProtectedRoute;