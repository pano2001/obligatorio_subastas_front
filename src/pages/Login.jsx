import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { Link, useNavigate } from "react-router"
import { useDispatch } from "react-redux"
import { toast } from "../utils/avisos"
import api from "../config/api.config"
import { loginSchema } from "../validators/auth.validators"
import { guardarSesion } from "../features/auth.slice"
import { sacudir } from "../animations/config"
import AuthLayout from "../components/AuthLayout"
import BotonGoogle from "../components/BotonGoogle"
import CampoPassword from "../components/CampoPassword"

const Login = () => {

    const [loading, setLoading] = useState(false);
    const [errorApi, setErrorApi] = useState("");

    const formulario = useRef(null);
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
                toast.success(`Hola, ${response.data.usuario.nombre}`);
                navigate("/");
            })
            .catch((error) => {
                setErrorApi(error.response?.data?.message || "No se pudo conectar con el servidor");
                sacudir(formulario.current);
            })
            .finally(() => {
                setLoading(false);
            })
    }

    return (
        <AuthLayout titulo="Bienvenido de nuevo" bajada="Ingresá para pujar y gestionar tus subastas.">
            <div className="auth-aparecer">
                <BotonGoogle texto="signin_with" />
            </div>

            <div className="separador auth-aparecer">
                <span>o con tu usuario</span>
            </div>

            <form ref={formulario} onSubmit={handleSubmit(procesarForm)} noValidate>
                <div className="form-group auth-aparecer">
                    <label htmlFor="username">Usuario</label>
                    <input id="username" type="text" autoComplete="username" {...register("username")} />
                    <span className="error">{errors.username?.message}</span>
                </div>

                <div className="auth-aparecer">
                    <CampoPassword
                        id="password"
                        etiqueta="Contraseña"
                        autoComplete="current-password"
                        registro={register("password")}
                        error={errors.password?.message}
                    />
                </div>

                {errorApi && <div className="auth-error" role="alert">{errorApi}</div>}

                <button type="submit" className="btn-bloque btn-grande auth-aparecer" disabled={!isValid || loading}>
                    {loading ? "Ingresando..." : "Ingresar"}
                </button>
            </form>

            <p className="auth-cambio auth-aparecer">
                ¿No tenés cuenta? <Link to="/registro">Creá una gratis</Link>
            </p>
        </AuthLayout>
    )
}

export default Login