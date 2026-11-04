import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router";
import api from "../config/api.config";
import { guardarPublicas } from "../features/subastas.slice";

const Explorar = () => {
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const dispatch = useDispatch();
    const publicas = useSelector((state) => state.subastas.publicas);

    useEffect(() => {
        setLoading(true);
        setError("");

        api.get("/subastas", { params: { estado: "activa" } })
        .then((response) => {
            dispatch(guardarPublicas(response.data.subastas));
        })
        .catch((err) => {
            setError(err.response?.data?.message || "No se pudieron cargar las subastas");
        })
        .finally(() => {
            setLoading(false);
        });
    }, [dispatch]);

    if (loading) return <div className="container"><p>Cargando subastas...</p></div>

    if (error) return <div className="container"><p className="error">{error}</p></div>

    return (
        <div className="container">
            <h1>Subastas activas</h1>

            {publicas.length === 0 ? (
                <p>No hay subastas activas en este momento.</p>
            ) : (
                <div className="lista-subastas">
                    {publicas.map((subasta) => (
                        <div className="card-subasta" key={subasta._id}>
                            <h3>{subasta.titulo}</h3>
                            <p>{subasta.vehiculo.marca} {subasta.vehiculo.modelo} ({subasta.vehiculo.anio})</p>
                            <p>Precio actual: ${subasta.precioActual}</p>
                            <p>Finaliza: {new Date(subasta.fechaFin).toLocaleString()}</p>
                            <Link to={`/subastas/${subasta._id}`}>Ver y pujar</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Explorar;
