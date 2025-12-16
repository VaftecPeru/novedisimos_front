import axios from 'axios';
import Swal from 'sweetalert2';

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const CUSTOM_API_BASE_URL = isDevelopment
  ? 'http://localhost:8000/api'
  : 'https://psicologosenlima.com/shopify/public/api';

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
    // Convertir la contraseña a UTF-8 antes de enviar
    const payload = {
      correo: credentials.correo,
      contraseña: unescape(encodeURIComponent(credentials.contraseña))
    };

    const response = await axios.post(`${API_BASE_URL}/login`, payload, {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    });

    const userData = response.data.data;

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
    console.error("Error en login:", error.response?.data || error.message);
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
    return Array.isArray(data.data) ? data.data : [];
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
}; //Usar

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
    const data = response.data;
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('❌ Error en fetchAlmacen:', error.response?.data || error.message);
    return null;
  }
}; //Usar

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


// Función para obtener usuarios
export const cargarUsuarios = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.message && Array.isArray(result.data)) {
      return result.data.map(user => ({
        id: user.id,
        nombre: user.nombre_completo,
        correo: user.correo,
        rol: user.rol.nombre,
        estado: user.estado === 1
      }));
    } else {
      throw new Error('Formato de respuesta inesperado');
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    throw error;
  }
};

// === CREAR USUARIO ===
export const crearUsuario = async (data) => {
  const response = await fetch(`${API_BASE_URL}/usuarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nombre_completo: data.nombre,
      correo: data.correo,
      contraseña: data.contraseña,
      rol_id: rolToId(data.rol),
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Error al crear usuario');
  }
  return response.json();
};

// === ACTUALIZAR USUARIO ===
export const actualizarUsuario = async (id, data) => {
  const payload = {};
  if (data.nombre) payload.nombre_completo = data.nombre;
  if (data.correo) payload.correo = data.correo;
  if (data.rol) payload.rol_id = rolToId(data.rol);
  if (data.contraseña) payload.contraseña = data.contraseña;

  const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Error al actualizar');
  }
  return response.json();
};

// === ELIMINAR USUARIO ===
export const eliminarUsuario = async (id) => {
  const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Error al eliminar');
  return response.json();
};

// === RESTABLECER CONTRASEÑA ===
export const restablecerContraseña = async (correo, nuevaContraseña) => {
  const response = await fetch(`${API_BASE_URL}/usuarios/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      correo,
      nueva_contraseña: nuevaContraseña,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Error al cambiar contraseña');
  }
  return response.json();
};

// === MAPEO DE ROL A ID ===
const rolToId = (rolNombre) => {
  const roles = {
    'Administrador': 1,
    'Vendedor': 2,
    'Almacen': 3,
    'Delivery': 4,
  };
  return roles[rolNombre] || 2;
};

// AÑADE ESTO AL FINAL DE TU shopifyService.js

export const fetchComisiones = async () => {
  const res = await fetch(`${API_BASE_URL}/comision-ventas`);
  if (!res.ok) throw new Error('Error al cargar comisiones');
  return res.json();
};

export const getComisionByUser = async (userId) => {
  const res = await fetch(`${API_BASE_URL}/comision-ventas/user/${userId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Error al verificar comisión');
  return res.json();
};

export const crearComision = async (data) => {
  const res = await fetch(`${API_BASE_URL}/comision-ventas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al crear');
  }
  return res.json();
};

export const actualizarComision = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/comision-ventas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al actualizar');
  }
  return res.json();
};

// === NUEVAS FUNCIONES ===
export const listarSeguimientosVendedores = async () => {
  const res = await axios.get(`${API_BASE_URL}/seguimiento-pedido/vendedores`);
  return res.data.data || [];
};

export const listarComisionesVentas = async () => {
  const res = await axios.get(`${API_BASE_URL}/comision-ventas`);
  return res.data || [];
};

