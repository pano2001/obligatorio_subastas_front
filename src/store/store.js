import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth.slice";
import subastasReducer from "../features/subastas.slice";
import categoriasReducer from "../features/categorias.slice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        subastas: subastasReducer,
        categorias: categoriasReducer,
    }
});