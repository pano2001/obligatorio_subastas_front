import { useEffect, useRef, useState } from "react"
import { GoogleLogin } from "@react-oauth/google"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import api from "../config/api.config"
import { guardarSesion } from "../features/auth.slice"

const BotonGoogle = ({ texto = "continue_with" }) => {

    const contenedor = useRef(null);
    const [ancho, setAncho] = useState(320);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const medir = () => {
            if (contenedor.current) {
                setAncho(Math.min(Math.round(contenedor.current.offsetWidth), 400));
            }
        };

        medir();
        window.addEventListener("resize", medir);
        return () => window.removeEventListener("resize", medir);
    }, []);

    const alIngresar = (respuesta) => {
        api.post("/auth/google", { credential: respuesta.credential })
            .then((response) => {
                dispatch(guardarSesion({
                    usuario: response.data.usuario,
                    token: response.data.token
                }));
                toast.success(`Hola, ${response.data.usuario.nombre}`);
                navigate("/");
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "No se pudo iniciar sesión con Google");
            })
    }

    return (
        <div className="boton-google" ref={contenedor}>
            <GoogleLogin
                onSuccess={alIngresar}
                onError={() => toast.error("Se canceló el inicio de sesión con Google")}
                text={texto}
                shape="rectangular"
                size="large"
                width={String(ancho)}
                locale="es"
            />
        </div>
    )
}

export default BotonGoogle