export const listarPedidosDelivery = async (page = 1, limit = 25) => {
  const res = await axios.get(`${API_BASE_URL}/shopify/orders?page=${page}&limit=${limit}`);
  return {
    orders: res.data.orders || [],
    total: res.data.total || 0,
  };
};

export const fetchProductos = async (params = {}) => {
  const queryString = new URLSearchParams({
    limit: 250,
    ...params,
  }).toString();

  const url = `${API_BASE_URL}/shopify/products?${queryString}`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.details || "Error desconocido"
      );
    }

    const result = await response.json();
    return {
      productos: result.data ?? result ?? [],
    };
  } catch (error) {
    console.error("Error en fetchProductos:", error.message);
    throw error;
  }
};

/**
 * Obtiene las ubicaciones de Shopify.
 */
export async function getLocations() {
  const res = await fetch(`${API_BASE_URL}/shopify/location`);
  const data = await res.json();
  return data;
}

export async function getInventoryLocation(inventoryItemId) {
  const res = await fetch(`${API_BASE_URL}/inventory-levels/${inventoryItemId}`);
  const data = await res.json();
  return data;
}

/**
 * Actualiza un producto en Shopify (usa FormData).
 */
export async function updateProduct(productId, formData) {
  const res = await fetch(`${API_BASE_URL}/shopify/productos/${productId}`, {
    method: "POST",
    body: formData,
  });
  const result = await res.json();
  return result;
}


/**
 * Crea un nuevo producto en Shopify.
 * @param {FormData} formData - Los datos del producto.
 */
export async function createProduct(formData) {
  const res = await fetch(`${API_BASE_URL}/shopify/product`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return data;
}

/**
 * Elimina un producto en Shopify por ID.
 * @param {number|string} productId
 */
export async function deleteProduct(productId) {
  const res = await fetch(`${API_BASE_URL}/shopify/products/${productId}`, {
    method: "DELETE",
  });

  const data = await res.json();
  return data;
}

export async function fetchProductosConMedia() {

  const url = `${API_BASE_URL}/shopify/productos/media`;
  const res = await fetch(url);
  const data = await res.json();

  return data.productos || [];
}
export const deleteProductMediaService = async (productId, mediaId) => {
  if (!productId || !mediaId) {
    console.error("deleteProductMediaService: Faltan productId o mediaId");
    return { success: false, error: "Faltan productId o mediaId" };
  }

  // Conversión a GID dentro de la función
  const productGid = `gid://shopify/Product/${productId}`;

  console.log("deleteProductMediaService", { productGid, mediaId, API_BASE_URL });

  try {
    const res = await fetch(`${API_BASE_URL}/delete-product-media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productGid, media_id: mediaId }),
    });

    if (!res.ok) {
      console.error("deleteProductMediaService HTTP error:", res.status, res.statusText);
      return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }

    const data = await res.json();
    console.log("deleteProductMediaService response:", data);
    return data;
  } catch (err) {
    console.error("Error en deleteProductMediaService (network?):", err);
    return { success: false, error: err.message };
  }
};

export const setMediaAsFirstService = async (productId, mediaId) => {
  if (!productId || !mediaId) {
    console.error("setMediaAsFirstService: Faltan productId o mediaId");
    return { success: false, error: "Faltan productId o mediaId" };
  }

  // Conversión a GID dentro de la función
  const productGid = `gid://shopify/Product/${productId}`;

  console.log("setMediaAsFirstService", { productGid, mediaId, API_BASE_URL });

  try {
    const res = await fetch(`${API_BASE_URL}/set-media-as-first`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productGid, media_id: mediaId }),
    });

    if (!res.ok) {
      console.error("setMediaAsFirstService HTTP error:", res.status, res.statusText);
      return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }

    const data = await res.json();
    console.log("setMediaAsFirstService response:", data);
    return data;
  } catch (err) {
    console.error("Error en setMediaAsFirstService (network?):", err);
    return { success: false, error: err.message };
  }
};

