import { useSelector } from "react-redux"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import { formatearUSD } from "../utils/formato"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const COLOR_BASE = "#4f73b0";
const COLOR_ACTUAL = "#b8860b";
const TINTA = "#2b2829";
const TINTA_SUAVE = "#6f6a65";
const GRILLA = "#ebe9e6";
const FUENTE = { family: "Inter, system-ui, sans-serif", size: 12 };

const acortar = (texto, maximo = 22) => (texto.length > maximo ? `${texto.slice(0, maximo - 1)}…` : texto);

const porcentajeSuba = (subasta) => Math.round(((subasta.precioActual - subasta.precioBase) / subasta.precioBase) * 100);

const GraficoSubastas = () => {

    const subastas = useSelector((state) => state.subastas.subastas);

    if (subastas.length === 0) return null;

    const ordenadas = [...subastas].sort((a, b) => b.precioActual - a.precioActual);

    const sumaBase = subastas.reduce((total, s) => total + s.precioBase, 0);
    const sumaActual = subastas.reduce((total, s) => total + s.precioActual, 0);
    const subaPromedio = Math.round(((sumaActual - sumaBase) / sumaBase) * 100);
    const conOfertas = subastas.filter((s) => s.precioActual > s.precioBase).length;

    const datos = {
        labels: ordenadas.map((s) => acortar(s.titulo)),
        datasets: [
            {
                label: "Precio base",
                data: ordenadas.map((s) => s.precioBase),
                backgroundColor: COLOR_BASE,
            },
            {
                label: "Oferta actual",
                data: ordenadas.map((s) => s.precioActual),
                backgroundColor: COLOR_ACTUAL,
            }
        ].map((serie) => ({
            ...serie,
            borderRadius: 4,
            borderSkipped: "start",
            borderColor: "#ffffff",
            borderWidth: { top: 2, bottom: 2, left: 0, right: 0 },
            categoryPercentage: 0.8,
            barPercentage: 0.9,
            maxBarThickness: 18
        }))
    };

    const opciones = {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", axis: "y", intersect: false },
        plugins: {
            legend: {
                position: "top",
                align: "start",
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    boxWidth: 8,
                    boxHeight: 8,
                    padding: 16,
                    color: TINTA,
                    font: FUENTE
                }
            },
            tooltip: {
                backgroundColor: "#ffffff",
                titleColor: TINTA,
                bodyColor: TINTA_SUAVE,
                footerColor: TINTA,
                borderColor: GRILLA,
                borderWidth: 1,
                padding: 12,
                boxPadding: 4,
                usePointStyle: true,
                titleFont: { ...FUENTE, weight: "600" },
                bodyFont: FUENTE,
                footerFont: { ...FUENTE, weight: "600" },
                callbacks: {
                    title: (items) => ordenadas[items[0].dataIndex].titulo,
                    label: (item) => ` ${item.dataset.label}: ${formatearUSD(item.raw)}`,
                    footer: (items) => {
                        const suba = porcentajeSuba(ordenadas[items[0].dataIndex]);
                        return suba > 0 ? `+${suba}% sobre la base` : "Todavía sin ofertas";
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                border: { display: false },
                grid: { color: GRILLA },
                ticks: {
                    color: TINTA_SUAVE,
                    font: FUENTE,
                    maxTicksLimit: 6,
                    callback: (valor) => formatearUSD(valor)
                }
            },
            y: {
                border: { display: false },
                grid: { display: false },
                ticks: { color: TINTA, font: FUENTE }
            }
        }
    };

    const alto = 70 + ordenadas.length * 48;

    return (
        <div className="panel grafico-panel">
            <div className="panel-cabecera">
                <div>
                    <h2>Cómo van tus subastas</h2>
                    <p>Precio base contra la oferta actual de cada publicación</p>
                </div>
            </div>

            <div className="grafico-resumen">
                <div>
                    <strong>{subaPromedio > 0 ? `+${subaPromedio}%` : "0%"}</strong>
                    <span>suba promedio sobre el precio base</span>
                </div>
                <div>
                    <strong>{conOfertas} de {subastas.length}</strong>
                    <span>publicaciones con ofertas</span>
                </div>
            </div>

            <div className="grafico-lienzo" style={{ height: alto }}>
                <Bar
                    data={datos}
                    options={opciones}
                    role="img"
                    aria-label={`Gráfico de barras: precio base y oferta actual de ${subastas.length} subastas. Suba promedio ${subaPromedio}%.`}
                />
            </div>
        </div>
    )
}

export default GraficoSubastas