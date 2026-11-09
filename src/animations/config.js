import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Flip } from "gsap/Flip"
import { SplitText } from "gsap/SplitText"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, Flip, SplitText, useGSAP);

export const DURACION = {
    rapida: 0.3,
    normal: 0.5,
    lenta: 0.8
};

export const EASE = {
    salida: "power3.out",
    suave: "power2.out",
    entradaSalida: "power2.inOut",
    rebote: "back.out(1.7)"
};

let reducido = false;

gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => {
    reducido = true;
    return () => {
        reducido = false;
    };
});

export const movimientoReducido = () => reducido;

export const entradaPagina = (elemento) => {
    if (!elemento) return;
    if (reducido) return gsap.set(elemento, { autoAlpha: 1 });

    return gsap.fromTo(elemento,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: DURACION.normal, ease: EASE.salida, clearProps: "transform" }
    );
};

export const entradaEscalonada = (elementos) => {
    if (reducido) return gsap.set(elementos, { autoAlpha: 1 });

    return gsap.fromTo(elementos,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: DURACION.normal, stagger: 0.06, ease: EASE.salida, clearProps: "transform" }
    );
};

export const sacudir = (elemento) => {
    if (!elemento || reducido) return;

    return gsap.fromTo(elemento,
        { x: 0 },
        { keyframes: { x: [-8, 8, -6, 6, -3, 3, 0] }, duration: 0.45, ease: "none" }
    );
};

export const pulso = (elemento) => {
    if (!elemento || reducido) return;

    return gsap.fromTo(elemento,
        { scale: 1 },
        { scale: 1.08, duration: 0.18, ease: EASE.suave, yoyo: true, repeat: 1 }
    );
};

export { gsap, ScrollTrigger, Flip, SplitText };