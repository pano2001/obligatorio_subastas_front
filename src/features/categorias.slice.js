import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    lista: [],
}

const categoriasSlice = createSlice({
    name: "categorias",
    initialState,
    reducers: {
        guardarCategorias: (state, action) => {
            state.lista = action.payload;
        }
    }
})

export const { guardarCategorias } = categoriasSlice.actions;
export default categoriasSlice.reducer;