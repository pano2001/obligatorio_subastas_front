import { BrowserRouter, Routes, Route } from 'react-router'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { store } from './store/store'
import Contenedor from './components/Contenedor'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import AdminRoute from './components/AdminRoute'
import Landing from './pages/Landing'
import Explorar from './pages/Explorar'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Subastas from './pages/Subastas'
import NuevaSubasta from './pages/NuevaSubasta'
import SubastaDetalle from './pages/SubastaDetalle'
import Account from './pages/Account'
import Checkout from './pages/Checkout'
import AdminCategorias from './pages/AdminCategorias'
import NotFound from './pages/NotFound'

const App = () => {
  return (
    <Provider store={store}>
      <Toaster position="bottom-right" richColors />
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
              <Route path="/account" element={<Account />} />
              <Route path="/checkout" element={<Checkout />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin/categorias" element={<AdminCategorias />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

export default App