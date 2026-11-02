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

const App = () => {
  return (
    <Provider store={store}>
      <Toaster position="bottom-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Contenedor />}>
            <Route path="/" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/subastas" element={<ProtectedRoute />}>
              <Route path="" element={<Subastas />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

export default App
