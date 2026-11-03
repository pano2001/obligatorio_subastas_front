import { useSelector } from "react-redux"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    plugins: {
        legend: {   
            position: 'top'
        },
        title: {
            display: true,
            text: 'Precio base contra precio actual',
        },
    },
};

const GraficoSubastas = () => {

    const subastas = useSelector((state) => state.subastas.subastas);

    if (subastas.length === 0) return null;

    const titulos = subastas.map((subasta) => subasta.titulo);
    const preciosBase = subastas.map((subasta) => subasta.precioBase);
    const preciosActuales = subastas.map((subasta) => subasta.precioActual);

    return (
        <div className="chart-container">
            <Bar options={options} data={{
                labels: titulos,
                datasets: [
                    {
                        label: 'Precio base',
                        data: preciosBase,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    },
                    {
                        label: 'Precio actual',
                        data: preciosActuales,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    }
                ],
            }} />
        </div>
    )
}

export default GraficoSubastas