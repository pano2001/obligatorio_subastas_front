import axios from "axios";
import { toast } from "sonner";
import { store } from "../store/store";
import { cerrarSesion } from "../features/auth.slice";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const esLogin = error.config?.url?.includes("/auth/login");
        const hayToken = store.getState().auth.token;

        if (error.response?.status === 401 && !esLogin && hayToken) {
            store.dispatch(cerrarSesion());
            toast.error("Tu sesión expiró. Volvé a iniciar sesión.");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;