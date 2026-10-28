const runtimeUrl = window.__APP_CONFIG__?.API_URL;
const buildUrl = import.meta.env.VITE_API_URL;

export const API_URL = (runtimeUrl || buildUrl || 'http://localhost:5000').replace(/\/+$/, '');
