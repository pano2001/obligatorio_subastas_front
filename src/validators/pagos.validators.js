import Joi from "joi";

const pasaLuhn = (numero) => {
    let suma = 0;
    let duplicar = false;

    for (let i = numero.length - 1; i >= 0; i--) {
        let digito = Number(numero[i]);
        if (duplicar) {
            digito *= 2;
            if (digito > 9) digito -= 9;
        }
        suma += digito;
        duplicar = !duplicar;
    }

    return suma % 10 === 0;
};

const noEstaVencida = (vencimiento) => {
    const [mes, anio] = vencimiento.split("/").map(Number);
    const ahora = new Date();
    const anioActual = ahora.getFullYear() % 100;
    const mesActual = ahora.getMonth() + 1;

    return anio > anioActual || (anio === anioActual && mes >= mesActual);
};

export const pagoSchema = Joi.object({
    numeroTarjeta: Joi.string()
        .pattern(/^(\d{4}\s?){4}$/)
        .custom((valor, helpers) => pasaLuhn(valor.replace(/\s/g, "")) ? valor : helpers.error("tarjeta.invalida"))
        .required()
        .messages({
            'string.empty': 'Ingresá el número de la tarjeta',
            'string.pattern.base': 'El número de tarjeta está incompleto',
            'tarjeta.invalida': 'El número de tarjeta no es válido'
        }),
    titular: Joi.string().trim().min(5).max(50).required().messages({
        'string.empty': 'Ingresá el nombre del titular',
        'string.min': 'Ingresá el nombre como figura en la tarjeta',
        'string.max': 'El nombre es demasiado largo'
    }),
    vencimiento: Joi.string()
        .pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
        .custom((valor, helpers) => noEstaVencida(valor) ? valor : helpers.error("tarjeta.vencida"))
        .required()
        .messages({
            'string.empty': 'Ingresá el vencimiento',
            'string.pattern.base': 'El vencimiento debe tener el formato MM/AA',
            'tarjeta.vencida': 'La tarjeta está vencida'
        }),
    cvv: Joi.string().pattern(/^\d{3,4}$/).required().messages({
        'string.empty': 'Ingresá el código de seguridad',
        'string.pattern.base': 'El código de seguridad tiene 3 o 4 dígitos'
    })
});