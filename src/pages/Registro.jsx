import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { Link, useNavigate } from "react-router"
import { useDispatch } from "react-redux"
import { toast } from "sonner"
import api from "../config/api.config"
import { registerSchema } from "../validators/auth.validators"
import { guardarSesion } from "../features/auth.slice"
import { sacudir } from "../animations/config"
import AuthLayout from "../components/AuthLayout"
import BotonGoogle from "../components/BotonGoogle"
import CampoPassword from "../components/CampoPassword"

const Registro = () => {

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
        resolver: joiResolver(registerSchema)
    })

    const procesarForm = (data) => {
        const { repetirPassword, ...datos } = data;

        setErrorApi("");
        setLoading(true);

        api.post("/auth/register", datos)
            .then((response) => {
                dispatch(guardarSesion({
                    usuario: response.data.usuario,
                    token: response.data.token
                }));
                toast.success("Tu cuenta está lista");
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
        <AuthLayout titulo="Creá tu cuenta" bajada="Es gratis y te lleva menos de un minuto.">
            <div className="auth-aparecer">
                <BotonGoogle texto="signup_with" />
            </div>

            <div className="separador auth-aparecer">
                <span>o con tu email</span>
            </div>

            <form ref={formulario} onSubmit={handleSubmit(procesarForm)} noValidate>
                <div className="form-grilla auth-aparecer">
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre</label>
                        <input id="nombre" type="text" autoComplete="name" {...register("nombre")} />
                        <span className="error">{errors.nombre?.message}</span>
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Usuario</label>
                        <input id="username" type="text" autoComplete="username" {...register("username")} />
                        <span className="error">{errors.username?.message}</span>
                    </div>
                </div>

                <div className="form-group auth-aparecer">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" autoComplete="email" {...register("email")} />
                    <span className="error">{errors.email?.message}</span>
                </div>

                <div className="auth-aparecer">
                    <CampoPassword
                        id="password"
                        etiqueta="Contraseña"
                        autoComplete="new-password"
                        registro={register("password")}
                        error={errors.password?.message}
                    />
                </div>

                <div className="auth-aparecer">
                    <CampoPassword
                        id="repetirPassword"
                        etiqueta="Repetir contraseña"
                        autoComplete="new-password"
                        registro={register("repetirPassword", { deps: ["password"] })}
                        error={errors.repetirPassword?.message}
                    />
                </div>

                {errorApi && <div className="auth-error" role="alert">{errorApi}</div>}

                <button type="submit" className="btn-bloque btn-grande auth-aparecer" disabled={!isValid || loading}>
                    {loading ? "Creando tu cuenta..." : "Crear cuenta"}
                </button>
            </form>

            <p className="auth-cambio auth-aparecer">
                ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
            </p>
        </AuthLayout>
    )
}

export default Registro