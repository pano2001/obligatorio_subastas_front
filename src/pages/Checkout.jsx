import { useState } from "react"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { useSelector, useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router"
import api from "../config/api.config"
import { pagoSchema } from "../validators/pagos.validators"
import { guardarSesion } from "../features/auth.slice"

const PRECIO = 20;

const Checkout = () => {

    const [procesando, setProcesando] = useState(false);
    const [rechazo, setRechazo] = useState("");
    const [comprobante, setComprobante] = useState(null);

    const usuario = useSelector((state) => state.auth.usuario);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm({
        mode: "onChange",
        resolver: joiResolver(pagoSchema),
    })

    const pagar = (data) => {
        setRechazo("");
        setProcesando(true);

        const datos = {
            numeroTarjeta: data.numeroTarjeta.replace(/\s/g, ""),
            titular: data.titular,
            vencimiento: data.vencimiento,
            cvv: data.cvv,
        };

        api.post("/pagos", datos)
        .then((response) => {
            dispatch(guardarSesion({
                usuario: response.data.usuario,
                token: response.data.token
            }));
            setComprobante(response.data.pago);
        })
        .catch ((err) => {
            setRechazo(err.response?.data?.message || "No se pudo procesar el pago");
        })
        .finally(() => {
            setProcesando(false);
        })
    }

  if (usuario.plan === "premium" && !comprobante) {
        return (
            <div className="container">
                <h1>Ya tenés el plan premium</h1>
                <p>Podés publicar subastas sin límite.</p>
                <Link to="/subastas">Ir a mis subastas</Link>
            </div>
        )
    }

    if (comprobante) {
        return (
            <div className="container">
                <h1>¡Pago aprobado!</h1>
                <p>Ya tenés el plan premium. Podés publicar subastas sin límite.</p>

                <div className="comprobante">
                    <h2>Comprobante</h2>
                    <p>Número de operación: {comprobante._id}</p>
                    <p>Concepto: {comprobante.concepto}</p>
                    <p>Monto: {comprobante.moneda} {comprobante.monto}</p>
                    <p>Tarjeta: {comprobante.marca} terminada en {comprobante.ultimosCuatro}</p>
                    <p>Fecha: {new Date(comprobante.createdAt).toLocaleString()}</p>
                </div>

                <button onClick={() => navigate("/subastas/nueva")}>Publicar una subasta</button>
                <Link to="/account">Volver a mi cuenta</Link>
            </div>
        )
    }

    return (
        <div className="container">
            <h1>Finalizar compra</h1>

            <p className="aviso-simulado">
                Pago simulado con fines académicos. No ingreses datos reales de tu tarjeta.
            </p>

            <div className="resumen-compra">
                <h2>Resumen</h2>
                <p>Plan premium — publicaciones ilimitadas</p>
                <p>Pago único: USD {PRECIO}</p>
            </div>

            <div className="tarjetas-prueba">
                <p>Tarjetas de prueba:</p>
                <p>4111 1111 1111 1111 — se aprueba</p>
                <p>4000 0000 0000 0002 — se rechaza por fondos insuficientes</p>
                <p>Cualquier vencimiento futuro y cualquier CVV de 3 dígitos.</p>
            </div>

            <form onSubmit={handleSubmit(pagar)}>
                <div className="form-group">
                    <label htmlFor="numeroTarjeta">Número de tarjeta:</label>
                    <input {...register("numeroTarjeta")} type="text" id="numeroTarjeta" placeholder="4111 1111 1111 1111" autoComplete="off" />
                    <span className="error">{errors.numeroTarjeta?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="titular">Titular:</label>
                    <input {...register("titular")} type="text" id="titular" placeholder="Como figura en la tarjeta" autoComplete="off" />
                    <span className="error">{errors.titular?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="vencimiento">Vencimiento:</label>
                    <input {...register("vencimiento")} type="text" id="vencimiento" placeholder="MM/AA" autoComplete="off" />
                    <span className="error">{errors.vencimiento?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="cvv">CVV:</label>
                    <input {...register("cvv")} type="text" id="cvv" placeholder="123" autoComplete="off" />
                    <span className="error">{errors.cvv?.message}</span>
                </div>

                {rechazo && <p className="error">{rechazo}</p>}

                <button type="submit" disabled={!isValid || procesando}>
                    {procesando ? "Procesando pago..." : `Pagar USD ${PRECIO}`}
                </button>

                <Link to="/account">Cancelar</Link>
            </form>
        </div>
    )
}

export default Checkout