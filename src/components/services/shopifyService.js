import axios from 'axios';
import Swal from 'sweetalert2';

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const CUSTOM_API_BASE_URL = isDevelopment
  ? 'http://localhost:8000/api'
  : 'https://api.novedadeswow.com/api';


const API_BASE_URL = isDevelopment
  ? 'http://localhost:8000/api/shopify'
  : 'https://api.novedadeswow.com/api/shopify';


export const fetchPedidosPreparacionInterna = async () => {
  try {
    const res = await axios.get(`${CUSTOM_API_BASE_URL}/preparacion-pedidos`);
    return res.data || [];
  } catch (error) {
    console.error('Error al obtener pedidos internos de almacén:', error);
    return [];
  }
};

export const crearPreparacionPedido = async (shopify_order_id) => {
  try {
    const res = await axios.post(`${CUSTOM_API_BASE_URL}/preparacion-pedidos`, {
      shopify_order_id
    });
    Swal.fire('Preparación creada', 'El pedido ha sido registrado en almacén.', 'success');
    return res.data;
  } catch (error) {
    console.error('Error al crear control de preparación:', error);
    Swal.fire('Error', 'No se pudo registrar el pedido en almacén.', 'error');
    return null;
  }
};

export const actualizarEstadoPreparacion = async (id, nuevosDatos) => {
  try {
    // Asegurarse de que se está enviando el campo correcto: 'estado'
    const res = await axios.put(`${CUSTOM_API_BASE_URL}/preparacion-pedidos/${id}`, nuevosDatos);

    if (res.data?.success) {
      Swal.fire('Actualizado', 'El estado del pedido en almacén ha sido actualizado.', 'success');
    } else {
      Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar preparación:', error);
    Swal.fire('Error', 'Error del servidor al actualizar el estado.', 'error');
    return null;
  }
};


export const fetchEstadosPedidos = async () => {
  try {
    const res = await axios.get(`${CUSTOM_API_BASE_URL}/estado-pedido-todos`);
    return res.data.data || [];
  } catch (error) {
    console.error('Error al obtener estados internos de pedidos:', error);
    return [];
  }
};

export const actualizarEstadoInternoPago = async (pedidoId, estadoPago) => {
  try {
    const response = await axios.post(`${CUSTOM_API_BASE_URL}/estado-pedido`, {
      shopify_order_id: pedidoId,
      estado_pago: estadoPago,
    });

    if (response.data && response.data.message) {
      Swal.fire('Actualizado', 'El estado de pago ha sido actualizado.', 'success');
    } else {
      Swal.fire('Error', 'No se pudo actualizar el estado de pago.', 'error');
    }
    return response; // <-- importante para el frontend
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'Error del servidor al actualizar estado de pago.', 'error');
    return null;
  }
};

export const actualizarEstadoInternoPreparacion = async (pedidoId, estadoActual) => {
  const nuevoEstado = estadoActual === 'preparado' ? 'no_preparado' : 'preparado';

  try {
    const response = await axios.post(`${CUSTOM_API_BASE_URL}/estado-pedido`, {
      shopify_order_id: pedidoId,
      estado_preparacion: nuevoEstado,
    });

    if (response.data && response.data.message) {
      Swal.fire('Actualizado', 'El estado de preparación ha sido actualizado.', 'success');
    } else {
      Swal.fire('Error', 'No se pudo actualizar el estado de preparación.', 'error');
    }
    return response; // <-- AGREGA ESTA LÍNEA
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'Error del servidor al actualizar estado de preparación.', 'error');
    return null; // <-- AGREGA ESTA LÍNEA
  }
};

//Listar notificaciones de almacén
export const listarNotificacionesAlmacen = async () => {
  try {
    const response = await axios.get(`${CUSTOM_API_BASE_URL}/notificaciones/almacen`);
    return response.data;
  } catch (error) {
    console.error('Error al listar notificaciones de almacén:', error);
    return [];
  }
};

// Crear notificación de almacén
export const crearNotificacionAlmacen = async ({ shopify_order_id, mensaje, tipo = "PAGO_CONFIRMADO" }) => {
  try {
    const response = await axios.post(`${CUSTOM_API_BASE_URL}/notificaciones/almacen`, {
      shopify_order_id,
      mensaje,
      tipo,
    });
    console.log("✅ Notificación creada correctamente:", response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear notificación de almacén:', error.response?.data || error.message);
    return null;
  }
};



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
  const response = await axios.get(`${API_BASE_URL}/orders/${orderId}.json`);
  return response.data;
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