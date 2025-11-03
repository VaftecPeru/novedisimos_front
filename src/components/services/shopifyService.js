import axios from 'axios';
import Swal from 'sweetalert2';

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const CUSTOM_API_BASE_URL = isDevelopment
  ? 'http://localhost:8000/api'
  : 'https://apiz.psicologosenlima.com/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const SHOPIFY_API_BASE_URL = `${API_BASE_URL}/shopify`;


export const fetchAuthUser = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("No token found");
      return null;
    }

    // CAMBIO: /user.php → /usuario
    const response = await axios.get(`${API_BASE_URL}/usuario`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    console.log("fetchAuthUser response:", response.data);

    // NORMALIZAR DATOS DE LARAVEL
    const userData = response.data.data;
    return {
      id: userData.id,
      name: userData.nombre_completo,
      email: userData.correo,
      rol: userData.rol
    };
  } catch (error) {
    console.error("⚠️ No se pudo obtener el usuario autenticado:", error.response?.data || error.message);
    return null;
  }
};

// NUEVA FUNCIÓN: LOGIN (agregar aquí)
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      correo: credentials.correo,
      contraseña: credentials.contraseña
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const userData = response.data.data;

    // NORMALIZAR PARA FRONTEND
    const user = {
      id: userData.id,
      name: userData.nombre_completo,
      email: credentials.correo,
      rol: userData.rol
    };

    return {
      user,
      token: userData.token
    };
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
};

// NUEVA FUNCIÓN: LOGOUT (agregar aquí)
export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (token) {
      await axios.post(`${API_BASE_URL}/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error("Error en logout:", error);
  }
};

export const fetchPedidosPreparacionInterna = async () => {
  try {
    const res = await axios.get(`${CUSTOM_API_BASE_URL}/preparacion-pedidos`);
    return res.data.data || [];
  } catch (error) {
    console.error('Error al obtener pedidos internos de almacén:', error);
    return [];
  }
};

export const fetchEstadosAlmacenDisponibles = async () => {
  try {
    const res = await axios.get(`${CUSTOM_API_BASE_URL}/estados-almacen`);
    return res.data?.data || [];
  } catch (error) {
    console.error("Error al obtener estados de almacén:", error);
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
    const res = await axios.put(`${CUSTOM_API_BASE_URL}/preparacion-pedidos/${id}`, nuevosDatos);
    Swal.fire('Actualizado', 'El estado del pedido en almacén ha sido actualizado.', 'success');
    return res.data;
  } catch (error) {
    console.error('Error al actualizar preparación:', error);
    Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
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
    return response;
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
    return response;
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'Error del servidor al actualizar estado de preparación.', 'error');
    return null;
  }
};

export const listarNotificacionesAlmacen = async () => {
  try {
    const response = await axios.get(`${CUSTOM_API_BASE_URL}/notificaciones/almacen`);
    return response.data;
  } catch (error) {
    console.error('Error al listar notificaciones de almacén:', error);
    return [];
  }
};

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

export const crearNotificacionDelivery = async ({ shopify_order_id, mensaje, tipo = "ESTADO_ALMACEN" }) => {
  try {
    const response = await axios.post(`${CUSTOM_API_BASE_URL}/notificaciones/delivery`, {
      shopify_order_id,
      mensaje,
      tipo,
    });
    console.log("✅ Notificación enviada a delivery:", response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear notificación delivery:', error.response?.data || error.message);
    return null;
  }
};

export const listarNotificacionesDelivery = async () => {
  try {
    const response = await axios.get(`${CUSTOM_API_BASE_URL}/notificaciones/delivery`);
    return response.data;
  } catch (error) {
    console.error("Error al listar notificaciones de delivery:", error);
    return [];
  }
};

export const actualizarEstadoInternoDelivery = async (shopifyId, nuevoEstado) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL.replace("/shopify", "")}/estado-delivery-actualizar/${shopifyId}`,
      { estado: nuevoEstado }
    );
    return response.data;
  } catch (error) {
    console.error("Error actualizando estado en delivery:", error);
    throw error;
  }
};



export const fetchPedidosMotorizado = async () => {
  try {
    const res = await axios.get(`${CUSTOM_API_BASE_URL}/estado-delivery-todos`);
    return res.data.data || res.data || [];
  } catch (error) {
    console.error('Error al obtener pedidos de delivery:', error);
    return [];
  }
};

