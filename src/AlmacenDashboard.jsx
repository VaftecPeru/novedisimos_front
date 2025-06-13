import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, InputAdornment, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, FormControl, Select, MenuItem,
  IconButton, Typography, Chip, Drawer, Divider
} from '@mui/material';
import { Search, WhatsApp, FilterList, MusicNote, Instagram, Close, Add, Save, Refresh } from '@mui/icons-material';
import { fetchOrders } from './components/services/shopifyService';

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
  if (order.fulfillment_status === 'fulfilled') return 'DESPACHADO';
  if (order.fulfillment_status === 'partial') return 'PARCIAL';
  if (order.financial_status === 'paid') return 'EN_ALMACEN';
  return 'INGRESADO';
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
  
  const estadosInventario = [
    { value: 'PENDIENTE_STOCK', label: 'Pendiente Stock', color: '#f59e0b' },
    { value: 'DISPONIBLE', label: 'Disponible', color: '#3b82f6' },
    { value: 'VERIFICADO', label: 'Verificado', color: '#8b5cf6' },
    { value: 'PREPARANDO', label: 'Preparando', color: '#06b6d4' },
    { value: 'DESPACHADO', label: 'Despachado', color: '#10b981' },
    { value: 'ANULADO', label: 'Anulado', color: '#ef4444' }
  ];
  
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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pantalla, setPantalla] = useState('panel');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
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
    const cargarPedidosAlmacen = async () => {
      try {
        setLoading(true);
        const response = await fetchOrders();
        let allOrders = [];
        if (response && response.orders) {
          allOrders = response.orders;
        } else if (Array.isArray(response)) {
          allOrders = response;
        }
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
      } catch (err) {
        setError(err.message || 'Error al cargar pedidos');
      } finally {
        setLoading(false);
      }
    };
    cargarPedidosAlmacen();
  }, []);

  const handleFormChange = (e) => {
    setNuevoRegistroAlmacen({ ...nuevoRegistroAlmacen, [e.target.name]: e.target.value });
  };

  const handleInventarioChange = (pedidoId, nuevoEstado) => {
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

  const actualizarDatos = () => {
    setLoading(true);
    setError(null);
    fetchOrders().then(response => {
      let allOrders = [];
      if (response && response.orders) {
        allOrders = response.orders;
      } else if (Array.isArray(response)) {
        allOrders = response;
      }
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
      setLoading(false);
    }).catch(err => {
      setError(err.message || 'Error al actualizar pedidos');
      setLoading(false);
    });
  };

  const pedidosFiltrados = pedidosOriginales.filter(pedido => {
    const { estado, almacen, fechaInicio, fechaFin, searchTerm, tipoFecha, estadoInventario } = filtros;
    if (estado && estado !== '' && pedido.estado !== estado) return false;
    if (almacen && almacen !== 'TODOS' && pedido.almacen !== almacen) return false;
    if (estadoInventario && estadoInventario !== '' && pedido.inventario !== estadoInventario) return false;
    if (fechaInicio || fechaFin) {
      let fechaComparar = null;
      switch(tipoFecha) {
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

  return (
    <Box sx={{ p: 3, bgcolor: '#f9fafb', minHeight: '100vh', width: '100%', boxSizing: 'border-box', overflowX: 'auto' }}>
      {pantalla === 'panel' && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Gestión de Almacén</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {[MusicNote, Instagram, WhatsApp].map((Icon, idx) => (
                <IconButton key={idx} color="primary"><Icon /></IconButton>
              ))}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              sx={{ bgcolor: '#4f46e5', borderRadius: '20px', '&:hover': { bgcolor: '#4338ca' } }}
              onClick={() => setDrawerOpen(true)}
              startIcon={<Add />}
            >
              Nuevo Registro
            </Button>
            <Button
              variant="outlined"
              sx={{ 
                borderColor: '#10b981', 
                color: '#10b981', 
                borderRadius: '20px', 
                '&:hover': { 
                  bgcolor: '#10b981', 
                  color: 'white',
                  borderColor: '#10b981'
                } 
              }}
              onClick={actualizarDatos}
              startIcon={<Refresh />}
            >
              Actualizar
            </Button>
            <TextField
              placeholder="Buscar por cliente, pedido, teléfono o ubicación..."
              variant="outlined"
              size="small"
              value={filtros.searchTerm}
              onChange={(e) => handleFiltroChange('searchTerm', e.target.value)}
              sx={{ minWidth: 250, bgcolor: 'white' }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }}
            />
            <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
              <Select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                displayEmpty
                renderValue={selected => selected || "Estados"}  
                sx={{ height: 40 }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                {estadosDisponibles.map(estado => (
                  <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
              <Select
                value={filtros.almacen}
                onChange={(e) => handleFiltroChange('almacen', e.target.value)}
                displayEmpty
                renderValue={selected => selected || "Almacenes"}
                sx={{ height: 40 }}
              >
                {almacenesDisponibles.map(almacen => (
                  <MenuItem key={almacen} value={almacen}>{almacen}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
              <Select
                value={filtros.estadoInventario}
                onChange={(e) => handleFiltroChange('estadoInventario', e.target.value)}
                displayEmpty
                renderValue={selected => selected || "Estado Inventario"}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>Filtrar por:</Typography>
              <FormControl size="small" sx={{ minWidth: 140, bgcolor: 'white' }}>
                <Select
                  value={filtros.tipoFecha}
                  onChange={(e) => handleFiltroChange('tipoFecha', e.target.value)}
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
                onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                sx={{ width: 160, bgcolor: 'white' }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Hasta"
                type="date"
                size="small"
                value={filtros.fechaFin}
                onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                sx={{ width: 160, bgcolor: 'white' }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="primary">
                <FilterList />
              </IconButton>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                {pedidosFiltrados.length} de {pedidosOriginales.length} registros
              </Typography>
            </Box>
          </Box>
          <TableContainer 
            component={Paper} 
            sx={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'auto'
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', minWidth: 120 }}>Orden</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', minWidth: 200 }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', minWidth: 150 }}>Teléfono</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', minWidth: 200 }}>Ubicación</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', minWidth: 120 }}>Almacén</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', minWidth: 180 }}>Estados</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', minWidth: 200 }}>Productos</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', minWidth: 120 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', minWidth: 200 }}>Fechas</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', minWidth: 150 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pedidosFiltrados.map((pedido, index) => (
                  <TableRow 
                    key={pedido.id || index}
                    sx={{ 
                      '&:hover': { bgcolor: '#f8fafc' },
                      '& .MuiTableCell-root': { borderBottom: '1px solid #e2e8f0' }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e40af' }}>
                        {pedido.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {pedido.cliente}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{pedido.telefono}</Typography>
                        {pedido.telefono && pedido.telefono !== 'Sin teléfono' && (
                          <IconButton size="small" color="success">
                            <WhatsApp fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {pedido.ubicacion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={pedido.almacen} 
                        sx={{ 
                          bgcolor: pedido.almacen === 'LIMA' ? '#3b82f6' : '#f59e0b', 
                          color: 'white', 
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <EstadoAlmacenChip 
                        estado={pedido.estado}
                        estadoAdicional={pedido.estadoAlmacen}
                        inventario={pedido.inventario}
                        pedidoId={pedido.id}
                        onInventarioChange={handleInventarioChange}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: 180, maxHeight: 100, overflowY: 'auto' }}>
                        {pedido.productos.map((producto, idx) => (
                          <Typography key={idx} variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                            {producto.cantidad}x {producto.nombre}
                            {producto.sku && ` (${producto.sku})`}
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#059669' }}>
                        {pedido.importes.total}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <FechaItem label="Ingreso" fecha={pedido.fechas.ingreso} />
                        <FechaItem label="Registro" fecha={pedido.fechas.registro} />
                        {pedido.fechas.despacho !== '-' && (
                          <FechaItem label="Despacho" fecha={pedido.fechas.despacho} />
                        )}
                        {pedido.fechas.entrega !== '-' && (
                          <FechaItem label="Entrega" fecha={pedido.fechas.entrega} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setPedidoSeleccionado(pedido);
                          setPantalla('preparacion');
                        }}
                      >
                        Generar Guía de Despacho
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {pedidosFiltrados.length === 0 && !loading && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              py: 8,
              bgcolor: 'white',
              borderRadius: '12px',
              mt: 2
            }}>
              <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                No se encontraron registros
              </Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                Ajusta los filtros para ver más resultados
              </Typography>
            </Box>
          )}
        </>
      )}

      {pantalla === 'preparacion' && pedidoSeleccionado && (
        <Box sx={{ maxWidth: 600, mx: 'auto', my: 6, bgcolor: 'white', p: 4, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Generar Guía de Despacho</Typography>
            <IconButton onClick={() => setPantalla('panel')}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{pedidoSeleccionado.id}</Typography>
              <Typography variant="body2">{pedidoSeleccionado.cliente}</Typography>
              <Typography variant="body2">{pedidoSeleccionado.ubicacion}</Typography>
              <Box sx={{ mt: 2, mb: 2 }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Pedido%20ID%20-%20${pedidoSeleccionado.id}`} alt="QR" />
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Detalles</Typography>
              {pedidoSeleccionado.productos.map((prod, i) => (
                <Box key={i} sx={{ mb: 1 }}>
                  <Typography variant="body2">{prod.nombre}</Typography>
                  <Typography variant="caption">Cantidad: {prod.cantidad}</Typography>
                </Box>
              ))}
              <Typography variant="body2" sx={{ mt: 1 }}>Total: {pedidoSeleccionado.importes.total}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => setPantalla('guia')}
              sx={{ bgcolor: '#2563eb' }}
            >
              Generar Guía de Despacho
            </Button>
            <Button
              variant="outlined"
              onClick={() => setPantalla('confirmacion')}
              sx={{ borderColor: '#10b981', color: '#10b981' }}
            >
              Marcar como Listo para Envío
            </Button>
          </Box>
        </Box>
      )}

      {pantalla === 'guia' && pedidoSeleccionado && (
        <Box sx={{ maxWidth: 600, mx: 'auto', my: 6, bgcolor: 'white', p: 4, borderRadius: 3, boxShadow: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Guía de Despacho - Tienda Virtual</Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2"><b>{pedidoSeleccionado.id}</b></Typography>
            <Typography variant="body2">{pedidoSeleccionado.cliente}</Typography>
            <Typography variant="body2">{pedidoSeleccionado.ubicacion}</Typography>
          </Box>
          <Divider />
          <Box sx={{ mt: 2 }}>
            {pedidoSeleccionado.productos.map((prod, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{prod.nombre}</Typography>
                <Typography variant="body2">{prod.cantidad}</Typography>
              </Box>
            ))}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2">Total: {pedidoSeleccionado.importes.total}</Typography>
          <TextField label="Observaciones" fullWidth sx={{ mt: 2, mb: 2 }} />
          <Button
            variant="contained"
            sx={{ bgcolor: '#2563eb', mt: 2 }}
            onClick={() => setPantalla('confirmacion')}
          >
            Descargar PDF
          </Button>
        </Box>
      )}

      {pantalla === 'confirmacion' && (
        <Box sx={{ maxWidth: 400, mx: 'auto', my: 10, bgcolor: 'white', p: 4, borderRadius: 3, boxShadow: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ bgcolor: '#10b981', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Close sx={{ color: 'white', fontSize: 40 }} />
            </Box>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Pedido marcado como Listo para Envío</Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>Se ha generado la guía de despacho y el pedido ha sido actualizado automáticamente.</Typography>
          <Button
            variant="contained"
            onClick={() => {
              setPantalla('panel');
              setPedidoSeleccionado(null);
            }}
            sx={{ mr: 2, bgcolor: '#2563eb' }}
          >
            Ir al Panel
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setPantalla('panel');
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