export async function obtenerColecciones() {
  try {
    const response = await fetch(`${API_BASE_URL}/collections`);
    if (!response.ok) throw new Error("Error al cargar colecciones");

    const data = await response.json();
    return data.collections || {};
  } catch (error) {
    console.error("❌ Error obteniendo colecciones:", error);
    throw error;
  }
}

export async function obtenerCountColeccion(id) {
  const response = await fetch(`${API_BASE_URL}/collections/${id}/count`);
  const data = await response.json();
  return data.count || 0;
}

export async function createCollection(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/collections`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Error creando colección");
    }

    const data = await response.json();
    // Verificar si hay imagen subida
    if (data.collection?.image?.src) {
      console.log("Imagen subida correctamente:", data.collection.image.src);
    }

    return data;
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function fetchProductsMedia() {
  try {
    const response = await fetch(`${API_BASE_URL}/shopify/productos/media/first`);
    if (!response.ok) throw new Error("Error al obtener los productos");

    const data = await response.json();

    // Si tu backend devuelve: { success: true, total: N, productos: [...] }
    const productsArray = Array.isArray(data.productos) ? data.productos : [];

    return productsArray.map((product) => {
      // product.media es un array de medias con distintos __typename
      let imageUrl = "/images/default-image.png";

      if (Array.isArray(product.media) && product.media.length > 0) {
        // Buscar la primera media con URL válida según tipología
        for (const m of product.media) {
          if (!m) continue;
          if (m.__typename === "MediaImage" && m.image && m.image.url) {
            imageUrl = m.image.url;
            break;
          }
          if (m.__typename === "Video" && m.preview && m.preview.image && m.preview.image.url) {
            imageUrl = m.preview.image.url;
            break;
          }
          if (m.__typename === "ExternalVideo" && m.preview && m.preview.image && m.preview.image.url) {
            imageUrl = m.preview.image.url;
            break;
          }
          // Model3d también puede tener preview.image.url si lo agregas en backend
          if (m.preview && m.preview.image && m.preview.image.url) {
            imageUrl = m.preview.image.url;
            break;
          }
        }
      }

      return {
        id: product.id, // ya viene como number desde backend
        title: product.title,
        image: imageUrl,
        productType: product.productType || "Sin categoría", // Añadido productType, con fallback si falta
      };
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function fetchVariantesMedia() {
  try {
    const response = await fetch(`${API_BASE_URL}/shopify/variantes/media/first`);
    if (!response.ok) throw new Error("Error al obtener los productos");

    const data = await response.json();

    // Si la API falla o no hay productos, devolvemos array vacío
    if (!data.success || !data.productos) return [];

    const getImageFromMedia = (mediaArray) => {
      if (!Array.isArray(mediaArray) || mediaArray.length === 0) return "/images/default-image.png";

      const m = mediaArray[0]; // Tomamos el primer elemento de media
      if (!m) return "/images/default-image.png";

      // Prioridad: Imagen de producto o Preview de Video/3D
      return m.image?.url || m.preview?.image?.url || "/images/default-image.png";
    };

    return data.productos.map((product) => ({
      id: product.id,
      title: product.title,
      productType: product.productType || "Sin categoría",
      image: getImageFromMedia(product.media),
      currency: product.currency, // Ya viene de la API (ej: "PEN")

      variantes: (product.variantes || []).map((v) => ({
        id: v.id,
        title: v.title,
        stock: v.stock,
        price: v.price,                   // "134.00"
        currency: v.currency,             // "PEN"
        priceFormatted: v.price_formatted, // "PEN 134.00" (Usar este para la UI)
        image: v.image?.url || "/images/default-image.png",
      })),
    }));

  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function fetchVariantesMediaSelect(variantIds = []) {
  if (!Array.isArray(variantIds) || variantIds.length === 0) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/shopify/variantes/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantIds }) // Mandamos el array de IDs
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error al obtener las imágenes: ${text}`);
    }

    const data = await response.json();
    if (!data.success || !data.images) return [];

    return data.images.map((v) => ({
      id: v.id,
      image: v.image || "/images/default-image.png"
    }));

  } catch (error) {
    console.error("Error fetching variant images:", error);
    return [];
  }
}

