import { sileo } from "sileo"

export const toast = {
    success: (titulo, descripcion) => sileo.success({ title: titulo, description: descripcion }),
    error: (titulo, descripcion) => sileo.error({ title: titulo, description: descripcion }),
    info: (titulo, descripcion) => sileo.info({ title: titulo, description: descripcion }),
}