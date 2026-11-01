import { useState, useEffect } from "react";
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import api from "./config/api.config";

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
        api.get("/categorias")
            .then((res) => console.log("Categorías:", res.data))
            .catch((err) => console.error("Error:", err.response?.data || err.message));
    }, []);

    return <h1>Subastas</h1>;
}

export default App;
