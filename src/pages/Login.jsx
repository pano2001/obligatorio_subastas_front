import { useState } from "react"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { Link, useNavigate } from "react-router"
import { useDispatch } from "react-redux"
import { toast } from "sonner"
import api from "../config/api.config"
import { loginSchema } from "../validators/auth.validators"
import { guardarSesion } from "../features/auth.slice"

const Login = () => {

    const [loading, setLoading] = useState(false);
    const [errorApi, setErrorApi] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        resolver: joiResolver(loginSchema)
    })

    const procesarForm = (data) => {
        setErrorApi("");
        setLoading(true);

        api.post("/auth/login", data)
            .then((response) => {
                dispatch(guardarSesion({
                    usuario: response.data.usuario,
                    token: response.data.token
                }));
                toast.success("Bienvenido " + response.data.usuario.nombre);
                navigate("/subastas");
            })
            .catch((error) => {
                setErrorApi(error.response?.data?.message || "No se pudo conectar con el servidor");
            })
            .finally(() => {
                setLoading(false);
            })
    }

    return (
        <div className="container auth-container">
            <header>
                <h1>Login</h1>
            </header>

            <form onSubmit={handleSubmit(procesarForm)}>
                <div className="form-group">
                    <label htmlFor="username">Usuario:</label>
                    <input {...register("username")} type="text" id="username" />
                    <span className="error">{errors.username?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="password">Contraseña:</label>
                    <input {...register("password")} type="password" id="password" />
                    <span className="error">{errors.password?.message}</span>
                </div>

                {errorApi && <p className="error">{errorApi}</p>}

                <button type="submit" disabled={!isValid || loading}>
                    {loading ? "Ingresando..." : "Ingresar"}
                </button>
            </form>

            <p className="register-link">
                ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
            </p>
        </div>
    )
}

export default Login;