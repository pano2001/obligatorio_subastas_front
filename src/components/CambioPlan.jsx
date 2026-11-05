import { useSelector } from "react-redux"
import { Link } from "react-router"

const LIMITE_PLAN_PLUS = 4;
const PRECIO_PREMIUM = 20;

const CambioPlan = () => {

    const usuario = useSelector((state) => state.auth.usuario);
    const subastas = useSelector((state) => state.subastas.subastas);

    const esPremium = usuario.plan === "premium";
    const disponibles = LIMITE_PLAN_PLUS - subastas.length;

    return (
        <div className="planes">
            <h2>Planes</h2>

            <div className="grilla-planes">
                <div className={`card-plan ${!esPremium ? "card-plan-actual" : ""}`}>
                    <h3>Plus</h3>
                    <p className="precio-plan">Gratis</p>
                    <ul>
                        <li>Hasta {LIMITE_PLAN_PLUS} subastas publicadas</li>
                        <li>Hasta 5 fotos por subasta</li>
                        <li>Sugerencias con IA</li>
                    </ul>
                    {!esPremium && (
                        <p>
                            {disponibles > 0
                                ? `Tu plan actual · te quedan ${disponibles} publicaciones`
                                : "Tu plan actual · llegaste al límite de publicaciones"}
                        </p>
                    )}
                </div>

                <div className={`card-plan ${esPremium ? "card-plan-actual" : ""}`}>
                    <h3>Premium</h3>
                    <p className="precio-plan">USD {PRECIO_PREMIUM}</p>
                    <p>Pago único</p>
                    <ul>
                        <li>Subastas ilimitadas</li>
                        <li>Hasta 5 fotos por subasta</li>
                        <li>Sugerencias con IA</li>
                    </ul>
                    {esPremium ? (
                        <p>Tu plan actual</p>
                    ) : (
                        <Link to="/checkout" className="boton-plan">Pasar a premium</Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CambioPlan