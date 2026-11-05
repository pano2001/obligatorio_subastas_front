import { useState, useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger);

const RECORRIDOS = [
    {
        id: "comprar",
        etiqueta: "01",
        titulo: "Comprar un auto",
        pasos: [
            { titulo: "Encontralo.", texto: "Creá tu cuenta y explorá una selección de automóviles publicados por sus dueños." },
            { titulo: "Ofertá.", texto: "Participá en la subasta y hacé tu oferta. Cada puja supera a la anterior." },
            { titulo: "Es tuyo.", texto: "Ganás la subasta y coordinás la compra con el vendedor." }
        ]
    },
    {
        id: "vender",
        etiqueta: "02",
        titulo: "Vender un auto",
        pasos: [
            { titulo: "Publicalo.", texto: "Subí tu vehículo con sus características y hasta cinco fotografías." },
            { titulo: "Dejalo competir.", texto: "Los interesados pujan entre ellos y el precio sube solo." },
            { titulo: "Vendido.", texto: "Se cierra la subasta y concretás la venta con el ganador." }
        ]
    }
]

const GAP = 14;

const Procesos = () => {

    const [abierto, setAbierto] = useState(null);
    const contenedor = useRef(null);

    const alternar = (id) => {
        setAbierto(abierto === id ? null : id);
    }

    useGSAP(() => {
        const mm = gsap.matchMedia();

        RECORRIDOS.forEach((recorrido) => {
            const bloque = contenedor.current.querySelector(`[data-id="${recorrido.id}"]`);
            gsap.to(bloque, {
                flexGrow: abierto === null ? 1 : (abierto === recorrido.id ? 5 : 1),
                duration: 0.7,
                ease: "power3.inOut",
                onComplete: () => ScrollTrigger.refresh()
            });
        });

        if (!abierto) return;

        mm.add("(min-width: 900px)", () => {
            const riel = contenedor.current.querySelector(".bloque-abierto .bloque-pasos");
            if (!riel) return;

            const tarjetas = gsap.utils.toArray(".bloque-abierto .paso-card");
            const cantidad = tarjetas.length;
            if (cantidad < 2) return;

            const avance = () => (tarjetas[0].offsetWidth + GAP) * (cantidad - 1);

            const enfocar = (indice) => {
                tarjetas.forEach((tarjeta, i) => {
                    gsap.to(tarjeta, {
                        scale: i === indice ? 1 : 0.86,
                        opacity: i === indice ? 1 : 0.3,
                        duration: 0.35,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                });
            };

            enfocar(0);

            gsap.to(riel, {
                x: () => -avance(),
                ease: "none",
                scrollTrigger: {
                    trigger: contenedor.current,
                    start: "center center",
                    end: () => "+=" + avance(),
                    pin: true,
                    scrub: 0.8,
                    snap: {
                        snapTo: 1 / (cantidad - 1),
                        duration: 0.35,
                        ease: "power1.inOut"
                    },
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        enfocar(Math.round(self.progress * (cantidad - 1)));
                    }
                }
            });
        });
    }, { scope: contenedor, dependencies: [abierto] });

    return (
        <section className="procesos" ref={contenedor}>
            <div className="procesos-marco">
                <div className="procesos-bloques">
                    {RECORRIDOS.map((recorrido) => (
                        <div
                            className={`bloque ${abierto === recorrido.id ? "bloque-abierto" : ""}`}
                            data-id={recorrido.id}
                            key={recorrido.id}
                        >
                            <button
                                type="button"
                                className="bloque-boton"
                                onClick={() => alternar(recorrido.id)}
                            >
                                <span className="bloque-etiqueta">{recorrido.etiqueta}</span>
                                <span className="bloque-titulo">{recorrido.titulo}</span>
                            </button>

                            {abierto === recorrido.id && (
                                <div className="bloque-pasos">
                                    {recorrido.pasos.map((paso, indice) => (
                                        <article className="paso-card" key={paso.titulo}>
                                            <span className="paso-numero">Paso {indice + 1}</span>
                                            <h3>{paso.titulo}</h3>
                                            <p>{paso.texto}</p>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Procesos