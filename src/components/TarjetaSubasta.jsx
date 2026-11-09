import { useState } from "react"
import { useNavigate } from "react-router"
import { useSelector } from "react-redux"
import { formatearUSD, tiempoRestante } from "../utils/formato"

const TarjetaSubasta = ({ subasta, children }) => {

    const [foto, setFoto] = useState(0);

    const navigate = useNavigate();
    const categorias = useSelector((state) => state.categorias.lista);

    const categoria = categorias.find((c) => c._id === subasta.categoria);
    const fotos = subasta.imagenes;
    const hayVariasFotos = fotos.length > 1;

    const irAlDetalle = () => {
        navigate(`/subastas/${subasta._id}`);
    }

    const alPresionarTecla = (evento) => {
        if (evento.key === "Enter") irAlDetalle();
    }

    const cambiarFoto = (evento, direccion) => {
        evento.stopPropagation();
        setFoto((actual) => (actual + direccion + fotos.length) % fotos.length);
    }

    return (
        <article className="tarjeta" data-flip-id={subasta._id}>
            <div className="tarjeta-clic" onClick={irAlDetalle} onKeyDown={alPresionarTecla} role="link" tabIndex={0}>
                <div className="tarjeta-media">
                    {fotos.length > 0 ? (
                        <img className="tarjeta-foto" src={fotos[foto]} alt={subasta.titulo} loading="lazy" />
                    ) : (
                        <div className="tarjeta-sin-foto">Sin fotos</div>
                    )}

                    <span className={`etiqueta-estado estado-${subasta.estado}`}>{subasta.estado}</span>

                    {hayVariasFotos && (
                        <>
                            <button type="button" className="tarjeta-flecha izquierda" onClick={(e) => cambiarFoto(e, -1)} aria-label="Foto anterior">‹</button>
                            <button type="button" className="tarjeta-flecha derecha" onClick={(e) => cambiarFoto(e, 1)} aria-label="Foto siguiente">›</button>
                            <div className="tarjeta-puntos">
                                {fotos.map((url, indice) => (
                                    <span key={url} className={indice === foto ? "punto activo" : "punto"}></span>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="tarjeta-cuerpo">
                    <span className="tarjeta-categoria">{categoria ? categoria.nombre : "Vehículo"}</span>
                    <h3 className="tarjeta-titulo">{subasta.titulo}</h3>
                    <p className="tarjeta-vehiculo">
                        {subasta.vehiculo.marca} {subasta.vehiculo.modelo} · {subasta.vehiculo.anio}
                    </p>

                    <div className="tarjeta-pie">
                        <div>
                            <span className="tarjeta-etiqueta">Oferta actual</span>
                            <strong className="tarjeta-precio">{formatearUSD(subasta.precioActual)}</strong>
                        </div>
                        <span className="tarjeta-tiempo">{tiempoRestante(subasta.fechaFin)}</span>
                    </div>
                </div>
            </div>

            {children && <div className="tarjeta-acciones">{children}</div>}
        </article>
    )
}

export default TarjetaSubasta