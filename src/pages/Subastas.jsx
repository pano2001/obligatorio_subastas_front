
import { useEffect, useState } from 'react'
import { useSelector ,useDispatch } from 'react-redux'
import api from '../config/api.config'
import { guardarSubastas } from "../features/subastas.slice";
import { Link } from "react-router"
import SubastaCard from "../components/SubastaCard"

const Subastas = () => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [categorias, setCategorias] = useState([]);
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");

    const dispatch = useDispatch();

    const usuario = useSelector((state) => state.auth.usuario);
    const subastas = useSelector((state) => state.subastas.subastas);

    useEffect(() => {
        api.get("/categorias")
            .then((response) => {
                setCategorias(response.data.categorias);
            })
            .catch(() => {
                setCategorias([]);
            });
    }, []);

    useEffect(() => {
    setLoading(true);
    setError("");

    api.get("/subastas", { params: { vendedor: usuario._id } })
        .then((response) => {
            dispatch(guardarSubastas(response.data.subastas));
        })
        .catch((err) => {
            setError(err.response?.data?.message || "No se pudieron cargar las subastas");
        })
        .finally(() => {
            setLoading(false);
        });
}, [usuario._id, dispatch]);
    // const eliminar = (subasta) => {
    //     const confirmado = window.confirm(`¿Estás seguro de que deseas eliminar la subasta "${subasta.titulo}"?`);
    //     if (!confirmado) return;

    //     api.delete(`/subastas/${subasta._id}`)
    //     .then (() => {
    //         dispatch (quitarSubasta(subasta._id));
    //         toast.success("La subasta fue eliminada correctamente");
    //     })
    //     .catch((err) => {
    //         toast.error(err.response?.data?.message || "No se pudo eliminar la subasta");
    //     });
    // }

    const subastasFiltradas = subastas.filter((subasta) => {
    const coincideCategoria = !filtroCategoria || subasta.categoria === filtroCategoria;
    const coincideEstado = !filtroEstado || subasta.estado === filtroEstado;
    return coincideCategoria && coincideEstado;
});

    return (
        <div className="container">
            <h1>Mis subastas</h1>
            <Link to="/subastas/nueva">Nueva subasta</Link>

            <div className="filtros">
                <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                    <option value="">Todas las categorías</option>
                    {categorias.map((categoria) => (
                        <option value={categoria._id} key={categoria._id}>{categoria.nombre}</option>
                    ))}
                </select>

                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="activa">Activa</option>
                    <option value="cerrada">Cerrada</option>
                    <option value="cancelada">Cancelada</option>
                </select>
            </div>

            {loading ? (
                <p>Cargando subastas...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : subastasFiltradas.length === 0 ? (
                <p>No hay subastas que coincidan con los filtros.</p>
            ) : (
                <div className="lista-subastas">
                    {subastasFiltradas.map((subasta) => (
                        <SubastaCard subasta={subasta} key={subasta._id} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Subastas