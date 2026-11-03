import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    subastas: [],
}

const subastasSlice = createSlice({
    name: "subastas",
    initialState,
    reducers: {
        guardarSubastas: (state, action) => {
            state.subastas = action.payload;
        },
        agregarSubasta: (state, action) => {
            state.subastas.push(action.payload);
        },
        quitarSubasta: (state, action) => {
            state.subastas = state.subastas.filter(subasta => subasta._id !== action.payload);
        },
        reemplazarSubasta: (state, action) => {
            const indice = state.subastas.findIndex(subasta => subasta._id === action.payload._id);
            if (indice !== -1) {
                state.subastas[indice] = action.payload;
            }
        },
    }
});

export const { guardarSubastas, agregarSubasta, quitarSubasta, reemplazarSubasta } = subastasSlice.actions;
export default subastasSlice.reducer;