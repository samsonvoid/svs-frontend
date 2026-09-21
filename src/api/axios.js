import axios from 'axios';

const getNormalizedBaseURL = (url) => {
    if (!url || typeof url !== 'string') return 'http://localhost:8000/api/v1';
    let clean = url.trim().replace(/\/+$/, '');
    if (clean.endsWith('/api/v1')) return clean;
    if (clean.endsWith('/api')) return `${clean}/v1`;
    return `${clean}/api/v1`;
};

const api = axios.create({
    baseURL: getNormalizedBaseURL(import.meta.env?.VITE_API_URL),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Intercept requests to attach Sanctum token if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('svs_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercept responses to redirect to /login on 401 (Unauthenticated)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('svs_token');
            localStorage.removeItem('svs_user');
            // Only redirect if not already on login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

