import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Provider } from 'react-redux'
import { Toaster } from 'sileo'
import { store } from './store/store'
import Contenedor from './components/Contenedor'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import AdminRoute from './components/AdminRoute'
import ConfigLayout from './components/ConfigLayout'
import Landing from './pages/Landing'
import Explorar from './pages/Explorar'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Subastas from './pages/Subastas'
import NuevaSubasta from './pages/NuevaSubasta'
import SubastaDetalle from './pages/SubastaDetalle'
import Checkout from './pages/Checkout'
import MiCuenta from './pages/MiCuenta'
import Plan from './pages/Plan'
import Seguridad from './pages/Seguridad'
import AdminCategorias from './pages/AdminCategorias'
import NotFound from './pages/NotFound'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Privacidad from './pages/Privacidad'
import MisPujas from './pages/MisPujas'

const App = () => {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Toaster position="bottom-right" theme="light" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Contenedor />}>
            <Route path="/" element={<Landing />} />
            <Route path="/explorar" element={<Explorar />} />
            <Route path="/subastas/:id" element={<SubastaDetalle />} />

            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/subastas" element={<Subastas />} />
              <Route path="/subastas/nueva" element={<NuevaSubasta />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/mis-pujas" element={<MisPujas />} />
            <Route path="/configuracion" element={<ConfigLayout />}>
                <Route index element={<Navigate to="cuenta" replace />} />
                <Route path="cuenta" element={<MiCuenta />} />
                <Route path="plan" element={<Plan />} />
                <Route path="seguridad" element={<Seguridad />} />
                <Route element={<AdminRoute />}>
                  <Route path="admin/categorias" element={<AdminCategorias />} />
                </Route>
              </Route>

              <Route path="/account" element={<Navigate to="/configuracion/cuenta" replace />} />
              <Route path="/plan" element={<Navigate to="/configuracion/plan" replace />} />
            </Route>
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </GoogleOAuthProvider>
    </Provider>
  )
}

export default App