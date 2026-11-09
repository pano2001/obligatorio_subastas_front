import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import api from "../config/api.config"
import { passwordSchema } from "../validators/usuarios.validators"
import { cerrarSesion } from "../features/auth.slice"
import { sacudir } from "../animations/config"
import CampoPassword from "../components/CampoPassword"

const Seguridad = () => {

    const [guardando, setGuardando] = useState(false);
    const [errorApi, setErrorApi] = useState("");

    const formulario = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        resolver: joiResolver(passwordSchema)
    })

    const cambiar = (data) => {
        setErrorApi("");
        setGuardando(true);

        api.patch("/usuarios/password", {
            passwordActual: data.passwordActual,
            passwordNueva: data.passwordNueva
        })
            .then(() => {
                toast.success("Tu contraseña se actualizó");
                reset();
            })
            .catch((err) => {
                setErrorApi(err.response?.data?.message || "No se pudo cambiar la contraseña");
                sacudir(formulario.current);
            })
            .finally(() => {
                setGuardando(false);
            })
    }

    const salir = () => {
        dispatch(cerrarSesion());
        navigate("/");
    }

    return (
        <>
            <header className="pagina-encabezado">
                <span className="eyebrow">Configuración</span>
                <h1 className="pagina-titulo">Seguridad</h1>
                <p className="pagina-bajada">Cambiá tu contraseña y administrá tu sesión.</p>
            </header>

            <div className="panel">
                <div className="panel-cabecera">
                    <div>
                        <h2>Cambiar contraseña</h2>
                        <p>Al menos 6 caracteres, con letras y números.</p>
                    </div>
                </div>

                <form ref={formulario} onSubmit={handleSubmit(cambiar)}>
                    <CampoPassword
                        id="passwordActual"
                        etiqueta="Contraseña actual"
                        autoComplete="current-password"
                        registro={register("passwordActual")}
                        error={errors.passwordActual?.message}
                    />

                    <div className="form-grilla">
                        <CampoPassword
                            id="passwordNueva"
                            etiqueta="Nueva contraseña"
                            autoComplete="new-password"
                            registro={register("passwordNueva", { deps: ["passwordActual"] })}
                            error={errors.passwordNueva?.message}
                        />
                        <CampoPassword
                            id="repetirPassword"
                            etiqueta="Repetir nueva contraseña"
                            autoComplete="new-password"
                            registro={register("repetirPassword", { deps: ["passwordNueva"] })}
                            error={errors.repetirPassword?.message}
                        />
                    </div>

                    {errorApi && <p className="error">{errorApi}</p>}

                    <div className="acciones-fila">
                        <button type="submit" disabled={!isValid || guardando}>
                            {guardando ? "Actualizando..." : "Actualizar contraseña"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="panel">
                <div className="panel-cabecera">
                    <div>
                        <h2>Sesión</h2>
                        <p>Cerrá la sesión en este dispositivo.</p>
                    </div>
                    <button type="button" className="btn-peligro btn-chico" onClick={salir}>Cerrar sesión</button>
                </div>
            </div>
        </>
    )
}

export default Seguridad