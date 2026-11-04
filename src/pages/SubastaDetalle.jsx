import { useEffect, useState } from "react"
import { useParams, Link } from "react-router"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import api from "../config/api.config"
import { crearPujaSchema } from "../validators/subastas.validators"


const SubastaDetalle = () => {

    const { id } = useParams();

    const [subasta, setSubasta] = useState(null);
    const [pujas, setPujas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);

    const usuario = useSelector((state) => state.auth.usuario);

    const montoMinimo = subasta ? subasta.precioActual + subasta.incrementoMinimo : 0;

    const{
        register,
        handleSubmit,
        reset,
        formState: {errors, isValid},
    } = useForm({
        mode: "onChange",
        resolver: joiResolver(crearPujaSchema(montoMinimo))
    })

    const cargarPujas = () => {
        return api.get("/pujas", { params: { subasta: id } })
        .then((response) => {
            setPujas(response.data.pujas);
        })
    }

    useEffect(() => {
        setLoading(true);
        setError("");

        api.get(`/subastas/${id}`)
        .then((response) => {
            setSubasta(response.data.subasta);
            return cargarPujas();
        })
        .catch((err) => {
            setError(err.response?.data?.message || "No se pudo cargar la subasta");
        })
        .finally(() => {
            setLoading(false);
        })
    }, [id]);

    const pujar = (data) => {
        setEnviando(true);

        api.post("/pujas", { subasta: id, monto: Number(data.monto) })
        .then(() => {
            toast.success("Puja realizada con éxito");
            reset({monto: ""});
            return api.get(`/subastas/${id}`)
                    .then((response) => {
                        setSubasta(response.data.subasta);
                        return cargarPujas();
            })
        })
        .catch((err) => {
            toast.error(err.response?.data?.message || "No se pudo realizar la puja");
        })
        .finally(() => {
            setEnviando(false);
        })
    }

    if (loading) return <div className="container"><p>Cargando...</p></div>

    if (error) return <div className="container"><p className="error">{error}</p></div>

    if (!subasta) return null

    const esPropia = usuario && subasta.vendedor === usuario._id;
    const estaActiva = subasta.estado === "activa";


  return (
        <div className="container">
            <h1>{subasta.titulo}</h1>
            {subasta.imagenes.length > 0 && (
            <div className="galeria">
            {subasta.imagenes.map((url) => (
            <img src={url} alt={subasta.titulo} width="200" key={url} />
            ))}
            </div>
             )}
            <p>{subasta.vehiculo.marca} {subasta.vehiculo.modelo} ({subasta.vehiculo.anio})</p>
            <p>{subasta.descripcion}</p>
            <p>Precio base: ${subasta.precioBase}</p>
            <p>Precio actual: ${subasta.precioActual}</p>
            <p>Incremento mínimo: ${subasta.incrementoMinimo}</p>
            <p>Estado: {subasta.estado}</p>
            <p>Finaliza: {new Date(subasta.fechaFin).toLocaleString()}</p>

            <h2>Pujas</h2>
            {pujas.length === 0 ? (
                <p>Todavía no hay pujas.</p>
            ) : (
                <ul>
                    {pujas.map((puja) => (
                        <li key={puja._id}>
                            ${puja.monto} — {puja.estado} — {new Date(puja.createdAt).toLocaleString()}
                        </li>
                    ))}
                </ul>
            )}

            {!estaActiva ? (
                <p>Esta subasta ya no está activa.</p>
            ) : !usuario ? (
                <p><Link to="/login">Iniciá sesión</Link> para pujar.</p>
            ) : esPropia ? (
                <p>No podés pujar en tu propia subasta.</p>
            ) : (
                <form onSubmit={handleSubmit(pujar)}>
                    <div className="form-group">
                        <label htmlFor="monto">Tu puja (mínimo ${montoMinimo}):</label>
                        <input {...register("monto")} type="number" id="monto" />
                        <span className="error">{errors.monto?.message}</span>
                    </div>
                    <button type="submit" disabled={!isValid || enviando}>
                        {enviando ? "Enviando..." : "Pujar"}
                    </button>
                </form>
            )}
        </div>
    )
}

export default SubastaDetalle
