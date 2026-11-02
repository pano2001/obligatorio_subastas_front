import Joi from "joi";

export const registerSchema = Joi.object({
    nombre: Joi.string().min(3).max(30).required().messages({
        'string.empty': 'El nombre es obligatorio',
        'string.min': 'El nombre debe tener al menos {#limit} caracteres',
        'string.max': 'El nombre no puede tener más de {#limit} caracteres',
        'any.required': 'El nombre es obligatorio'
    }),
    username: Joi.string().min(3).max(30).required().messages({
        'string.empty': 'El username es obligatorio',
        'string.min': 'El username debe tener al menos {#limit} caracteres',
        'string.max': 'El username no puede tener más de {#limit} caracteres',
        'any.required': 'El username es obligatorio'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.empty': 'El email es obligatorio',
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es obligatorio'
    }),
    password: Joi.string().min(6).pattern(/^(?=.*[a-zA-Z])(?=.*\d)/).required().messages({
        'string.empty': 'La contraseña es obligatoria',
        'string.min': 'La contraseña debe tener al menos {#limit} caracteres',
        'string.pattern.base': 'La contraseña debe tener al menos una letra y un número',
        'any.required': 'La contraseña es obligatoria'
    }),
    repetirPassword: Joi.any().valid(Joi.ref('password')).required().messages({
        'any.only': 'Las contraseñas no coinciden',
        'any.required': 'Repetí la contraseña'
    })
});

export const loginSchema = Joi.object({
    username: Joi.string().required().messages({
        'string.empty': 'El username es obligatorio',
        'any.required': 'El username es obligatorio'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'La contraseña es obligatoria',
        'any.required': 'La contraseña es obligatoria'
    })
});