import { useState } from "react"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router"
import { toast } from "sonner"
import api from "../config/api.config"
import { perfilSchema } from "../validators/usuarios.validators"
import { actualizarUsuario } from "../features/auth.slice"
import InformeUso from "../components/InformeUso"
import GraficoSubastas from "../components/GraficoSubastas"

const MiCuenta = () => {

    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const dispatch = useDispatch();
    const usuario = useSelector((state) => state.auth.usuario);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isDirty },
    } = useForm({
        mode: "onChange",
        resolver: joiResolver(perfilSchema),
        defaultValues: {
            nombre: usuario.nombre,
            email: usuario.email
        }
    })

    const cancelar = () => {
        reset({ nombre: usuario.nombre, email: usuario.email });
        setEditando(false);
    }

    const guardar = (data) => {
        setGuardando(true);

        api.patch("/usuarios/perfil", data)
            .then((response) => {
                const actualizado = response.data.usuario;
                dispatch(actualizarUsuario(actualizado));
                reset({ nombre: actualizado.nombre, email: actualizado.email });
                toast.success("Tus datos se actualizaron");
                setEditando(false);
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "No se pudieron guardar los cambios");
            })
            .finally(() => {
                setGuardando(false);
            })
    }

    const miembroDesde = usuario.createdAt
        ? new Date(usuario.createdAt).toLocaleDateString("es-UY", { month: "long", year: "numeric" })
        : "—";

    return (
        <>
            <header className="pagina-encabezado">
                <span className="eyebrow">Configuración</span>
                <h1 className="pagina-titulo">Mi cuenta</h1>
                <p className="pagina-bajada">Tus datos personales y la actividad de tu cuenta.</p>
            </header>

            <div className="panel">
                <div className="panel-cabecera">
                    <div>
                        <h2>Datos personales</h2>
                        <p>Así te identifican los demás usuarios.</p>
                    </div>
                    {!editando && (
                        <button type="button" className="btn-secundario btn-chico" onClick={() => setEditando(true)}>
                            Editar
                        </button>
                    )}
                </div>

                {editando ? (
                    <form onSubmit={handleSubmit(guardar)}>
                        <div className="form-grilla">
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre</label>
                                <input id="nombre" type="text" {...register("nombre")} />
                                <span className="error">{errors.nombre?.message}</span>
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input id="email" type="email" {...register("email")} />
                                <span className="error">{errors.email?.message}</span>
                            </div>
                        </div>
                        <div className="acciones-fila">
                            <button type="submit" disabled={!isValid || !isDirty || guardando}>
                                {guardando ? "Guardando..." : "Guardar cambios"}
                            </button>
                            <button type="button" className="btn-secundario" onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                ) : (
                    <div className="datos">
                        <div className="dato">
                            <span>Nombre</span>
                            <strong>{usuario.nombre}</strong>
                        </div>
                        <div className="dato">
                            <span>Usuario</span>
                            <strong>@{usuario.username}</strong>
                        </div>
                        <div className="dato">
                            <span>Email</span>
                            <strong>{usuario.email}</strong>
                        </div>
                        <div className="dato">
                            <span>Miembro desde</span>
                            <strong>{miembroDesde}</strong>
                        </div>
                    </div>
                )}
            </div>

            <div className="panel">
                <div className="panel-cabecera">
                    <div>
                        <h2>Informe de uso</h2>
                        <p>Plan {usuario.plan === "premium" ? "Premium" : "Plus"}</p>
                    </div>
                    <Link to="/configuracion/plan" className="btn btn-secundario btn-chico">Ver planes</Link>
                </div>
                <InformeUso />
            </div>

            <GraficoSubastas />
        </>
    )
}

export default MiCuenta