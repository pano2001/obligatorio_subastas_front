import Joi from "joi";

export const crearSubastaSchema = Joi.object({
    titulo: Joi.string().min(5).max(80).required().messages({
        'string.empty': 'El título es obligatorio',
        'string.min': 'El título debe tener al menos {#limit} caracteres',
        'string.max': 'El título no puede tener más de {#limit} caracteres'
    }),
    descripcion: Joi.string().min(10).max(1000).required().messages({
        'string.empty': 'La descripción es obligatoria',
        'string.min': 'La descripción debe tener al menos {#limit} caracteres',
        'string.max': 'La descripción no puede tener más de {#limit} caracteres'
    }),
    vehiculo: Joi.object({
        marca: Joi.string().min(2).max(30).required().messages({
            'string.empty': 'La marca es obligatoria',
            'string.min': 'La marca debe tener al menos {#limit} caracteres'
        }),
        modelo: Joi.string().min(1).max(30).required().messages({
            'string.empty': 'El modelo es obligatorio'
        }),
        anio: Joi.number().integer().min(1950).max(new Date().getFullYear() + 1).required().messages({
            'number.base': 'El año debe ser un número',
            'number.min': 'El año debe ser mayor o igual a {#limit}',
            'number.max': 'El año no puede ser mayor a {#limit}'
        })
    }).required(),
    categoria: Joi.string().hex().length(24).required().messages({
        'string.empty': 'La categoría es obligatoria',
        'string.hex': 'La categoría no es válida',
        'string.length': 'La categoría no es válida'
    }),
    precioBase: Joi.number().positive().required().messages({
        'number.base': 'El precio base debe ser un número',
        'number.positive': 'El precio base debe ser mayor a 0'
    }),
    incrementoMinimo: Joi.number().positive().required().messages({
        'number.base': 'El incremento mínimo debe ser un número',
        'number.positive': 'El incremento mínimo debe ser mayor a 0'
    }),
    fechaFin: Joi.date().greater("now").required().messages({
        'date.base': 'La fecha de fin es obligatoria',
        'date.greater': 'La fecha de fin debe ser posterior a ahora'
    })
});

export const editarSubastaSchema = Joi.object({
    titulo: Joi.string().min(5).max(80).required().messages({
        'string.empty': 'El título es obligatorio',
        'string.min': 'El título debe tener al menos {#limit} caracteres',
        'string.max': 'El título no puede tener más de {#limit} caracteres'
    }),
    descripcion: Joi.string().min(10).max(1000).required().messages({
        'string.empty': 'La descripción es obligatoria',
        'string.min': 'La descripción debe tener al menos {#limit} caracteres'
    }),
    incrementoMinimo: Joi.number().positive().required().messages({
        'number.base': 'El incremento mínimo debe ser un número',
        'number.positive': 'El incremento mínimo debe ser mayor a 0'
    })
});

export const crearPujaSchema = (montoMinimo) => Joi.object({
    monto: Joi.number().min(montoMinimo).required().messages({
        'number.base': 'El monto debe ser un número',
        'number.min': `El monto mínimo para pujar es ${montoMinimo}`
    })
});