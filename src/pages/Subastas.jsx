import { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router"
import { useGSAP } from "@gsap/react"
import api from "../config/api.config"
import { guardarSubastas } from "../features/subastas.slice"
import { entradaEscalonada } from "../animations/config"
import SubastaCard from "../components/SubastaCard"
import EsqueletoTarjetas from "../components/EsqueletoTarjetas"

const LIMITE_PLAN_PLUS = 4;

const ESTADOS = [
    { valor: "", texto: "Todas" },
    { valor: "activa", texto: "Activas" },
    { valor: "cerrada", texto: "Cerradas" },
    { valor: "cancelada", texto: "Canceladas" }
];

const Subastas = () => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");

    const dispatch = useDispatch();
    const usuario = useSelector((state) => state.auth.usuario);
    const subastas = useSelector((state) => state.subastas.subastas);

    const raiz = useRef(null);

    useEffect(() => {
        setLoading(true);
        setError("");

        api.get("/subastas", { params: { vendedor: usuario._id } })
            .then((response) => {
                dispatch(guardarSubastas(response.data.subastas));
            })
            .catch((err) => {
                setError(err.response?.data?.message || "No se pudieron cargar tus subastas");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [usuario._id, dispatch]);

    useGSAP(() => {
        if (loading) return;
        entradaEscalonada(raiz.current.querySelectorAll(".grilla .tarjeta"));
    }, { scope: raiz, dependencies: [loading, filtroEstado] });

    const visibles = filtroEstado
        ? subastas.filter((subasta) => subasta.estado === filtroEstado)
        : subastas;

    const alcanzoLimite = usuario.plan === "plus" && subastas.length >= LIMITE_PLAN_PLUS;

    const resumen = usuario.plan === "plus"
        ? `${subastas.length} de ${LIMITE_PLAN_PLUS} Plus`
        : `${subastas.length} publicaciones ·  Premium`;

    return (
        <div className="container" ref={raiz}>
            <header className="pagina-cabecera">
                <div>
                    <span className="eyebrow">Tu actividad</span>
                    <h1 className="pagina-titulo">Mis subastas</h1>
                    <p className="pagina-bajada">{resumen}</p>
                </div>

                {alcanzoLimite ? (
                    <Link to="/plan" className="btn btn-acento">Pasate a Premium</Link>
                ) : (
                    <Link to="/subastas/nueva" className="btn">+ Nueva subasta</Link>
                )}
            </header>

            {alcanzoLimite && (
                <div className="aviso-limite">
                    <span>Llegaste al límite de {LIMITE_PLAN_PLUS} subastas del plan Plus.</span>
                    <Link to="/plan">Ver planes</Link>
                </div>
            )}

            <div className="barra-herramientas">
                <div className="segmentos">
                    {ESTADOS.map((estado) => (
                        <button
                            type="button"
                            key={estado.valor}
                            className={filtroEstado === estado.valor ? "segmento activo" : "segmento"}
                            onClick={() => setFiltroEstado(estado.valor)}
                        >
                            {estado.texto}
                        </button>
                    ))}
                </div>
                <span className="contador">
                    {visibles.length} {visibles.length === 1 ? "subasta" : "subastas"}
                </span>
            </div>

            {loading ? (
                <EsqueletoTarjetas cantidad={3} />
            ) : error ? (
                <div className="estado-vacio">
                    <h3>No pudimos cargar tus subastas</h3>
                    <p>{error}</p>
                </div>
            ) : subastas.length === 0 ? (
                <div className="estado-vacio">
                    <h3>Todavía no publicaste ninguna subasta</h3>
                    <p>Publicá tu primer vehículo en pocos minutos.</p>
                    <Link to="/subastas/nueva" className="btn">Publicar mi primer auto</Link>
                </div>
            ) : visibles.length === 0 ? (
                <div className="estado-vacio">
                    <h3>No hay subastas en este estado</h3>
                    <p>Probá con otro filtro.</p>
                </div>
            ) : (
                <div className="grilla">
                    {visibles.map((subasta) => (
                        <SubastaCard subasta={subasta} key={subasta._id} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Subastas