import {createSlice} from "@reduxjs/toolkit";

const cargarUsuario = () => {
    try {
        return JSON.parse(localStorage.getItem("usuario"));
    } catch {
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
        return null;
    }
};

const initialState = {
    usuario: cargarUsuario(),
    token: localStorage.getItem("token"),
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        guardarSesion: (state, action) => {
            state.usuario = action.payload.usuario;
            state.token = action.payload.token;
            localStorage.setItem("usuario", JSON.stringify(action.payload.usuario));
            localStorage.setItem("token", action.payload.token);
        },
        cerrarSesion: (state) => {
            state.usuario = null;
            state.token = null;
            localStorage.removeItem("usuario");
            localStorage.removeItem("token");
        }
    }
});

export const {guardarSesion, cerrarSesion} = authSlice.actions;
export default authSlice.reducer;
