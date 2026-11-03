import { BrowserRouter, Routes, Route } from 'react-router'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { store } from './store/store'
import Contenedor from './components/Contenedor'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Subastas from './pages/Subastas'
import NotFound from './pages/NotFound'
import PublicRoute from './components/PublicRoute'
import NuevaSubasta from './pages/NuevaSubasta'
import Account from './pages/Account'

const App = () => {
  return (
    <Provider store={store}>
      <Toaster position="bottom-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Contenedor />}>
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/subastas" element={<Subastas />} />
              <Route path="/subastas/nueva" element={<NuevaSubasta />} />
              <Route path="/account" element={<Account />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

export default App