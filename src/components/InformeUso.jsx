import { useSelector } from "react-redux";

const LIMITE_PLAN_PLUS = 4;

const InformeUso = () => {

    const usuario = useSelector((state) => state.auth.usuario);
    const subastas = useSelector((state) => state.subastas.subastas);

    const cantidad = subastas.length;

    if (usuario.plan === "premium") {
        return (
            <div className="informe-uso">
                <h2>Informe de uso</h2>
                <p>Plan premium</p>
                <p>Tenés {cantidad} {cantidad === 1 ? "subasta publicada" : "subastas publicadas"}.</p>
            </div>
        )
    }

    const porcentaje = Math.round((cantidad / LIMITE_PLAN_PLUS) * 100);

    return (
        <div className="informe-uso">
            <h2>Informe de uso</h2>
            <p>Plan plus: usaste {cantidad} de {LIMITE_PLAN_PLUS} subastas ({porcentaje}%).</p>
            <progress value={cantidad} max={LIMITE_PLAN_PLUS}></progress>
        </div>
    )
}

export default InformeUso