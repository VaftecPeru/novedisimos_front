import axios from 'axios';

const API_URL = 'http://localhost:5000/api/shopify';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en petición API:', error.message);
    
    if (!error.response) {
      console.error('No se pudo conectar al servidor. Verifica que el backend esté funcionando.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;