export const obtenerColeccionDetalles = async (id) => {
  if (!id) throw new Error("Se requiere el ID de la colección.");

  const url = `${API_BASE_URL}/collections/${id}`; // Esto apunta a tu endpoint PHP GraphQL

  console.log(`Buscando detalles de colección: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    let errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.error || errorData.message || `Error ${response.status}: Falló al obtener detalles de la colección.`);
  }

  const data = await response.json();

  // Normalizar: asegurarse de que cada producto tenga "image" con url
  if (data.success && data.products) {
    data.products = data.products.map((p) => ({
      ...p,
      image: p.media?.[0]?.__typename === 'MediaImage'
        ? p.media[0].image.url
        : p.media?.[0]?.preview?.image?.url || '/images/default-image.png', // fallback
    }));
  }

  return data;
};

export const actualizarColeccion = async (id, formData) => {
  if (!id) throw new Error("Se requiere el ID de la colección.");

  const url = `${API_BASE_URL}/collections/${id}`;

  // Se añade el campo '_method' para que Laravel sepa que es un PUT.
  if (!formData.has('_method')) {
    formData.append('_method', 'PUT');
  }

  console.log(`Actualizando colección: ${url}`);

  const response = await fetch(url, {
    method: 'POST', // Usar POST para enviar FormData con archivos y el campo _method=PUT
    body: formData,
  });

  if (!response.ok) {
    let errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.error || errorData.message || `Error ${response.status}: Falló al actualizar la colección.`);
  }

  return response.json();
};

export const agregarProductoAcoleccion = async (collectionId, productId) => {
  if (!collectionId || !productId) {
    console.error("Se requiere collectionId y productId");
    return { success: false, error: "Faltan parámetros" };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/collections/${collectionId}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Error desconocido al agregar producto");
    }

    const data = await res.json();
    console.log("Producto agregado a colección:", data);
    return data;
  } catch (error) {
    console.error("Error en addProductToCollection:", error);
    return { success: false, error: error.message };
  }
};

export const eliminarProductoDeColeccion = async (collectionId, productId) => {
  if (!collectionId || !productId) throw new Error("Se requieren el ID de la colección y el ID del producto.");

  const url = `${API_BASE_URL}/collections/${collectionId}/products/${productId}`;

  console.log(`Eliminando producto ${productId} de colección ${collectionId}: ${url}`);

  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    let errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.error || errorData.message || `Error ${response.status}: Falló al eliminar producto.`);
  }

  return { success: true };
};

export const eliminarColeccion = async (collectionId) => {
  if (!collectionId) throw new Error("Se requiere el ID de la colección");

  const url = `${API_BASE_URL}/collections/${collectionId}`;

  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.error?.message || errorData.message || `Error ${response.status}: Falló al eliminar la colección.`);
  }

  return await response.json(); // { success: true, message: "Colección eliminada correctamente" }
};

export async function crearPedido(pedidoData) {
  try {
    const response = await fetch(`${API_BASE_URL}/shopify/crear-pedido`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pedidoData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Error creando pedido");
    }

    const data = await response.json();
    console.log("Pedido creado:", data);

    return data;
  } catch (err) {
    console.error("Error en crearPedido:", err);
    return { ok: false, error: err.message };
  }
}

export const actualizarPedido = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/shopify/actualizar/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error en la actualización: ${response.statusText}`);
  }

  return await response.json();
};

export const cancelarPedido = async (id) => {
  const response = await fetch(`${API_BASE_URL}/shopify/cancelar/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error al cancelar el pedido: ${response.statusText}`);
  }

  return await response.json();
};

export default {
  getShopInfo,
  fetchOrders,
  getOrderById,
  getProducts
};