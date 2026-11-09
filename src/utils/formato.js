const formateadorUSD = new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
});

export const formatearUSD = (monto) => formateadorUSD.format(monto);

export const tiempoRestante = (fechaFin) => {
    const diferencia = new Date(fechaFin) - new Date();
    if (diferencia <= 0) return "Finalizada";

    const minutosTotales = Math.floor(diferencia / 60000);
    const dias = Math.floor(minutosTotales / 1440);
    const horas = Math.floor((minutosTotales % 1440) / 60);
    const minutos = minutosTotales % 60;

    if (dias > 0) return `${dias}d ${horas}h`;
    if (horas > 0) return `${horas}h ${minutos}m`;
    return `${minutos}m`;
};