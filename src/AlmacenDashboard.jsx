import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, InputAdornment, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, FormControl, Select, MenuItem,
  IconButton, Typography, Chip, Drawer, Divider, Radio, RadioGroup, FormControlLabel, Menu
} from '@mui/material';

import { Search, WhatsApp, FilterList, MusicNote, Instagram, Close, Add, Save, Refresh } from '@mui/icons-material';
import './PedidosDashboard.css';
import { fetchOrders, listarNotificacionesAlmacen, actualizarEstadoPreparacion } from './components/services/shopifyService';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useConfirmDialog } from './components/Modals/useConfirmDialog'; 

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getNoteAttributeValue = (order, attributeName) => {
  if (!order.note_attributes) return 'No disponible';
  const attribute = order.note_attributes.find(attr => attr.name === attributeName);
  return attribute ? attribute.value : 'No disponible';
};

const mapShopifyStatus = (order) => {
  if (order.cancelled_at) return 'CANCELADO';
  if (order.financial_status === 'paid') return 'CONFIRMADO';
  if (order.financial_status === 'pending') return 'PENDIENTE';
  return 'PENDIENTE';
};

const mapAlmacenStatus = (order) => {
  // Solo estos 4 estados
  if (order.cancelled_at) return 'Cancelado';
  if (order.fulfillment_status === 'fulfilled') return 'Despachado';
  if (order.tags && order.tags.includes('listo-despacho')) return 'Listo para despacho';
  return 'Pendiente';
};

const getInventoryStatus = (order) => {
  if (order.cancelled_at) return 'ANULADO';
  if (order.fulfillment_status === 'fulfilled') return 'DESPACHADO';
  if (order.fulfillment_status === 'partial') return 'PREPARANDO';
  if (order.fulfillment_status === 'shipped') return 'PREPARANDO';
  if (order.tags && order.tags.includes('inventario-verificado')) return 'VERIFICADO';
  if (order.tags && order.tags.includes('preparando-stock')) return 'PREPARANDO';
  if (order.financial_status === 'paid') return 'DISPONIBLE';
  return 'PENDIENTE_STOCK';
};
const getOpcionesEstado = (estadoActual) => {
  switch (estadoActual) {
    case "Pendiente":
      return ["Pendiente", "Listo para despacho", "Despachado", "Cancelado"];
    case "Listo para despacho":
      return ["Listo para despacho", "Despachado", "Cancelado"];
    case "Despachado":
      return ["Despachado", "Cancelado"];
    case "Cancelado":
      return ["Cancelado"];
    default:
      return ["Pendiente", "Listo para despacho", "Despachado", "Cancelado"];
  }
};

const getLocationFromOrder = (order) => {
  const provincia = getNoteAttributeValue(order, 'Provincia y Distrito:');
  const direccion = getNoteAttributeValue(order, 'Dirección');

  if (provincia !== 'No disponible') {
    return provincia;
  }

  if (order.shipping_address) {
    return `${order.shipping_address.city || ''} - ${order.shipping_address.province || ''}`.trim();
  }

  return direccion !== 'No disponible' ? direccion : 'Sin ubicación';
};

const getAlmacenFromLocation = (location) => {
  if (!location || location === 'Sin ubicación') return 'TODOS';

  const locationLower = location.toLowerCase();
  if (locationLower.includes('lima') || locationLower.includes('callao')) {
    return 'LIMA';
  }
  return 'PROVINCIA';
};