export const actualizarEstadoDelivery = async (shopify_order_id, { estado }) => {
  try {
    const res = await axios.post(`${CUSTOM_API_BASE_URL}/estado-delivery-actualizar/${shopify_order_id}`, { estado });
    Swal.fire('Actualizado', 'El estado del pedido en delivery ha sido actualizado.', 'success');
    return res.data;
  } catch (error) {
    console.error('Error al actualizar estado delivery:', error);
    Swal.fire('Error', 'No se pudo actualizar el estado de delivery.', 'error');
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
  const response = await axios.get(`${SHOPIFY_API_BASE_URL}/orders`);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await axios.get(`${SHOPIFY_API_BASE_URL}/orders/${orderId}.json`);
  return response.data;
};

export const getProducts = async () => {
  const response = await axios.get(`${SHOPIFY_API_BASE_URL}/products`);
  return response.data;
};

// Listar pedido por nombre

export const fetchOrderByName = async (valorBuscar) => {
  try {

    const url = `${CUSTOM_API_BASE_URL}/shopify/orders?limit=250`;

    console.log(`🔎 Buscando pedido con name/order_number = ${valorBuscar}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.orders)) {
      throw new Error("Respuesta inválida de la API de Shopify");
    }

    const pedidoShopify = data.orders.find(
      (p) =>
        p.name === valorBuscar ||
        String(p.order_number) === valorBuscar
    );

    if (pedidoShopify) {
      console.log("✅ Pedido encontrado:", pedidoShopify);
      return pedidoShopify;
    } else {
      console.warn("❌ Pedido no encontrado");
      return null;
    }
  } catch (error) {
    console.error("Error en fetchOrderByName:", error);
    throw error;
  }
};

//  Busqueda interna y externa

export const fetchPedidoInterno = async (shopifyOrderId) => {
  try {


    const response = await fetch(`${API_BASE_URL}/pedido-interno/shopify/${shopifyOrderId}`);

    if (!response.ok) {
      throw new Error("Error al obtener pedido interno");
    }
    return await response.json();
  } catch (error) {
    console.error("❌ Error en fetchPedidoInterno:", error);
    return null;
  }
};

export const guardarPedidoInterno = async (payload, shopifyOrderId) => {
  try {
    const response = await fetch(

      `${API_BASE_URL}/pedido-interno${shopifyOrderId ? `/${shopifyOrderId}` : ''}`,

      {
        method: shopifyOrderId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error("Error al guardar: " + JSON.stringify(errorData));
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchPedidoExterno = async (shopifyOrderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pedido-externo/shopify/${shopifyOrderId}`);

    if (!response.ok) {
      throw new Error("Error al obtener pedido externo");
    }
    return await response.json();
  } catch (error) {
    console.error("❌ Error en fetchPedidoExterno:", error);
    return null;
  }
};

export const guardarPedidoExterno = async (data) => {
  try {
    // Si ya existe shopify_order_id, usa PUT; si no, POST
    const url = data.shopify_order_id
      ? `${API_BASE_URL}/pedido-externo/${data.shopify_order_id}`
      : `${API_BASE_URL}/pedido-externo`;

    const method = data.shopify_order_id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al guardar pedido externo");
    }
    return await response.json();
  } catch (error) {
    console.error("❌ Error en guardarPedidoExterno:", error);
    throw error;
  }
};

export const guardarPedidoExternoEnvio = async (data) => {
  try {
    // Siempre incluye shopify_order_id para updateOrCreate
    const url = data.shopify_order_id
      ? `${API_BASE_URL}/pedido-externo-envio/${data.shopify_order_id}`
      : `${API_BASE_URL}/pedido-externo-envio`;

    const method = data.shopify_order_id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al guardar envío externo");
    }
    return await response.json();
  } catch (error) {
    console.error("❌ Error en guardarPedidoExternoEnvio:", error);
    throw error;
  }
};




export const fetchVentasPedidosAsignados = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/seguimiento-pedido/vendedores`, {
      headers: {
        'Content-Type': 'application/json',
        // Agrega autenticación si es necesario, e.g., 'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener pedidos de ventas: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('❌ Error en fetchVentasPedidosAsignados:', error);
    return [];
  }
};

export const fetchAlmacenPedidosAsignados = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/seguimiento-pedido/almacen`, {
      headers: {
        'Content-Type': 'application/json',
        // Agrega autenticación si es necesario, e.g., 'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener pedidos de almacén: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 Respuesta de fetchAlmacenPedidosAsignados:', data);
    return Array.isArray(data.data) ? data.data.map(item => ({
      shopify_order_id: item.shopify_order_id,
      responsable_almacen: item.responsable || null
    })) : [];
  } catch (error) {
    console.error('❌ Error en fetchAlmacenPedidosAsignados:', error);
    return [];
  }
};

export const fetchDeliveryPedidosAsignados = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/seguimiento-pedido/delivery`, {
      headers: {
        'Content-Type': 'application/json',
        // Agrega autenticación si es necesario, e.g., 'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener pedidos de delivery: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📥 Respuesta de fetchDeliveryPedidosAsignados:', data);
    return Array.isArray(data.data) ? data.data.map(item => ({
      shopify_order_id: item.shopify_order_id,
      responsable_delivery: item.responsable || null
    })) : [];
  } catch (error) {
    console.error('❌ Error en fetchDeliveryPedidosAsignados:', error.message, error);
    return [];
  }
};

export const createSeguimiento = async (seguimientoData) => {
  console.log('🚀 ENTRANDO EN createSeguimiento'); // Log inicial

  try {
    console.log('📤 URL:', `${API_BASE_URL}/seguimiento-pedido`);
    console.log('📦 Datos:', JSON.stringify(seguimientoData, null, 2));

    const response = await fetch(`${API_BASE_URL}/seguimiento-pedido`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seguimientoData),
    });
    console.log('📬 Fetch ejecutado');

    const responseBody = await response.json().catch(() => ({}));
    console.log('📥 Respuesta:', { status: response.status, body: responseBody });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${responseBody.message || 'Desconocido'}`);
    }

    return responseBody;
  } catch (error) {
    console.error('❌ Error en createSeguimiento:', error.message);
    throw error;
  }
};

