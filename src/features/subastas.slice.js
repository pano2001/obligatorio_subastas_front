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
    }
});

export const { guardarSubastas, agregarSubasta } = subastasSlice.actions;
export default subastasSlice.reducer;