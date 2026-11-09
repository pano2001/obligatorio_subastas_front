import { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useGSAP } from "@gsap/react"
import api from "../config/api.config"
import { guardarPublicas } from "../features/subastas.slice"
import { gsap, Flip, SplitText, EASE, DURACION, entradaEscalonada, movimientoReducido } from "../animations/config"
import TarjetaSubasta from "../components/TarjetaSubasta"
import EsqueletoTarjetas from "../components/EsqueletoTarjetas"

const FILTROS_INICIALES = {
    busqueda: "",
    categoria: "",
    minimo: "",
    maximo: "",
    orden: "recientes"
};

const ordenar = (lista, orden) => {
    const copia = [...lista];
    if (orden === "precio-asc") return copia.sort((a, b) => a.precioActual - b.precioActual);
    if (orden === "precio-desc") return copia.sort((a, b) => b.precioActual - a.precioActual);
    if (orden === "terminan") return copia.sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin));
    return copia.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const Explorar = () => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filtros, setFiltros] = useState(FILTROS_INICIALES);
    const [panelAbierto, setPanelAbierto] = useState(false);

    const dispatch = useDispatch();
    const publicas = useSelector((state) => state.subastas.publicas);
    const categorias = useSelector((state) => state.categorias.lista);

    const raiz = useRef(null);
    const estadoFlip = useRef(null);
    const animacionPanel = useRef(null);

    useEffect(() => {
        setLoading(true);
        setError("");

        api.get("/subastas", { params: { estado: "activa" } })
            .then((response) => {
                dispatch(guardarPublicas(response.data.subastas));
            })
            .catch((err) => {
                setError(err.response?.data?.message || "No se pudieron cargar las subastas");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [dispatch]);

    const texto = filtros.busqueda.trim().toLowerCase();

    const resultados = ordenar(
        publicas.filter((subasta) => {
            if (filtros.categoria && subasta.categoria !== filtros.categoria) return false;
            if (filtros.minimo && subasta.precioActual < Number(filtros.minimo)) return false;
            if (filtros.maximo && subasta.precioActual > Number(filtros.maximo)) return false;
            if (texto) {
                const contenido = `${subasta.titulo} ${subasta.vehiculo.marca} ${subasta.vehiculo.modelo}`.toLowerCase();
                if (!contenido.includes(texto)) return false;
            }
            return true;
        }),
        filtros.orden
    );

    const hayFiltros = JSON.stringify(filtros) !== JSON.stringify(FILTROS_INICIALES);

    const guardarEstadoFlip = () => {
        if (!raiz.current || movimientoReducido()) return;
        estadoFlip.current = Flip.getState(raiz.current.querySelectorAll(".grilla .tarjeta"));
    }

    const cambiarFiltro = (campo, valor) => {
        guardarEstadoFlip();
        setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }));
    }

    const limpiarFiltros = () => {
        guardarEstadoFlip();
        setFiltros(FILTROS_INICIALES);
    }

    useGSAP(() => {
        if (movimientoReducido()) return;

        const division = SplitText.create(".explorar-titulo", { type: "words" });
        gsap.from(division.words, {
            autoAlpha: 0,
            y: 24,
            duration: DURACION.normal,
            stagger: 0.06,
            ease: EASE.salida
        });

        return () => division.revert();
    }, { scope: raiz });

    useGSAP(() => {
        if (loading) return;
        entradaEscalonada(raiz.current.querySelectorAll(".grilla .tarjeta"));
    }, { scope: raiz, dependencies: [loading] });

    useGSAP(() => {
        if (!estadoFlip.current) return;

        Flip.from(estadoFlip.current, {
            duration: DURACION.normal,
            ease: EASE.entradaSalida,
            absolute: true,
            onEnter: (nuevas) => gsap.fromTo(nuevas,
                { autoAlpha: 0, scale: 0.94 },
                { autoAlpha: 1, scale: 1, duration: DURACION.rapida }
            )
        });

        estadoFlip.current = null;
    }, { scope: raiz, dependencies: [filtros] });

    useGSAP(() => {
        const mm = gsap.matchMedia();

        mm.add("(max-width: 860px)", () => {
            animacionPanel.current = gsap.timeline({ paused: true })
                .to(".filtros-fondo", { autoAlpha: 1, duration: 0.25 })
                .fromTo(".filtros-panel", { xPercent: -100 }, { xPercent: 0, duration: 0.4, ease: EASE.salida }, 0);

            return () => {
                animacionPanel.current = null;
            };
        });
    }, { scope: raiz });

    useEffect(() => {
        if (!animacionPanel.current) return;

        if (panelAbierto) {
            animacionPanel.current.play();
        } else {
            animacionPanel.current.reverse();
        }
    }, [panelAbierto]);

    return (
        <div className="explorar" ref={raiz}>
            <div className="explorar-cabecera">
                <div>
                    <span className="eyebrow">Vidriera</span>
                    <h1 className="explorar-titulo">Subastas activas</h1>
                </div>
                <button type="button" className="btn-secundario boton-filtros" onClick={() => setPanelAbierto(true)}>
                    Filtros
                </button>
            </div>

            <div className="explorar-layout">
                <div className="filtros-fondo" onClick={() => setPanelAbierto(false)}></div>

                <aside className="filtros-panel">
                    <div className="filtros-encabezado">
                        <h2>Filtros</h2>
                        <button type="button" className="btn-fantasma btn-chico filtros-cerrar" onClick={() => setPanelAbierto(false)}>
                            Cerrar
                        </button>
                    </div>

                    <div className="form-group">
                        <label htmlFor="busqueda">Buscar</label>
                        <input
                            id="busqueda"
                            type="search"
                            placeholder="Marca, modelo o título"
                            value={filtros.busqueda}
                            onChange={(e) => cambiarFiltro("busqueda", e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="categoria">Categoría</label>
                        <select id="categoria" value={filtros.categoria} onChange={(e) => cambiarFiltro("categoria", e.target.value)}>
                            <option value="">Todas</option>
                            {categorias.map((categoria) => (
                                <option value={categoria._id} key={categoria._id}>{categoria.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="minimo">Precio (USD)</label>
                        <div className="rango">
                            <input
                                id="minimo"
                                type="number"
                                min="0"
                                placeholder="Mínimo"
                                value={filtros.minimo}
                                onChange={(e) => cambiarFiltro("minimo", e.target.value)}
                            />
                            <input
                                type="number"
                                min="0"
                                placeholder="Máximo"
                                aria-label="Precio máximo"
                                value={filtros.maximo}
                                onChange={(e) => cambiarFiltro("maximo", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="orden">Ordenar por</label>
                        <select id="orden" value={filtros.orden} onChange={(e) => cambiarFiltro("orden", e.target.value)}>
                            <option value="recientes">Más recientes</option>
                            <option value="terminan">Terminan antes</option>
                            <option value="precio-asc">Precio: menor a mayor</option>
                            <option value="precio-desc">Precio: mayor a menor</option>
                        </select>
                    </div>

                    <button type="button" className="btn-secundario btn-bloque" onClick={limpiarFiltros} disabled={!hayFiltros}>
                        Limpiar filtros
                    </button>
                </aside>

                <section>
                    <div className="resultados-barra">
                        {loading
                            ? "Buscando subastas..."
                            : `${resultados.length} ${resultados.length === 1 ? "resultado" : "resultados"}`}
                    </div>

                    {loading ? (
                        <EsqueletoTarjetas cantidad={6} />
                    ) : error ? (
                        <div className="estado-vacio">
                            <h3>No pudimos cargar las subastas</h3>
                            <p>{error}</p>
                        </div>
                    ) : resultados.length === 0 ? (
                        <div className="estado-vacio">
                            <h3>No encontramos subastas</h3>
                            <p>Probá con otros filtros o volvé más tarde.</p>
                            {hayFiltros && (
                                <button type="button" className="btn-secundario" onClick={limpiarFiltros}>Limpiar filtros</button>
                            )}
                        </div>
                    ) : (
                        <div className="grilla">
                            {resultados.map((subasta) => (
                                <TarjetaSubasta subasta={subasta} key={subasta._id} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default Explorar