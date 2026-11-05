import Joi from "joi";

export const categoriaSchema = Joi.object({
    nombre: Joi.string().min(3).max(30).required().messages({
        'string.empty': 'El nombre es obligatorio',
        'string.min': 'El nombre debe tener al menos {#limit} caracteres',
        'string.max': 'El nombre no puede tener más de {#limit} caracteres'
    }),
    descripcion: Joi.string().max(200).allow("").messages({
        'string.max': 'La descripción no puede tener más de {#limit} caracteres'
    })
});