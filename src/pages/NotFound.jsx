import React from 'react'

const NotFound = () => {
  return (
    <div className="container">
      <h1>404</h1>
      <p>La página que buscás no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </div>
  )
}

export default NotFound