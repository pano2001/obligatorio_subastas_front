export const formatearNumeroTarjeta = (texto) => {
    return texto
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, "$1 ");
};

export const formatearVencimiento = (texto) => {
    const digitos = texto.replace(/\D/g, "").slice(0, 4);
    if (digitos.length > 2) {
        return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    }
    return digitos;
};

export const formatearCvv = (texto) => {
    return texto.replace(/\D/g, "").slice(0, 4);
};

export const detectarMarca = (numero) => {
    const digitos = numero.replace(/\D/g, "");
    if (/^4/.test(digitos)) return "Visa";
    if (/^(5[1-5]|2[2-7])/.test(digitos)) return "Mastercard";
    if (/^3[47]/.test(digitos)) return "Amex";
    return "";
};