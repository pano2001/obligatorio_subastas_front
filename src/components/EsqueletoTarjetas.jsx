const EsqueletoTarjetas = ({ cantidad = 6 }) => {
    return (
        <div className="grilla">
            {Array.from({ length: cantidad }).map((_, indice) => (
                <div className="esqueleto" key={indice}>
                    <div className="esqueleto-media brillo"></div>
                    <div className="esqueleto-linea corta brillo"></div>
                    <div className="esqueleto-linea brillo"></div>
                    <div className="esqueleto-linea media brillo"></div>
                    <div className="esqueleto-linea precio brillo"></div>
                </div>
            ))}
        </div>
    )
}

export default EsqueletoTarjetas