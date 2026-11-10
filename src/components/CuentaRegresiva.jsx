import { useEffect, useState } from "react"

const UN_MINUTO = 60 * 1000;
const UNA_HORA = 60 * UN_MINUTO;

const dosDigitos = (numero) => String(numero).padStart(2, "0");

const CuentaRegresiva = ({ fechaFin, alTerminar }) => {

    const [restante, setRestante] = useState(() => new Date(fechaFin) - Date.now());

    useEffect(() => {
        const intervalo = setInterval(() => {
            const nuevoRestante = new Date(fechaFin) - Date.now();
            setRestante(nuevoRestante);

            if (nuevoRestante <= 0) {
                clearInterval(intervalo);
                if (alTerminar) alTerminar();
            }
        }, 1000);

        return () => clearInterval(intervalo);
    }, [fechaFin]);

    if (restante <= 0) {
        return <div className="cuenta-regresiva terminada">Subasta finalizada</div>
    }

    const segundosTotales = Math.floor(restante / 1000);
    const dias = Math.floor(segundosTotales / 86400);
    const horas = Math.floor((segundosTotales % 86400) / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;

    let nivel = "";
    if (restante < UN_MINUTO) nivel = "urgente";
    else if (restante < UNA_HORA) nivel = "pronto";

    return (
        <div className={`cuenta-regresiva ${nivel}`}>
            <span className="cuenta-etiqueta">
                {nivel === "urgente" ? "¡Último minuto!" : "Termina en"}
            </span>
            <div className="cuenta-numeros">
                {dias > 0 && (
                    <div><strong>{dias}</strong><small>días</small></div>
                )}
                <div><strong>{dosDigitos(horas)}</strong><small>hs</small></div>
                <div><strong>{dosDigitos(minutos)}</strong><small>min</small></div>
                <div><strong>{dosDigitos(segundos)}</strong><small>seg</small></div>
            </div>
        </div>
    )
}

export default CuentaRegresiva