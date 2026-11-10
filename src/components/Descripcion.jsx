const VINETA = /^\s*[*\-•]\s+/;

const armarBloques = (texto) => {
    const bloques = [];

    texto.split("\n").forEach((linea) => {
        const ultimo = bloques[bloques.length - 1];

        if (VINETA.test(linea)) {
            const item = linea.replace(VINETA, "");
            if (ultimo && ultimo.tipo === "lista") {
                ultimo.items.push(item);
            } else {
                bloques.push({ tipo: "lista", items: [item] });
            }
        } else if (linea.trim() === "") {
            if (ultimo && ultimo.tipo !== "espacio") {
                bloques.push({ tipo: "espacio" });
            }
        } else {
            bloques.push({ tipo: "texto", texto: linea });
        }
    });

    return bloques;
}

const Descripcion = ({ texto }) => {
    const bloques = armarBloques(texto);

    return (
        <div className="descripcion">
            {bloques.map((bloque, indice) => {
                if (bloque.tipo === "lista") {
                    return (
                        <ul key={indice}>
                            {bloque.items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    )
                }
                if (bloque.tipo === "espacio") {
                    return <div className="descripcion-espacio" key={indice}></div>
                }
                return <p key={indice}>{bloque.texto}</p>
            })}
        </div>
    )
}

export default Descripcion