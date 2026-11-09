const Privacidad = () => {
    return (
        <div className="container texto-legal">
            <header className="pagina-encabezado">
                <span className="eyebrow">Legal</span>
                <h1 className="pagina-titulo">Política de privacidad</h1>
                <p className="pagina-bajada">Última actualización: noviembre de 2026</p>
            </header>

            <section>
                <h2>Qué es Pano Select</h2>
                <p>Pano Select es un proyecto académico desarrollado para la materia Desarrollo Full Stack de la Universidad ORT Uruguay. No es un servicio comercial.</p>
            </section>

            <section>
                <h2>Qué datos guardamos</h2>
                <p>Cuando creás una cuenta guardamos tu nombre, tu nombre de usuario y tu email. Si ingresás con Google, recibimos de Google únicamente tu nombre, tu email y un identificador de cuenta. No accedemos a tus contactos, archivos ni a ningún otro dato de tu cuenta de Google.</p>
                <p>También guardamos las subastas que publicás, sus fotos y las pujas que realizás.</p>
            </section>

            <section>
                <h2>Pagos</h2>
                <p>Los pagos del sitio son simulados. Nunca guardamos el número completo de una tarjeta ni su código de seguridad: solo los últimos cuatro dígitos y la marca, para mostrar el comprobante.</p>
            </section>

            <section>
                <h2>Para qué usamos tus datos</h2>
                <p>Usamos tus datos solo para que puedas iniciar sesión, publicar subastas y participar en ellas. No los vendemos ni los compartimos con terceros.</p>
            </section>

            <section>
                <h2>Contacto</h2>
                <p>Si querés que eliminemos tu cuenta y tus datos, escribinos a claudesantinopano@gmail.com.</p>
            </section>
        </div>
    )
}

export default Privacidad