import CambioPlan from "../components/CambioPlan"

const Plan = () => {
    return (
        <>
            <header className="pagina-encabezado">
                <span className="eyebrow">Configuración</span>
                <h1 className="pagina-titulo">Plan</h1>
                <p className="pagina-bajada">Elegí cómo querés publicar en Pano Select.</p>
            </header>

            <CambioPlan />
        </>
    )
}

export default Plan