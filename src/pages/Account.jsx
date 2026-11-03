import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import api from "../config/api.config"
import { guardarSubastas } from "../features/subastas.slice"
import InformeUso from "../components/InformeUso"
import CambioPlan from "../components/CambioPlan"
import GraficoSubastas from "../components/GraficoSubastas"


const Account = () => {

    const usuario = useSelector((state) => state.auth.usuario);
    const dispatch = useDispatch();

    useEffect(() => {
        api.get("/subastas", { params: { vendedor: usuario._id } })
            .then((response) => {
                dispatch(guardarSubastas(response.data.subastas));
            })
            .catch(() => {

            });
    }, [usuario._id, dispatch]);

    return (
        <div className="container">
            <h1>Mi cuenta</h1>

            <div className="datos-usuario">
                <p>Nombre: {usuario.nombre}</p>
                <p>Usuario: {usuario.username}</p>
                <p>Email: {usuario.email}</p>
                <p>Plan: {usuario.plan}</p>
            </div>

            <InformeUso />
            <CambioPlan />
            <GraficoSubastas />
        </div>
    )
}

export default Account