const EstadoAlmacenChip = ({ estado, estadoAdicional, inventario, pedidoId, onInventarioChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const estadoInventarioActual = estadosInventario.find(e => e.value === inventario) || estadosInventario[0];

  const colorMap = {
    'INGRESADO': '#3884f7',
    'EN_ALMACEN': '#10b981',
    'PARCIAL': '#f59e0b',
    'DESPACHADO': '#8b5cf6',
    'default': '#4763e4'
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEstadoSelect = (nuevoEstado) => {
    if (onInventarioChange) {
      onInventarioChange(pedidoId, nuevoEstado);
    }
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Chip
        label={estado}
        sx={{ bgcolor: '#4763e4', color: 'white', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}
      />
      {estadoAdicional && (
        <Chip
          label={estadoAdicional}
          sx={{ bgcolor: colorMap[estadoAdicional] || colorMap.default, color: 'white', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}
        />
      )}
      <Chip
        label={estadoInventarioActual.label}
        onClick={handleClick}
        sx={{
          bgcolor: estadoInventarioActual.color,
          color: 'white',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 }
        }}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {estadosInventario.map((estado) => (
          <MenuItem
            key={estado.value}
            onClick={() => handleEstadoSelect(estado.value)}
            sx={{
              color: estado.color,
              fontWeight: inventario === estado.value ? 'bold' : 'normal'
            }}
          >
            {estado.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

const FechaItem = ({ label, fecha }) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <Typography variant="caption" sx={{ color: '#6b7280' }}>{label}:</Typography>
    <Typography variant="caption">{fecha}</Typography>
  </Box>
);

function AlmacenDashboard() {
  const [filtros, setFiltros] = useState({
    estado: 'CONFIRMADO',
    almacen: 'TODOS',
    tipoFecha: 'ingreso',
    fechaInicio: '',
    fechaFin: '',
    searchTerm: '',
    estadoInventario: ''
  });

  const actualizarDatos = () => {
    setLoading(true);
    setError(null);
    fetchOrders()
      .then(response => {
        fetchOrders()
        console.log("Respuesta de fetchOrders:", response);

        let allOrders = [];
        if (response && response.orders) {
          allOrders = response.orders;
        } else if (Array.isArray(response)) {
          allOrders = response;
        }
        // Aquí tu lógica de formatear los pedidos (igual que en tu useEffect inicial)
        const pedidosFormateadosAlmacen = allOrders.map(order => {
          // ... mismo mapeo que usas al inicio ...
        });
        setPedidos(pedidosFormateadosAlmacen);
        setPedidosOriginales(pedidosFormateadosAlmacen);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Error al actualizar pedidos');
        setLoading(false);
      });
  };

  const [anchorElEstado, setAnchorElEstado] = useState({});
  const { confirm } = useConfirmDialog();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pantalla, setPantalla] = useState('panel');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [anchorNotif, setAnchorNotif] = useState(null);



  const estadoInicialAlmacen = {
    numeroOrden: '',
    canal: 'Shopify',
    nota: '',

    cliente: '',
    telefono: '',

    departamento: '',
    provincia: '',
    distrito: '',
    direccion: '',
    referencia: '',
    gps: '',

    productos: [],
    estado: 'CONFIRMADO',
    estadoAlmacen: 'INGRESADO',
    estadoInventario: 'PENDIENTE_STOCK',
    almacenAsignado: 'LIMA',
    ubicacionStock: '',
    observacionesAlmacen: ''
  };

  const [nuevoRegistroAlmacen, setNuevoRegistroAlmacen] = useState(estadoInicialAlmacen);
  const [nuevoProducto, setNuevoProducto] = useState({ descripcion: '', cantidad: 1, precio: '', stock: '' });

  const [pedidos, setPedidos] = useState([]);
  const [pedidosOriginales, setPedidosOriginales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [estadosDisponibles, setEstadosDisponibles] = useState(['TODOS', 'PENDIENTE', 'CONFIRMADO', 'CANCELADO']);
  const [estadosAlmacenDisponibles, setEstadosAlmacenDisponibles] = useState(['INGRESADO', 'EN_ALMACEN', 'PARCIAL', 'DESPACHADO']);
  const [almacenesDisponibles, setAlmacenesDisponibles] = useState(['TODOS', 'LIMA', 'PROVINCIA']);

  const handleFiltroChange = (campo, valor) => {
    setFiltros({ ...filtros, [campo]: valor });
  };

  useEffect(() => {
    const cargar = async () => {
      const data = await listarNotificacionesAlmacen();
      setNotificaciones(data);
    };
    cargar();
  }, []);

  const handleNotifClick = (event) => {
    setAnchorNotif(event.currentTarget);
  };

  const handleNotifClose = () => {
    setAnchorNotif(null);
  };

  useEffect(() => {
    const cargarPedidosAlmacen = async () => {
      try {
        setLoading(true);
        console.log('Cargando pedidos para gestión de almacén...');

        let allOrders = [];
        let hasMore = true;
        let page = 1;
        const limit = 250;

        while (hasMore && page <= 10) {
          try {
            console.log(`Cargando página ${page} de pedidos...`);

            const response = await fetchOrdersWithPagination(page, limit);

            let ordersData = [];
            if (response && response.orders) {
              ordersData = response.orders;
            } else if (Array.isArray(response)) {
              ordersData = response;
            }

            if (ordersData.length === 0) {
              hasMore = false;
            } else {
              allOrders = [...allOrders, ...ordersData];
              hasMore = ordersData.length === limit;
              page++;
            }

            console.log(`Página ${page - 1}: ${ordersData.length} pedidos. Total acumulado: ${allOrders.length}`);

          } catch (pageError) {
            console.error(`Error en página ${page}:`, pageError);
            hasMore = false;
          }
        }

        if (allOrders.length === 0) {
          console.log('Fallback: Cargando con método original...');
          const response = await fetchOrders();

          if (response && response.orders) {
            allOrders = response.orders;
          } else if (Array.isArray(response)) {
            allOrders = response;
          } else {
            console.error('Formato de respuesta no reconocido:', response);
            setError('No se pudo obtener la lista de pedidos. Formato de respuesta inválido.');
            return;
          }
        }

        console.log(`TOTAL DE PEDIDOS CARGADOS PARA ALMACÉN: ${allOrders.length}`);

        const pedidosFormateadosAlmacen = allOrders.map(order => {
          const estado = mapShopifyStatus(order);
          const estadoAlmacen = mapAlmacenStatus(order);
          const inventario = getInventoryStatus(order);
          const ubicacion = getLocationFromOrder(order);
          const almacen = getAlmacenFromLocation(ubicacion);

          return {
            id: order.name || `#${order.order_number}`,
            orderNumber: order.order_number,
            shopifyId: order.id,
            estadoAlmacen: order.estadoAlmacen || "Pendiente",

            cliente: getNoteAttributeValue(order, 'Nombre y Apellidos') !== 'No disponible'
              ? getNoteAttributeValue(order, 'Nombre y Apellidos')
              : (order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : order.email || 'Cliente no registrado'),

            telefono: getNoteAttributeValue(order, 'Celular') !== 'No disponible'
              ? getNoteAttributeValue(order, 'Celular')
              : (order.phone || 'Sin teléfono'),

            ubicacion: ubicacion,
            almacen: almacen,

            estado: estado,
            estadoAlmacen: estadoAlmacen,
            inventario: inventario,

            financial_status: order.financial_status,
            fulfillment_status: order.fulfillment_status,

            productos: order.line_items ? order.line_items.map(item => ({
              nombre: item.name || 'Producto',
              cantidad: item.quantity || 1,
              sku: item.sku || 'Sin SKU',
              precio: `${order.presentment_currency || 'PEN'} ${item.price || '0.00'}`,
              stockDisponible: item.inventory_quantity || 0
            })) : [],

            importes: {
              total: `${order.presentment_currency || 'PEN'} ${order.current_total_price || order.total_price || '0.00'}`,
              subtotal: order.subtotal_price || '0.00',
              currency: order.presentment_currency || order.currency || 'PEN'
            },

            fechas: {
              ingreso: formatDate(order.created_at),
              registro: formatDate(order.processed_at),
              despacho: formatDate(order.shipped_at) || '-',
              entrega: order.fulfilled_at ? formatDate(order.fulfilled_at) :
                (order.fulfillment_status === 'fulfilled' ? formatDate(order.updated_at) : '-')
            },

            medioPago: order.payment_gateway_names ? order.payment_gateway_names.join(', ') : 'No especificado',

            tags: order.tags || '',
            note: order.note || '',

            fechaCreacion: new Date(order.created_at),
            fechaActualizacion: new Date(order.updated_at),

            originalOrder: order
          };
        });

        setPedidos(pedidosFormateadosAlmacen);
        setPedidosOriginales(pedidosFormateadosAlmacen);

        const estadosUnicos = [...new Set(pedidosFormateadosAlmacen.map(p => p.estado))].filter(Boolean);
        const estadosAlmacenUnicos = [...new Set(pedidosFormateadosAlmacen.map(p => p.estadoAlmacen))].filter(Boolean);

        setEstadosDisponibles(estadosUnicos);
        setEstadosAlmacenDisponibles(estadosAlmacenUnicos);

        console.log('✅ Pedidos procesados para almacén exitosamente:', pedidosFormateadosAlmacen.length);
        console.log('📊 Estados disponibles:', estadosUnicos);
        console.log('🏪 Estados de almacén disponibles:', estadosAlmacenUnicos);

      } catch (err) {
        console.error('❌ Error al cargar pedidos para almacén:', err);
        setError(err.message || 'Error al cargar pedidos');
      } finally {
        setLoading(false);
      }
    };

    cargarPedidosAlmacen();
  }, []);

  const fetchOrdersWithPagination = async (page = 1, limit = 250) => {
    try {
      const API_BASE_URL = 'https://api.novedadeswow.com';

      const urls = [
        `${API_BASE_URL}/orders?limit=${limit}&page=${page}`,
        `${API_BASE_URL}/orders?limit=${limit}&page_info=${page}`,
        `${API_BASE_URL}/orders?per_page=${limit}&page=${page}`,
        `${API_BASE_URL}/orders`
      ];

      for (const url of urls) {
        try {
          console.log(`Intentando URL: ${url}`);
          const response = await fetch(url);
          const data = await response.json();
          if (data) {
            return data;
          }
        } catch (urlError) {
          console.warn(`Error con URL ${url}:`, urlError.message);
        }
      }

      throw new Error('No se pudo cargar con ninguna URL de paginación');
    } catch (error) {
      console.error('Error en fetchOrdersWithPagination:', error);
      throw error;
    }
  };

  const handleFormChange = (e) => {
    setNuevoRegistroAlmacen({ ...nuevoRegistroAlmacen, [e.target.name]: e.target.value });
  };

  const handleInventarioChange = (pedidoId, nuevoEstado) => {
    console.log(`Cambiando estado de inventario de ${pedidoId} a ${nuevoEstado}`);

    setPedidos(prev => prev.map(pedido =>
      pedido.id === pedidoId
        ? { ...pedido, inventario: nuevoEstado }
        : pedido
    ));

    setPedidosOriginales(prev => prev.map(pedido =>
      pedido.id === pedidoId
        ? { ...pedido, inventario: nuevoEstado }
        : pedido
    ));
  };

  const handleProductoChange = (e) => {
    setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.value });
  };

  const agregarProducto = () => {
    if (nuevoProducto.descripcion && nuevoProducto.precio) {
      setNuevoRegistroAlmacen({
        ...nuevoRegistroAlmacen,
        productos: [...nuevoRegistroAlmacen.productos, {
          descripcion: `${nuevoProducto.cantidad} ${nuevoProducto.descripcion}`,
          valor: `S/ ${nuevoProducto.precio}`,
          stock: nuevoProducto.stock || '0'
        }]
      });
      setNuevoProducto({ descripcion: '', cantidad: 1, precio: '', stock: '' });
    }
  };

  const guardarRegistroAlmacen = () => {
    setDrawerOpen(false);
    setNuevoRegistroAlmacen(estadoInicialAlmacen);
  };

  const pedidosFiltrados = pedidosOriginales.filter(pedido => {
    const { estado, almacen, fechaInicio, fechaFin, searchTerm, tipoFecha, estadoInventario } = filtros;

    if (estado && estado !== '' && pedido.estado !== estado) return false;
    if (almacen && almacen !== 'TODOS' && pedido.almacen !== almacen) return false;
    if (estadoInventario && estadoInventario !== '' && pedido.inventario !== estadoInventario) return false;

    if (fechaInicio || fechaFin) {
      let fechaComparar = null;

      switch (tipoFecha) {
        case 'ingreso':
          fechaComparar = pedido.originalOrder.created_at;
          break;
        case 'registro':
          fechaComparar = pedido.originalOrder.processed_at || pedido.originalOrder.created_at;
          break;
        case 'despacho':
          fechaComparar = pedido.originalOrder.shipped_at;
          if (!fechaComparar) return false;
          break;
        case 'entrega':
          fechaComparar = pedido.originalOrder.fulfilled_at;
          if (!fechaComparar && pedido.originalOrder.fulfillment_status === 'fulfilled') {
            fechaComparar = pedido.originalOrder.updated_at;
          }
          if (!fechaComparar) return false;
          break;
        default:
          fechaComparar = pedido.originalOrder.created_at;
      }

      if (!fechaComparar) return false;

      const fechaPedido = new Date(fechaComparar);
      const fechaPedidoSoloFecha = new Date(fechaPedido.getFullYear(), fechaPedido.getMonth(), fechaPedido.getDate());

      if (fechaInicio) {
        const fechaInicioComparar = new Date(fechaInicio);
        if (fechaPedidoSoloFecha < fechaInicioComparar) return false;
      }

      if (fechaFin) {
        const fechaFinComparar = new Date(fechaFin);
        if (fechaPedidoSoloFecha > fechaFinComparar) return false;
      }
    }

    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesCliente = pedido.cliente && pedido.cliente.toLowerCase().includes(searchLower);
      const matchesId = pedido.id && pedido.id.toLowerCase().includes(searchLower);
      const matchesTelefono = pedido.telefono && pedido.telefono.toLowerCase().includes(searchLower);
      const matchesUbicacion = pedido.ubicacion && pedido.ubicacion.toLowerCase().includes(searchLower);
      const matchesNote = pedido.note && pedido.note.toLowerCase().includes(searchLower);
      const matchesTags = pedido.tags && pedido.tags.toLowerCase().includes(searchLower);

      if (!matchesCliente && !matchesId && !matchesTelefono && !matchesUbicacion && !matchesNote && !matchesTags) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Cargando gestión de almacén...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">Error al cargar gestión de almacén</Typography>
        <Typography variant="body1">{error}</Typography>
        <Typography variant="body2">Verifique que el servidor backend esté en ejecución y que las credenciales de Shopify sean correctas.</Typography>
      </Box>
    );
  }

  const mostrarColumnaAcciones = pedidosFiltrados.some(
  pedido => ["Listo para despacho", "Despachado", "Cancelado"].includes(pedido.estadoAlmacen)
);

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: "#f9fafb",
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        overflowX: "auto",
      }}
    >
      {pantalla === "panel" && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Gestión de Almacén
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <IconButton color="primary" onClick={handleNotifClick}>
                <Badge
                  badgeContent={notificaciones.filter((n) => !n.leido).length}
                  color="error"
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Box>
          </Box>
          {/* Menú de notificaciones */}
          <Menu
            anchorEl={anchorNotif}
            open={Boolean(anchorNotif)}
            onClose={handleNotifClose}
            PaperProps={{
              sx: { minWidth: 320, maxHeight: 400 },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Notificaciones recientes
              </Typography>
            </Box>
            <Divider />
            {notificaciones.length === 0 && (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  No hay notificaciones
                </Typography>
              </MenuItem>
            )}
            {notificaciones.map((n) => (
              <MenuItem
                key={n.id}
                sx={{
                  bgcolor: n.leido ? "#f5f5f5" : "#fffbe6",
                  whiteSpace: "normal",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography variant="body2">{n.mensaje}</Typography>
                  <Typography variant="caption" sx={{ color: "#888" }}>
                    {new Date(n.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              sx={{
                bgcolor: "#4f46e5",
                borderRadius: "20px",
                "&:hover": { bgcolor: "#4338ca" },
              }}
              onClick={() => setDrawerOpen(true)}
              startIcon={<Add />}
            >
              Nuevo Registro
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              sx={{
                textTransform: "none", // minúsculas, no mayúsculas
                color: "#10b981", // verde esmeralda (tailwind emerald-500)
                borderColor: "#10b981",
                borderRadius: "20px",
                fontWeight: 600,
                fontSize: "0.95rem",
                px: 2.5,
                py: 0.75,
                minWidth: 0,
                minHeight: 0,
                boxShadow: "none",
                letterSpacing: 0.2,
                bgcolor: "transparent",
                "&:hover": {
                  bgcolor: "#e7f9f4",
                  color: "#059669",
                  borderColor: "#059669",
                },
              }}
              onClick={actualizarDatos}
            >
              actualizar
            </Button>

            <TextField
              placeholder="Buscar por cliente, pedido, teléfono o ubicación..."
              variant="outlined"
              size="small"
              value={filtros.searchTerm}
              onChange={(e) => handleFiltroChange("searchTerm", e.target.value)}
              sx={{ minWidth: 250, bgcolor: "white" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 150, bgcolor: "white" }}>
              <Select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange("estado", e.target.value)}
                displayEmpty
                renderValue={(selected) => selected || "Estados"}
                sx={{ height: 40 }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                {estadosDisponibles.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150, bgcolor: "white" }}>
              <Select
                value={filtros.almacen}
                onChange={(e) => handleFiltroChange("almacen", e.target.value)}
                displayEmpty
                renderValue={(selected) => selected || "Almacenes"}
                sx={{ height: 40 }}
              >
                {almacenesDisponibles.map((almacen) => (
                  <MenuItem key={almacen} value={almacen}>
                    {almacen}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150, bgcolor: "white" }}>
              <Select
                value={filtros.estadoInventario}
                onChange={(e) =>
                  handleFiltroChange("estadoInventario", e.target.value)
                }
                displayEmpty
                renderValue={(selected) => selected || "Estado Inventario"}
                sx={{ height: 40 }}
              >
                <MenuItem value="">Todos inventarios</MenuItem>
                <MenuItem value="PENDIENTE_STOCK">Pendiente Stock</MenuItem>
                <MenuItem value="DISPONIBLE">Disponible</MenuItem>
                <MenuItem value="VERIFICADO">Verificado</MenuItem>
                <MenuItem value="PREPARANDO">Preparando</MenuItem>
                <MenuItem value="DESPACHADO">Despachado</MenuItem>
                <MenuItem value="ANULADO">Anulado</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                Filtrar por:
              </Typography>
              <FormControl
                size="small"
                sx={{ minWidth: 140, bgcolor: "white" }}
              >
                <Select
                  value={filtros.tipoFecha}
                  onChange={(e) =>
                    handleFiltroChange("tipoFecha", e.target.value)
                  }
                  sx={{ height: 40 }}
                >
                  <MenuItem value="ingreso">Fecha Ingreso</MenuItem>
                  <MenuItem value="registro">Fecha Registro</MenuItem>
                  <MenuItem value="despacho">Fecha Despacho</MenuItem>
                  <MenuItem value="entrega">Fecha Entrega</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Desde"
                type="date"
                size="small"
                value={filtros.fechaInicio}
                onChange={(e) =>
                  handleFiltroChange("fechaInicio", e.target.value)
                }
                sx={{ width: 160, bgcolor: "white" }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Hasta"
                type="date"
                size="small"
                value={filtros.fechaFin}
                onChange={(e) => handleFiltroChange("fechaFin", e.target.value)}
                sx={{ width: 160, bgcolor: "white" }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton color="primary">
                <FilterList />
              </IconButton>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                {pedidosFiltrados.length} de {pedidosOriginales.length}{" "}
                registros
              </Typography>
            </Box>
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              maxHeight: "calc(100vh - 300px)",
              overflowY: "auto",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "#f8fafc",
                      minWidth: 120,
                    }}
                  >
                    Orden
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "#f8fafc",
                      minWidth: 200,
                    }}
                  >
                    Cliente
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "#f8fafc",
                      minWidth: 150,
                    }}
                  >
                    Teléfono
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "#f8fafc",
                      minWidth: 200,
                    }}
                  >
                    Ubicación
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "#f8fafc",
                      minWidth: 120,
                    }}
                  >
                    Almacén
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "#f8fafc",
                      minWidth: 180,
                    }}
                  >
                    Estados
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "#f8fafc",
                      minWidth: 200,
                    }}
                  >
                    Productos
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "#f8fafc",
                      minWidth: 120,
                    }}
                  >
                    Total
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "#f8fafc",
                      minWidth: 200,
                    }}
                  >
                    Fechas
                  </TableCell>
                  {mostrarColumnaAcciones && (
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        bgcolor: "#f8fafc",
                        minWidth: 150,
                      }}
                    >
                      Acciones
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {pedidosFiltrados.map((pedido, index) => (
                  <TableRow
                    key={pedido.id || index}
                    sx={{
                      "&:hover": { bgcolor: "#f8fafc" },
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid #e2e8f0",
                      },
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold", color: "#1e40af" }}
                      >
                        {pedido.id}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {pedido.cliente}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body2">
                          {pedido.telefono}
                        </Typography>
                        {pedido.telefono &&
                          pedido.telefono !== "Sin teléfono" && (
                            <IconButton size="small" color="success">
                              <WhatsApp fontSize="small" />
                            </IconButton>
                          )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {pedido.ubicacion}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={pedido.almacen}
                        sx={{
                          bgcolor:
                            pedido.almacen === "LIMA" ? "#3b82f6" : "#f59e0b",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        endIcon={<ArrowDropDownIcon />}
                        sx={{
                          backgroundColor:
                            pedido.estadoAlmacen === "Pendiente" ||
                            !pedido.estadoAlmacen
                              ? "#f59e0b"
                              : pedido.estadoAlmacen === "Listo para despacho"
                              ? "#4f46e5"
                              : pedido.estadoAlmacen === "Despachado"
                              ? "#059669"
                              : pedido.estadoAlmacen === "Cancelado"
                              ? "#ef4444"
                              : "#b0b0b0",
                          color: "#fff",
                          textTransform: "none",
                          fontWeight: "bold",
                          minWidth: 140,
                        }}
                        onClick={(e) => {
                          setAnchorElEstado({
                            ...anchorElEstado,
                            [pedido.id]: e.currentTarget,
                          });
                        }}
                      >
                        {pedido.estadoAlmacen || "Pendiente"}
                      </Button>
                      <Menu
                        anchorEl={anchorElEstado?.[pedido.id] || null}
                        open={Boolean(anchorElEstado?.[pedido.id])}
                        onClose={() =>
                          setAnchorElEstado({
                            ...anchorElEstado,
                            [pedido.id]: null,
                          })
                        }
                      >
                        {getOpcionesEstado(
                          pedido.estadoAlmacen || "Pendiente"
                        ).map((estado) => (
                          <MenuItem
                            key={estado}
                            selected={
                              estado === (pedido.estadoAlmacen || "Pendiente")
                            }
                            disabled={
                              estado === (pedido.estadoAlmacen || "Pendiente")
                            }
                            onClick={async () => {
                              setAnchorElEstado({
                                ...anchorElEstado,
                                [pedido.id]: null,
                              });
                              const ok = await confirm({
                                title:
                                  "¿Confirmar cambio de estado de almacén?",
                                text: `¿Estás seguro de que deseas marcar este pedido como ${estado}?`,
                                confirmButtonColor: "#4D68E6",
                                confirmButtonText: "Sí, cambiar",
                              });
                               if (!ok) return;
                              const estadoMap = {
                                "Pendiente": "pendiente",
                                "Listo para despacho": "listo_para_despacho",
                                "Cancelado": "cancelado",
                                "Despachado": "despachado",
                              };

                              const estadoNormalizado = estadoMap[estado]; // <-- este es el valor que espera Laravel

                              const res = await actualizarEstadoPreparacion(pedido.shopifyId, { estado: estadoNormalizado });
                              if (res && res.success) {
                                setPedidos((prev) =>
                                  prev.map((p) =>
                                    p.id === pedido.id
                                      ? { ...p, estadoAlmacen: estado }
                                      : p
                                  )
                                );
                                setPedidosOriginales((prev) =>
                                  prev.map((p) =>
                                    p.id === pedido.id
                                      ? { ...p, estadoAlmacen: estado }
                                      : p
                                  )
                                );
                              } else {
                                Swal.fire(
                                  "Error",
                                  "No se pudo actualizar el estado en almacén.",
                                  "error"
                                );
                              }
                            }}
                          >
                            {estado}
                          </MenuItem>
                        ))}
                      </Menu>
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{
                          maxWidth: 180,
                          maxHeight: 100,
                          overflowY: "auto",
                        }}
                      >
                        {pedido.productos.map((producto, idx) => (
                          <Typography
                            key={idx}
                            variant="caption"
                            sx={{ display: "block", mb: 0.5 }}
                          >
                            {producto.cantidad}x {producto.nombre}
                            {producto.sku && ` (${producto.sku})`}
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold", color: "#059669" }}
                      >
                        {pedido.importes.total}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <FechaItem
                          label="Ingreso"
                          fecha={pedido.fechas.ingreso}
                        />
                        <FechaItem
                          label="Registro"
                          fecha={pedido.fechas.registro}
                        />
                        {pedido.fechas.despacho !== "-" && (
                          <FechaItem
                            label="Despacho"
                            fecha={pedido.fechas.despacho}
                          />
                        )}
                        {pedido.fechas.entrega !== "-" && (
                          <FechaItem
                            label="Entrega"
                            fecha={pedido.fechas.entrega}
                          />
                        )}
                      </Box>
                    </TableCell>
                    {mostrarColumnaAcciones && (
                      <TableCell align="right">
                        {[
                          "Listo para despacho",
                          "Despachado",
                          "Cancelado",
                        ].includes(pedido.estadoAlmacen) && (
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              textTransform: "none",
                              color: "#4f46e5",
                              borderColor: "#4f46e5",
                              borderWidth: 2,
                              bgcolor: "transparent",
                              fontWeight: 600,
                              fontSize: "0.92rem",
                              px: 2.5,
                              py: 1,
                              borderRadius: "13px",
                              minWidth: 0,
                              minHeight: 0,
                              boxShadow: "none",
                              letterSpacing: 0.5,
                              "&:hover": {
                                bgcolor: "#eceafe",
                                color: "#4338ca",
                                borderColor: "#4338ca",
                              },
                            }}
                            onClick={() => {
                              setPedidoSeleccionado(pedido);
                              setPantalla("preparacion");
                            }}
                          >
                            Generar guía de despacho
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{ "& .MuiDrawer-paper": { width: 500, p: 3 } }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Nuevo Registro de Almacén
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <Close />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", color: "#374151" }}
              >
                Información del Pedido
              </Typography>

              <TextField
                label="Número de Orden"
                name="numeroOrden"
                value={nuevoRegistroAlmacen.numeroOrden}
                onChange={handleFormChange}
                fullWidth
                size="small"
              />

              <FormControl fullWidth size="small">
                <Select
                  value={nuevoRegistroAlmacen.canal}
                  name="canal"
                  onChange={handleFormChange}
                  displayEmpty
                >
                  <MenuItem value="Shopify">Shopify</MenuItem>
                  <MenuItem value="Manual">Manual</MenuItem>
                  <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Nota del Pedido"
                name="nota"
                value={nuevoRegistroAlmacen.nota}
                onChange={handleFormChange}
                fullWidth
                size="small"
                multiline
                rows={2}
              />

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", color: "#374151" }}
              >
                Información del Cliente
              </Typography>

              <TextField
                label="Cliente"
                name="cliente"
                value={nuevoRegistroAlmacen.cliente}
                onChange={handleFormChange}
                fullWidth
                size="small"
              />

              <TextField
                label="Teléfono"
                name="telefono"
                value={nuevoRegistroAlmacen.telefono}
                onChange={handleFormChange}
                fullWidth
                size="small"
              />

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", color: "#374151" }}
              >
                Ubicación y Almacén
              </Typography>

              <TextField
                label="Departamento"
                name="departamento"
                value={nuevoRegistroAlmacen.departamento}
                onChange={handleFormChange}
                fullWidth
                size="small"
              />

              <TextField
                label="Provincia"
                name="provincia"
                value={nuevoRegistroAlmacen.provincia}
                onChange={handleFormChange}
                fullWidth
                size="small"
              />

              <TextField
                label="Distrito"
                name="distrito"
                value={nuevoRegistroAlmacen.distrito}
                onChange={handleFormChange}
                fullWidth
                size="small"
              />

              <TextField
                label="Dirección"
                name="direccion"
                value={nuevoRegistroAlmacen.direccion}
                onChange={handleFormChange}
                fullWidth
                size="small"
              />

              <TextField
                label="Referencia"
                name="referencia"
                value={nuevoRegistroAlmacen.referencia}
                onChange={handleFormChange}
                fullWidth
                size="small"
              />

              <FormControl fullWidth size="small">
                <Typography variant="body2" sx={{ mb: 1, color: "#374151" }}>
                  Almacén Asignado
                </Typography>
                <Select
                  value={nuevoRegistroAlmacen.almacenAsignado}
                  name="almacenAsignado"
                  onChange={handleFormChange}
                >
                  <MenuItem value="LIMA">LIMA</MenuItem>
                  <MenuItem value="PROVINCIA">PROVINCIA</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Ubicación en Stock"
                name="ubicacionStock"
                value={nuevoRegistroAlmacen.ubicacionStock}
                onChange={handleFormChange}
                fullWidth
                size="small"
                placeholder="Ej: Estante A-12, Zona B, etc."
              />

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", color: "#374151" }}
              >
                Estados del Almacén
              </Typography>

              <FormControl fullWidth size="small">
                <Typography variant="body2" sx={{ mb: 1, color: "#374151" }}>
                  Estado del Pedido
                </Typography>
                <Select
                  value={nuevoRegistroAlmacen.estado}
                  name="estado"
                  onChange={handleFormChange}
                >
                  <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
                  <MenuItem value="CONFIRMADO">CONFIRMADO</MenuItem>
                  <MenuItem value="CANCELADO">CANCELADO</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <Typography variant="body2" sx={{ mb: 1, color: "#374151" }}>
                  Estado en Almacén
                </Typography>
                <Select
                  value={nuevoRegistroAlmacen.estadoAlmacen}
                  name="estadoAlmacen"
                  onChange={handleFormChange}
                >
                  <MenuItem value="INGRESADO">INGRESADO</MenuItem>
                  <MenuItem value="EN_ALMACEN">EN_ALMACEN</MenuItem>
                  <MenuItem value="PARCIAL">PARCIAL</MenuItem>
                  <MenuItem value="DESPACHADO">DESPACHADO</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <Typography variant="body2" sx={{ mb: 1, color: "#374151" }}>
                  Estado de Inventario
                </Typography>
                <Select
                  value={nuevoRegistroAlmacen.estadoInventario}
                  name="estadoInventario"
                  onChange={handleFormChange}
                >
                  <MenuItem value="PENDIENTE_STOCK">Pendiente Stock</MenuItem>
                  <MenuItem value="DISPONIBLE">Disponible</MenuItem>
                  <MenuItem value="VERIFICADO">Verificado</MenuItem>
                  <MenuItem value="PREPARANDO">Preparando</MenuItem>
                  <MenuItem value="DESPACHADO">Despachado</MenuItem>
                  <MenuItem value="ANULADO">Anulado</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Observaciones de Almacén"
                name="observacionesAlmacen"
                value={nuevoRegistroAlmacen.observacionesAlmacen}
                onChange={handleFormChange}
                fullWidth
                size="small"
                multiline
                rows={3}
                placeholder="Comentarios específicos del almacén..."
              />

              <Divider sx={{ my: 2 }} />
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", color: "#374151" }}
              >
                Productos del Pedido
              </Typography>

              <Box sx={{ display: "flex", gap: 1, alignItems: "end" }}>
                <TextField
                  label="Descripción del Producto"
                  name="descripcion"
                  value={nuevoProducto.descripcion}
                  onChange={handleProductoChange}
                  size="small"
                  sx={{ flex: 2 }}
                />
                <TextField
                  label="Cantidad"
                  name="cantidad"
                  type="number"
                  value={nuevoProducto.cantidad}
                  onChange={handleProductoChange}
                  size="small"
                  sx={{ width: 80 }}
                />
                <TextField
                  label="Precio"
                  name="precio"
                  value={nuevoProducto.precio}
                  onChange={handleProductoChange}
                  size="small"
                  sx={{ width: 100 }}
                />
                <TextField
                  label="Stock"
                  name="stock"
                  value={nuevoProducto.stock}
                  onChange={handleProductoChange}
                  size="small"
                  sx={{ width: 80 }}
                  placeholder="0"
                />
                <Button
                  variant="contained"
                  onClick={agregarProducto}
                  sx={{
                    height: 40,
                    bgcolor: "#10b981",
                    "&:hover": { bgcolor: "#059669" },
                  }}
                >
                  <Add />
                </Button>
              </Box>

              {nuevoRegistroAlmacen.productos.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    Productos agregados:
                  </Typography>
                  {nuevoRegistroAlmacen.productos.map((producto, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1,
                        bgcolor: "#f8fafc",
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {producto.descripcion}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          Precio: {producto.valor} | Stock: {producto.stock}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const productosActualizados =
                            nuevoRegistroAlmacen.productos.filter(
                              (_, i) => i !== index
                            );
                          setNuevoRegistroAlmacen({
                            ...nuevoRegistroAlmacen,
                            productos: productosActualizados,
                          });
                        }}
                        sx={{ color: "#ef4444" }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 3,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => {
                    setDrawerOpen(false);
                    setNuevoRegistroAlmacen(estadoInicialAlmacen);
                  }}
                  sx={{ borderColor: "#d1d5db", color: "#374151" }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={guardarRegistroAlmacen}
                  startIcon={<Save />}
                  sx={{
                    bgcolor: "#4f46e5",
                    "&:hover": { bgcolor: "#4338ca" },
                  }}
                >
                  Guardar Registro
                </Button>
              </Box>
            </Box>
          </Drawer>

          {pedidosFiltrados.length === 0 && !loading && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
                bgcolor: "white",
                borderRadius: "12px",
                mt: 2,
              }}
            >
              <Typography variant="h6" sx={{ color: "#6b7280", mb: 1 }}>
                No se encontraron registros
              </Typography>
              <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                Ajusta los filtros para ver más resultados
              </Typography>
            </Box>
          )}
        </>
      )}
      {pantalla === "preparacion" && pedidoSeleccionado && (
        <Box
          sx={{
            maxWidth: 600,
            mx: "auto",
            my: 6,
            bgcolor: "white",
            p: 4,
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Generar Guía de Despacho
            </Typography>
            <IconButton onClick={() => setPantalla("panel")}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {pedidoSeleccionado.id}
              </Typography>
              <Typography variant="body2">
                {pedidoSeleccionado.cliente}
              </Typography>
              <Typography variant="body2">
                {pedidoSeleccionado.ubicacion}
              </Typography>
              <Box sx={{ mt: 2, mb: 2 }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Pedido%20ID%20-%20${pedidoSeleccionado.id}`}
                  alt="QR"
                />
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Detalles
              </Typography>
              {pedidoSeleccionado.productos.map((prod, i) => (
                <Box key={i} sx={{ mb: 1 }}>
                  <Typography variant="body2">{prod.nombre}</Typography>
                  <Typography variant="caption">
                    Cantidad: {prod.cantidad}
                  </Typography>
                </Box>
              ))}
              <Typography variant="body2" sx={{ mt: 1 }}>
                Total: {pedidoSeleccionado.importes.total}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => setPantalla("guia")}
              sx={{ bgcolor: "#2563eb" }}
            >
              Generar Guía de Despacho
            </Button>
            <Button
              variant="outlined"
              onClick={() => setPantalla("confirmacion")}
              sx={{ borderColor: "#10b981", color: "#10b981" }}
            >
              Marcar como Listo para Envío
            </Button>
          </Box>
        </Box>
      )}
      {pantalla === "guia" && pedidoSeleccionado && (
        <Box
          sx={{
            maxWidth: 600,
            mx: "auto",
            my: 6,
            bgcolor: "white",
            p: 4,
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Guía de Despacho - Tienda Virtual
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              <b>{pedidoSeleccionado.id}</b>
            </Typography>
            <Typography variant="body2">
              {pedidoSeleccionado.cliente}
            </Typography>
            <Typography variant="body2">
              {pedidoSeleccionado.ubicacion}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ mt: 2 }}>
            {pedidoSeleccionado.productos.map((prod, i) => (
              <Box
                key={i}
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">{prod.nombre}</Typography>
                <Typography variant="body2">{prod.cantidad}</Typography>
              </Box>
            ))}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2">
            Total: {pedidoSeleccionado.importes.total}
          </Typography>
          <TextField label="Observaciones" fullWidth sx={{ mt: 2, mb: 2 }} />
          <Button
            variant="contained"
            sx={{ bgcolor: "#2563eb", mt: 2 }}
            onClick={() => setPantalla("confirmacion")}
          >
            Descargar PDF
          </Button>
        </Box>
      )}
      {pantalla === "confirmacion" && (
        <Box
          sx={{
            maxWidth: 400,
            mx: "auto",
            my: 10,
            bgcolor: "white",
            p: 4,
            borderRadius: 3,
            boxShadow: 2,
            textAlign: "center",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box
              sx={{
                bgcolor: "#10b981",
                borderRadius: "50%",
                width: 64,
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Close sx={{ color: "white", fontSize: 40 }} />
            </Box>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Pedido marcado como Listo para Envío
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Se ha generado la guía de despacho y el pedido ha sido actualizado
            automáticamente.
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setPantalla("panel");
              setPedidoSeleccionado(null);
            }}
            sx={{ mr: 2, bgcolor: "#2563eb" }}
          >
            Ir al Panel
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setPantalla("panel");
              setPedidoSeleccionado(null);
            }}
          >
            Preparar Siguiente Pedido
          </Button>
        </Box>
      )}
    </Box>
  );
}
export default AlmacenDashboard;