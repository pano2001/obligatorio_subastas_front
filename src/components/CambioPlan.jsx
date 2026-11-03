import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "sonner"
import api from "../config/api.config"
import { guardarSesion } from "../features/auth.slice"

const CambioPlan = () => {

    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const usuario = useSelector((state) => state.auth.usuario);

    const mejorarPlan = () => {
        setLoading(true);

        api.patch("/usuarios/mejorar-plan")
            .then((response) => {
                dispatch(guardarSesion({
                    usuario: response.data.usuario,
                    token: response.data.token
                }));
                toast.success("Ahora tenés el plan premium");
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "No se pudo cambiar el plan");
            })
            .finally(() => {
                setLoading(false);
            });
        }

        return (
        <div className="cambio-plan">
            <h2>Mejorá tu plan</h2>
            <p>Con premium podés publicar subastas ilimitadas.</p>
            <button onClick={mejorarPlan} disabled={loading}>
                {loading ? "Procesando..." : "Pasar a premium"}
            </button>
        </div>
    )
}

export default CambioPlan