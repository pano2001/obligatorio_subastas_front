import {useState} from 'react'
import {useForm} from "react-hook-form";
import {useDispatch} from "react-redux";
import {Link, useNavigate} from "react-router";
import {joiResolver} from "@hookform/resolvers/joi";
import {registerSchema} from "../validators/auth.validators";
import {guardarSesion} from "../features/auth.slice";
import api from "../config/api.config";
import {toast} from "sonner";

const Registro = () => {
    const [loading, setLoading] = useState(false);
    const [errorApi, setErrorApi] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: {errors, isValid},
    } = useForm({
        mode: "onChange",
        resolver: joiResolver(registerSchema),
    })
    
    const procesarForm = (data) => {
        const {repetirPassword, ...datos} = data;

        setErrorApi("");
        setLoading(true);

        api.post("/auth/register", datos)
            .then((response) => {
                dispatch(guardarSesion({
                    usuario: response.data.usuario,
                    token: response.data.token
                }));
                toast.success("Cuenta creada con éxito");
                navigate("/");
            })
            .catch ((error) => {
                setErrorApi(error.response?.data?.message || "Error al crear la cuenta");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <div className="container auth-container">
            <header>
                <h1>Registro</h1>
            </header>

            <form onSubmit={handleSubmit(procesarForm)}>
                <div className="form-group">
                    <label htmlFor="nombre">Nombre:</label>
                    <input {...register("nombre")} type="text" id="nombre" />
                    <span className="error">{errors.nombre?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="username">Usuario:</label>
                    <input {...register("username")} type="text" id="username" />
                    <span className="error">{errors.username?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input {...register("email")} type="email" id="email" />
                    <span className="error">{errors.email?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="password">Contraseña:</label>
                    <input {...register("password")} type="password" id="password" />
                    <span className="error">{errors.password?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="repetirPassword">Repetir contraseña:</label>
                    <input {...register("repetirPassword", { deps: ["password"] })} type="password" id="repetirPassword" />
                    <span className="error">{errors.repetirPassword?.message}</span>
                </div>

                {errorApi && <p className="error">{errorApi}</p>}

                <button type="submit" disabled={!isValid || loading}>
                    {loading ? "Registrando..." : "Registrarse"}
                </button>
            </form>

            <p className="login-link">
                ¿Ya tienes cuenta? <Link to="/login">Ingresa aquí</Link>
            </p>
        </div>
    )
}

export default Registro