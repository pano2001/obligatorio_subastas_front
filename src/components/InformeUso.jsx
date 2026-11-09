import { useSelector } from "react-redux"

const LIMITE_PLAN_PLUS = 4;

const InformeUso = () => {

    const usuario = useSelector((state) => state.auth.usuario);
    const subastas = useSelector((state) => state.subastas.subastas);

    const cantidad = subastas.length;

    if (usuario.plan === "premium") {
        return (
            <div className="uso">
                <div className="uso-fila">
                    <span>Publicaciones</span>
                    <strong>{cantidad}</strong>
                </div>
                <p className="uso-nota">Con Premium publicás sin límite.</p>
            </div>
        )
    }

    const porcentaje = Math.min(Math.round((cantidad / LIMITE_PLAN_PLUS) * 100), 100);

    return (
        <div className="uso">
            <div className="uso-fila">
                <span>Publicaciones usadas</span>
                <strong>{cantidad} de {LIMITE_PLAN_PLUS} · {porcentaje}%</strong>
            </div>
            <progress value={cantidad} max={LIMITE_PLAN_PLUS}></progress>
        </div>
    )
}

export default InformeUso