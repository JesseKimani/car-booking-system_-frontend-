import axios from "axios";
import router from './router/index'
import { API_ENDPOINT } from "./config";

const api = axios.create ({
    baseURL: `${API_ENDPOINT}`,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response.status === 401) {
            localStorage.removeItem('token');
            router.push('/login')
        }
        return Promise.reject(error)
    }
);

export default api;