import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { useNavigate } from "react-router"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "sonner"
import api from "../config/api.config"
import { crearSubastaSchema } from "../validators/subastas.validators"
import { agregarSubasta } from "../features/subastas.slice"


const LIMITE_PLAN_PLUS = 4;

const NuevaSubasta = () => {

    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorApi, setErrorApi] = useState("");
    const [imagenes, setImagenes] = useState([]);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const usuario = useSelector((state) => state.auth.usuario);
    const subastas = useSelector((state) => state.subastas.subastas);

    const alcanzoLimite = usuario.plan === "plus" && subastas.length >= LIMITE_PLAN_PLUS;

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        resolver: joiResolver(crearSubastaSchema),
        defaultValues: {
            incrementoMinimo: 50
        }
    })

    useEffect(() => {
        api.get("/categorias")
        .then((response)=> {
            setCategorias(response.data.categorias);
        })
        .catch(() => {
            setErrorApi("No se pudieron cargar las categorías");
        });
    }, []);

    const procesarForm = (data) => {
    setErrorApi("");
    setLoading(true);

    api.post("/subastas", data)
        .then((response) => {
            
            const creada = response.data.subasta;

            if (imagenes.length === 0) {
                return creada;
            }

            const formData = new FormData();
            imagenes.forEach((archivo) => {
                formData.append("imagenes", archivo);
            });

            return api.post(`/subastas/${creada._id}/imagenes`, formData)
                .then((respuestaImagenes) => respuestaImagenes.data.subasta)
                .catch(() => {
                    toast.error("La subasta se creó, pero no se pudieron subir las imágenes");
                    return creada;
                })
        })
        .then((subastaFinal) => {
            dispatch(agregarSubasta(subastaFinal));
            toast.success("Subasta creada con éxito");
            navigate("/subastas");
        })
        .catch((error) => {
            setErrorApi(error.response?.data?.message || "No se pudo crear la subasta");
        })
        .finally(() => {
            setLoading(false);
        })
}

    if (alcanzoLimite) {
        return (
            <div className="container">
                <h1>Nueva subasta</h1>
                <p>Alcanzaste el límite de {LIMITE_PLAN_PLUS} subastas del plan plus. Actualizá a premium para publicar más.</p>
            </div>
        )
    }

    return (
        <div className="container">
            <h1>Nueva subasta</h1>

            <form onSubmit={handleSubmit(procesarForm)}>
                <div className="form-group">
                    <label htmlFor="titulo">Título:</label>
                    <input {...register("titulo")} type="text" id="titulo" />
                    <span className="error">{errors.titulo?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="descripcion">Descripción:</label>
                    <textarea {...register("descripcion")} id="descripcion" rows="4"></textarea>
                    <span className="error">{errors.descripcion?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="marca">Marca:</label>
                    <input {...register("vehiculo.marca")} type="text" id="marca" />
                    <span className="error">{errors.vehiculo?.marca?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="modelo">Modelo:</label>
                    <input {...register("vehiculo.modelo")} type="text" id="modelo" />
                    <span className="error">{errors.vehiculo?.modelo?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="anio">Año:</label>
                    <input {...register("vehiculo.anio")} type="number" id="anio" />
                    <span className="error">{errors.vehiculo?.anio?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="categoria">Categoría:</label>
                    <select {...register("categoria")} id="categoria" defaultValue="">
                        <option value="">Elegí una categoría</option>
                        {categorias.map((categoria) => (
                            <option value={categoria._id} key={categoria._id}>{categoria.nombre}</option>
                        ))}
                    </select>
                    <span className="error">{errors.categoria?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="precioBase">Precio base:</label>
                    <input {...register("precioBase")} type="number" id="precioBase" />
                    <span className="error">{errors.precioBase?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="incrementoMinimo">Incremento mínimo:</label>
                    <input {...register("incrementoMinimo")} type="number" id="incrementoMinimo" />
                    <span className="error">{errors.incrementoMinimo?.message}</span>
                </div>

                <div className="form-group">
                    <label htmlFor="fechaFin">Fecha de fin:</label>
                    <input {...register("fechaFin")} type="datetime-local" id="fechaFin" />
                    <span className="error">{errors.fechaFin?.message}</span>
                </div>

                {errorApi && <p className="error">{errorApi}</p>}
                
                <div className="form-group">
                    <label htmlFor="imagenes">Imágenes (hasta 5):</label>
                    <input
                        type="file"
                        id="imagenes"
                        accept="image/*"
                        multiple
                        onChange={(e) => setImagenes(Array.from(e.target.files).slice(0, 5))}
                    />
                    {imagenes.length > 0 && (
                        <div className="previews">
                            {imagenes.map((archivo) => (
                                <img src={URL.createObjectURL(archivo)} alt={archivo.name} width="80" key={archivo.name} />
                            ))}
                        </div>
                    )}
                </div>
                <button type="submit" disabled={!isValid || loading}>
                    {loading ? "Publicando..." : "Publicar subasta"}
                </button>
            </form>
        </div>
    )
}

export default NuevaSubasta
