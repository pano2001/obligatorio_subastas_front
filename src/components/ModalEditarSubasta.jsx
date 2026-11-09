import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { useGSAP } from "@gsap/react"
import api from "../config/api.config"
import { toast } from "../utils/avisos"
import { editarSubastaSchema } from "../validators/subastas.validators"
import { gsap, DURACION, EASE, movimientoReducido } from "../animations/config"
import ImagenesSubasta from "./ImagenesSubasta"

const ModalEditarSubasta = ({ subasta, alCerrar, alActualizar }) => {

    const [actual, setActual] = useState(subasta);
    const [guardando, setGuardando] = useState(false);

    const contenedor = useRef(null);
    const animacion = useRef(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid, isDirty },
    } = useForm({
        mode: "onChange",
        resolver: joiResolver(editarSubastaSchema),
        defaultValues: {
            titulo: subasta.titulo,
            descripcion: subasta.descripcion,
            incrementoMinimo: subasta.incrementoMinimo
        }
    })

    const largoDescripcion = watch("descripcion")?.length || 0;

    const { contextSafe } = useGSAP(() => {
        if (movimientoReducido()) return;

        animacion.current = gsap.timeline()
            .fromTo(".modal-fondo", { autoAlpha: 0 }, { autoAlpha: 1, duration: DURACION.rapida, ease: EASE.suave })
            .fromTo(".modal-panel",
                { autoAlpha: 0, y: 40, scale: 0.97 },
                { autoAlpha: 1, y: 0, scale: 1, duration: DURACION.normal, ease: EASE.salida },
                "<0.05"
            );
    }, { scope: contenedor });

    const cerrar = contextSafe(() => {
        if (!animacion.current) return alCerrar();

        animacion.current
            .timeScale(1.6)
            .eventCallback("onReverseComplete", alCerrar)
            .reverse();
    });

    useEffect(() => {
        document.body.style.overflow = "hidden";

        const alPresionarTecla = (e) => {
            if (e.key === "Escape") cerrar();
        }
        window.addEventListener("keydown", alPresionarTecla);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", alPresionarTecla);
        }
    }, []);

    const cambiarImagenes = (subastaActualizada) => {
        setActual(subastaActualizada);
        alActualizar(subastaActualizada);
    }

    const guardar = (data) => {
        setGuardando(true);

        api.patch(`/subastas/${subasta._id}`, data)
            .then((response) => {
                alActualizar(response.data.subasta);
                toast.success("Publicación actualizada");
                cerrar();
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "No se pudo actualizar la publicación");
            })
            .finally(() => {
                setGuardando(false);
            })
    }

    return createPortal(
        <div className="modal" ref={contenedor}>
            <div className="modal-fondo" onClick={cerrar}></div>

            <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
                <header className="modal-cabecera">
                    <div>
                        <span className="eyebrow">Editar publicación</span>
                        <h2 id="modal-titulo">{actual.titulo}</h2>
                        <p>{actual.vehiculo.marca} {actual.vehiculo.modelo} · {actual.vehiculo.anio}</p>
                    </div>
                    <button type="button" className="modal-cerrar" onClick={cerrar} aria-label="Cerrar">×</button>
                </header>

                <div className="modal-cuerpo">
                    <section className="modal-seccion">
                        <h3>Fotos</h3>
                        <p className="modal-ayuda">La primera foto es la portada. Máximo 5.</p>
                        <ImagenesSubasta subasta={actual} alCambiar={cambiarImagenes} />
                    </section>

                    <form id="form-editar" className="modal-seccion" onSubmit={handleSubmit(guardar)}>
                        <h3>Datos</h3>

                        <div className="form-group">
                            <label htmlFor="editar-titulo">Título</label>
                            <input {...register("titulo")} type="text" id="editar-titulo" />
                            <span className="error">{errors.titulo?.message}</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="editar-descripcion">Descripción</label>
                            <textarea {...register("descripcion")} id="editar-descripcion" rows="5"></textarea>
                            <div className="campo-pie">
                                <span className="error">{errors.descripcion?.message}</span>
                                <small>{largoDescripcion}/1000</small>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="editar-incremento">Incremento mínimo (USD)</label>
                            <input {...register("incrementoMinimo")} type="number" id="editar-incremento" />
                            <span className="error">{errors.incrementoMinimo?.message}</span>
                        </div>
                    </form>
                </div>

                <footer className="modal-pie">
                    <button type="button" className="btn-fantasma" onClick={cerrar}>Cancelar</button>
                    <button type="submit" form="form-editar" className="btn" disabled={!isValid || !isDirty || guardando}>
                        {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    )
}

export default ModalEditarSubasta