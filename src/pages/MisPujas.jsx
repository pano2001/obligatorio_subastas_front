import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { useGSAP } from "@gsap/react"
import api from "../config/api.config"
import { formatearUSD, tiempoRestante } from "../utils/formato"
import { entradaEscalonada } from "../animations/config"
import ModalComoSeguir from "../components/ModalComoSeguir"

const FILTROS = [
    { valor: "todas", texto: "Todas" },
    { valor: "en-curso", texto: "En curso" },
    { valor: "ganadas", texto: "Ganadas" },
    { valor: "perdidas", texto: "Perdidas" }
];

const TEXTO_RESULTADO = {
    ganando: "Vas ganando",
    superada: "Te superaron",
    ganada: "Ganada",
    perdida: "Perdida",
    cancelada: "Cancelada"
};

const cumpleFiltro = (participacion, filtro) => {
    const { resultado } = participacion;
    if (filtro === "en-curso") return resultado === "ganando" || resultado === "superada";
    if (filtro === "ganadas") return resultado === "ganada";
    if (filtro === "perdidas") return resultado === "perdida" || resultado === "cancelada";
    return true;
}

const MisPujas = () => {

    const [participaciones, setParticipaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filtro, setFiltro] = useState("todas");
    const [siguiendo, setSiguiendo] = useState(null);

    const lista = useRef(null);

    useEffect(() => {
        api.get("/pujas/mias")
            .then((response) => {
                setParticipaciones(response.data.participaciones);
            })
            .catch((err) => {
                setError(err.response?.data?.message || "No se pudieron cargar tus pujas");
            })
            .finally(() => {
                setLoading(false);
            })
    }, []);

    const visibles = participaciones.filter((p) => cumpleFiltro(p, filtro));

    useGSAP(() => {
        if (!lista.current) return;
        entradaEscalonada(lista.current.querySelectorAll(".participacion"));
    }, { dependencies: [filtro, loading] });

    const enCurso = participaciones.filter((p) => cumpleFiltro(p, "en-curso")).length;
    const ganadas = participaciones.filter((p) => p.resultado === "ganada").length;

    return (
        <div className="container">
            <header className="pagina-cabecera">
                <div>
                    <span className="eyebrow">Comprar</span>
                    <h1 className="pagina-titulo">Mis pujas</h1>
                    <p className="pagina-bajada">
                        {participaciones.length === 0
                            ? "Acá vas a ver las subastas en las que ofertaste."
                            : `${enCurso} en curso · ${ganadas} ${ganadas === 1 ? "ganada" : "ganadas"}`}
                    </p>
                </div>
            </header>

            {participaciones.length > 0 && (
                <div className="barra-herramientas">
                    <div className="segmentos">
                        {FILTROS.map((opcion) => (
                            <button
                                type="button"
                                key={opcion.valor}
                                className={filtro === opcion.valor ? "segmento activo" : "segmento"}
                                onClick={() => setFiltro(opcion.valor)}
                            >
                                {opcion.texto}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {loading ? (
                <p>Cargando...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : participaciones.length === 0 ? (
                <div className="estado-vacio">
                    <h3>Todavía no ofertaste en ninguna subasta</h3>
                    <p>Explorá los autos publicados y hacé tu primera oferta.</p>
                    <Link to="/explorar" className="btn">Explorar subastas</Link>
                </div>
            ) : visibles.length === 0 ? (
                <p className="vacio">No tenés pujas en esta categoría.</p>
            ) : (
                <ul className="lista-participaciones" ref={lista}>
                    {visibles.map((participacion) => {
                        const { subasta, resultado } = participacion;
                        const activa = subasta.estado === "activa";

                        return (
                            <li className={`participacion ${resultado}`} key={subasta._id}>
                                <Link to={`/subastas/${subasta._id}`} className="participacion-foto">
                                    {subasta.imagenes.length > 0
                                        ? <img src={subasta.imagenes[0]} alt={subasta.titulo} />
                                        : <span>Sin fotos</span>}
                                </Link>

                                <div className="participacion-datos">
                                    <span className={`resultado-etiqueta ${resultado}`}>{TEXTO_RESULTADO[resultado]}</span>
                                    <Link to={`/subastas/${subasta._id}`} className="participacion-titulo">{subasta.titulo}</Link>
                                    <span className="participacion-vehiculo">
                                        {subasta.vehiculo.marca} {subasta.vehiculo.modelo} · {subasta.vehiculo.anio}
                                        {activa && ` · ${tiempoRestante(subasta.fechaFin)}`}
                                    </span>
                                </div>

                                <div className="participacion-montos">
                                    <div>
                                        <small>Tu mejor oferta</small>
                                        <strong>{formatearUSD(participacion.miMejorPuja)}</strong>
                                    </div>
                                    <div>
                                        <small>{activa ? "Oferta actual" : "Precio final"}</small>
                                        <strong>{formatearUSD(subasta.precioActual)}</strong>
                                    </div>
                                </div>

                                <div className="participacion-accion">
                                    {resultado === "ganada" ? (
                                        <button type="button" className="btn btn-acento btn-chico" onClick={() => setSiguiendo(participacion)}>
                                            Cómo seguir
                                        </button>
                                    ) : resultado === "superada" ? (
                                        <Link to={`/subastas/${subasta._id}`} className="btn btn-chico">Volver a ofertar</Link>
                                    ) : (
                                        <Link to={`/subastas/${subasta._id}`} className="btn-secundario btn btn-chico">Ver subasta</Link>
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}

            {siguiendo && (
                <ModalComoSeguir participacion={siguiendo} alCerrar={() => setSiguiendo(null)} />
            )}
        </div>
    )
}

export default MisPujas