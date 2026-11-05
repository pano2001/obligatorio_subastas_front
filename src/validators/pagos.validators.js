import Joi from "joi";

export const pagoSchema = Joi.object({
    numeroTarjeta: Joi.string().pattern(/^(\d{4}\s?){4}$/).required().messages({
        'string.empty': 'El número de tarjeta es obligatorio',
        'string.pattern.base': 'El número debe tener 16 dígitos'
    }),
    titular: Joi.string().min(5).max(50).required().messages({
        'string.empty': 'El nombre del titular es obligatorio',
        'string.min': 'Ingresá el nombre como figura en la tarjeta'
    }),
    vencimiento: Joi.string().pattern(/^(0[1-9]|1[0-2])\/\d{2}$/).required().messages({
        'string.empty': 'El vencimiento es obligatorio',
        'string.pattern.base': 'Usá el formato MM/AA'
    }),
    cvv: Joi.string().pattern(/^\d{3,4}$/).required().messages({
        'string.empty': 'El CVV es obligatorio',
        'string.pattern.base': 'El CVV tiene 3 o 4 dígitos'
    })
});