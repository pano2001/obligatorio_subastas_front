
import { useEffect, useState } from 'react'
import { useSelector ,useDispatch } from 'react-redux'
import api from '../config/api.config'
import {guardarSubastas} from "../features/subastas.slice";
import { Link } from "react-router"

const Subastas = () => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const dispatch = useDispatch();

    const usuario = useSelector((state) => state.auth.usuario);
    const subastas = useSelector((state) => state.subastas.subastas);

    useEffect(() => {
        setLoading(true);
        setError("");

        api.get("/subastas", {params: {vendedor: usuario._id }})
        .then((response) => {
            dispatch(guardarSubastas(response.data.subastas));
        })
        .catch ((err) =>{
            setError(err.response?.data?.message || "No se pudieron cargar las subastas");
        })
        .finally(() => {
            setLoading(false);
        });
    }, [usuario._id, dispatch]);

    if (loading) return <div className="container"><p>Cargando subastas...</p></div>

    if (error) return <div className="container"><p className="error">{error}</p></div>

  return (
        <div className="container">
            <h1>Mis subastas</h1>
            <Link to="/subastas/nueva">Nueva subasta</Link>
            {subastas.length === 0 ? (
                <p>Todavía no publicaste ninguna subasta.</p>
            ) : (
                <div className="lista-subastas">
                    {subastas.map((subasta) => (
                        <div className="card-subasta" key={subasta._id}>
                            <h3>{subasta.titulo}</h3>
                            <p>{subasta.vehiculo.marca} {subasta.vehiculo.modelo} ({subasta.vehiculo.anio})</p>
                            <p>Precio actual: ${subasta.precioActual}</p>
                            <p>Estado: {subasta.estado}</p>
                            <p>Finaliza: {new Date(subasta.fechaFin).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Subastas