import axios from 'axios';

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8000/api/shopify' 
  : 'https://api.novedadeswow.com/api/shopify';

axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en la solicitud HTTP:', error);
    if (error.response) {
      console.error('Datos de respuesta de error:', error.response.data);
      console.error('Estado de respuesta de error:', error.response.status);
    } else if (error.request) {
      console.error('La solicitud se realizó pero no se recibió respuesta');
    }
    return Promise.reject(error);
  }
);

export const getShopInfo = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/shop`);
    console.log('Shop info response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener información de la tienda:', error);
    throw error;
  }
};

export const fetchOrders = async () => {
  try {
    console.log('Solicitando pedidos a:', `${API_BASE_URL}/orders`);
    const response = await axios.get(`${API_BASE_URL}/orders`);
    console.log('Pedidos recibidos:', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    if (error.response) {
      console.error('Datos de respuesta de error:', error.response.data);
      console.error('Estado de respuesta de error:', error.response.status);
    } else if (error.request) {
      console.error('La solicitud se realizó pero no se recibió respuesta');
    }
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/orders/${orderId}.json`); // <-- CORREGIDO
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el pedido ${orderId}:`, error);
    throw error;
  }
};

export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

export default {
  getShopInfo,
  fetchOrders,
  getOrderById,
  getProducts
};