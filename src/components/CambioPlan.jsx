import { useRef } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router"
import { useGSAP } from "@gsap/react"
import { entradaEscalonada } from "../animations/config"

const LIMITE_PLAN_PLUS = 4;
const PRECIO_PREMIUM = 20;

const CambioPlan = () => {

    const usuario = useSelector((state) => state.auth.usuario);
    const subastas = useSelector((state) => state.subastas.subastas);
    const raiz = useRef(null);

    useGSAP(() => {
        entradaEscalonada(raiz.current.querySelectorAll(".card-plan"));
    }, { scope: raiz });

    const esPremium = usuario.plan === "premium";
    const disponibles = Math.max(LIMITE_PLAN_PLUS - subastas.length, 0);

    return (
        <div className="grilla-planes" ref={raiz}>
            <div className={`card-plan ${!esPremium ? "card-plan-actual" : ""}`}>
                <div className="card-plan-cabecera">
                    <h3>Plus</h3>
                    {!esPremium && <span className="insignia">Tu plan actual</span>}
                </div>
                <p className="precio-plan">Gratis</p>
                <p className="card-plan-nota">Para empezar a vender.</p>
                <ul>
                    <li>Hasta {LIMITE_PLAN_PLUS} subastas publicadas</li>
                    <li>Hasta 5 fotos por subasta</li>
                    <li>Sugerencias con IA</li>
                </ul>
                {!esPremium && (
                    <p className="card-plan-uso">
                        {disponibles > 0
                            ? `Te quedan ${disponibles} ${disponibles === 1 ? "publicación" : "publicaciones"}`
                            : "Llegaste al límite de publicaciones"}
                    </p>
                )}
            </div>

            <div className={`card-plan card-plan-destacado ${esPremium ? "card-plan-actual" : ""}`}>
                <div className="card-plan-cabecera">
                    <h3>Premium</h3>
                    {esPremium
                        ? <span className="insignia">Tu plan actual</span>
                        : <span className="insignia insignia-acento">Recomendado</span>}
                </div>
                <p className="precio-plan">US$ {PRECIO_PREMIUM} <span>pago único</span></p>
                <p className="card-plan-nota">Para vender sin límites.</p>
                <ul>
                    <li>Subastas ilimitadas</li>
                    <li>Hasta 5 fotos por subasta</li>
                    <li>Sugerencias con IA</li>
                </ul>
                {!esPremium && (
                    <Link to="/checkout" className="btn btn-acento btn-bloque">Pasarse a Premium</Link>
                )}
            </div>
        </div>
    )
}

export default CambioPlan