// Obtener todos los usuarios con sus roles
export const fetchUsuarios = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("No token found");
      return null;
    }

    const response = await axios.get(`${API_BASE_URL}/usuarios`, {
      headers: {
        Authorization: `Bearer ${token}`, // ← EXACTO PARA MIDDLEWARE
        Accept: "application/json",
      },
    });

    console.log("fetchUsuarios response:", response.data);
    return response.data; // ← MISMO QUE ORIGINAL
  } catch (error) {
    console.error('❌ Error en fetchUsuarios:', error.response?.data || error.message);
    return null;
  }
};

// Obtener usuarios con rol "vendedor"
export const fetchVendedores = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("No token found");
      return [];
    }

    const response = await axios.get(`${API_BASE_URL}/usuarios/vendedores`, {
      headers: {
        Authorization: `Bearer ${token}`, // ← EXACTO PARA MIDDLEWARE
        Accept: "application/json",
      },
    });

    console.log("fetchVendedores response:", response.data);
    const data = response.data;
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('❌ Error en fetchVendedores:', error.response?.data || error.message);
    return [];
  }
};

// Obtener usuarios con rol "almacen"
export const fetchAlmacen = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("No token found");
      return null;
    }

    const response = await axios.get(`${API_BASE_URL}/usuarios/almacen`, {
      headers: {
        Authorization: `Bearer ${token}`, // ← EXACTO PARA MIDDLEWARE
        Accept: "application/json",
      },
    });

    console.log("fetchAlmacen response:", response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en fetchAlmacen:', error.response?.data || error.message);
    return null;
  }
};

// Obtener usuarios con rol "delivery"
export const fetchDelivery = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("No token found");
      return [];
    }

    const response = await axios.get(`${API_BASE_URL}/usuarios/delivery`, {
      headers: {
        Authorization: `Bearer ${token}`, // ← EXACTO PARA MIDDLEWARE
        Accept: "application/json",
      },
    });

    console.log("fetchDelivery response:", response.data);
    const data = response.data;
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('❌ Error en fetchDelivery:', error.response?.data || error.message);
    // Manejo de errores 401 del middleware
    if (error.response?.status === 401) {
      Swal.fire('Sesión expirada', 'Por favor, inicia sesión nuevamente.', 'warning');
      localStorage.removeItem("authToken");
      window.location.href = '/login';
    }
    Swal.fire('Error', 'No se pudo cargar la lista de usuarios de delivery.', 'error');
    return [];
  }
};

export const fetchSeguimientoVentas = async () => {
  console.log('🚀 ENTRANDO EN fetchSeguimientoVentas');
  try {
    const response = await fetch(`${API_BASE_URL}/seguimiento-pedido/vendedores`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('📬 Fetch ejecutado para seguimiento de ventas');

    const responseBody = await response.json();
    console.log('📥 Respuesta:', { status: response.status, body: responseBody });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${responseBody.message || 'Desconocido'}`);
    }

    return responseBody.data || [];
  } catch (error) {
    console.error('❌ Error en fetchSeguimientoVentas:', error.message);
    throw error;
  }
};

export const fetchSeguimientoAlmacen = async () => {
  console.log('🚀 ENTRANDO EN fetchSeguimientoAlmacen');
  try {
    const response = await fetch(`${API_BASE_URL}/seguimiento-pedido/almacen`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('📬 Fetch ejecutado para seguimiento de almacén');

    const responseBody = await response.json();
    console.log('📥 Respuesta:', { status: response.status, body: responseBody });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${responseBody.message || 'Desconocido'}`);
    }

    return responseBody.data || [];
  } catch (error) {
    console.error('❌ Error en fetchSeguimientoAlmacen:', error.message);
    throw error;
  }
};

export const fetchSeguimientoDelivery = async () => {
  console.log('🚀 ENTRANDO EN fetchSeguimientoDelivery');
  try {
    const response = await fetch(`${API_BASE_URL}/seguimiento-pedido/delivery`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('📬 Fetch ejecutado para seguimiento de delivery');

    const responseBody = await response.json();
    console.log('📥 Respuesta:', { status: response.status, body: responseBody });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${responseBody.message || 'Desconocido'}`);
    }

    return responseBody.data || [];
  } catch (error) {
    console.error('❌ Error en fetchSeguimientoDelivery:', error.message);
    throw error;
  }
};

export default {
  getShopInfo,
  fetchOrders,
  getOrderById,
  getProducts
};