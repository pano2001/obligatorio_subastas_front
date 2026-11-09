import Joi from "joi";

export const perfilSchema = Joi.object({
    nombre: Joi.string().min(3).max(30).required().messages({
        'string.empty': 'El nombre es obligatorio',
        'string.min': 'El nombre debe tener al menos {#limit} caracteres',
        'string.max': 'El nombre no puede tener más de {#limit} caracteres'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.empty': 'El email es obligatorio',
        'string.email': 'El email debe tener un formato válido'
    })
});

export const passwordSchema = Joi.object({
    passwordActual: Joi.string().required().messages({
        'string.empty': 'Ingresá tu contraseña actual'
    }),
    passwordNueva: Joi.string().min(6).pattern(/^(?=.*[a-zA-Z])(?=.*\d)/).invalid(Joi.ref('passwordActual')).required().messages({
        'string.empty': 'Ingresá la nueva contraseña',
        'string.min': 'Debe tener al menos {#limit} caracteres',
        'string.pattern.base': 'Debe tener al menos una letra y un número',
        'any.invalid': 'Tiene que ser distinta de la actual'
    }),
    repetirPassword: Joi.any().valid(Joi.ref('passwordNueva')).required().messages({
        'any.only': 'Las contraseñas no coinciden',
        'any.required': 'Repetí la nueva contraseña'
    })
});