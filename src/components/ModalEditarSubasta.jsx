import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import { useGSAP } from "@gsap/react"
import api from "../config/api.config"
import { toast } from "../utils/avisos"
import { armarFormDataImagenes, mensajeErrorSubida } from "../utils/imagenes"
import { editarSubastaSchema } from "../validators/subastas.validators"
import { gsap, DURACION, EASE, movimientoReducido } from "../animations/config"
import EditorFotos from "./EditorFotos"

const ModalEditarSubasta = ({ subasta, alCerrar, alActualizar }) => {

    const [existentes, setExistentes] = useState(subasta.imagenes);
    const [nuevas, setNuevas] = useState([]);
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

    const totalFotos = existentes.length + nuevas.length;
    const fotosCambiaron = nuevas.length > 0 || existentes.length !== subasta.imagenes.length;
    const hayCambios = isDirty || fotosCambiaron;

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

    const agregarFotos = (agregadas) => {
        setNuevas((actuales) => [...actuales, ...agregadas]);
    }

    const quitarExistente = (url) => {
        setExistentes((actuales) => actuales.filter((u) => u !== url));
    }

    const quitarNueva = (indice) => {
        URL.revokeObjectURL(nuevas[indice].vista);
        setNuevas((actuales) => actuales.filter((_, i) => i !== indice));
    }

    const guardarFotos = () => {
        return armarFormDataImagenes(nuevas.map((nueva) => nueva.archivo))
            .then((formData) => {
                formData.append("conservar", JSON.stringify(existentes));
                return api.put(`/subastas/${subasta._id}/imagenes`, formData);
            })
            .then((response) => response.data.subasta);
    }

    const guardar = (data) => {
        setGuardando(true);

        let ultimaVersion = null;
        let cadena = Promise.resolve();

        if (isDirty) {
            cadena = cadena
                .then(() => api.patch(`/subastas/${subasta._id}`, data))
                .then((response) => { ultimaVersion = response.data.subasta; });
        }

        if (fotosCambiaron) {
            cadena = cadena
                .then(() => guardarFotos())
                .then((subastaActualizada) => { ultimaVersion = subastaActualizada; });
        }

        cadena
            .then(() => {
                alActualizar(ultimaVersion);
                toast.success("Publicación actualizada");
                cerrar();
            })
            .catch((err) => {
                if (ultimaVersion) alActualizar(ultimaVersion);
                toast.error("No se pudieron guardar los cambios", mensajeErrorSubida(err));
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
                        <h2 id="modal-titulo">{subasta.titulo}</h2>
                        <p>{subasta.vehiculo.marca} {subasta.vehiculo.modelo} · {subasta.vehiculo.anio}</p>
                    </div>
                    <button type="button" className="modal-cerrar" onClick={cerrar} aria-label="Cerrar">×</button>
                </header>

                <div className="modal-cuerpo">
                    <section className="modal-seccion">
                        <h3>Fotos</h3>
                        <p className="modal-ayuda">La primera foto es la portada. Mínimo 1, máximo 5.</p>
                        <EditorFotos
                            existentes={existentes}
                            nuevas={nuevas}
                            alAgregar={agregarFotos}
                            alQuitarExistente={quitarExistente}
                            alQuitarNueva={quitarNueva}
                        />
                        {totalFotos === 0 && <span className="error">La publicación tiene que tener al menos una foto</span>}
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
                            <textarea
                                {...register("descripcion")}
                                id="descripcion"
                                rows="10"
                                placeholder={"Contá el estado del auto...\n\n* Kilómetros: 148.000 km\n* Aire acondicionado\n* Services al día"}
                            ></textarea>
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
                    <button
                        type="submit"
                        form="form-editar"
                        className="btn"
                        disabled={!isValid || !hayCambios || totalFotos === 0 || guardando}
                    >
                        {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    )
}

export default ModalEditarSubasta