import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, InputAdornment, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, FormControl, Select, MenuItem,
  IconButton, Typography, Chip, Drawer, Divider, Radio, RadioGroup, FormControlLabel, Menu,
  InputLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Search, WhatsApp, FilterList, MusicNote, Instagram, Close, Add, Save } from '@mui/icons-material';
import {
  actualizarEstadoInternoPago, actualizarEstadoInternoPreparacion, crearNotificacionAlmacen, fetchEstadosPedidos,
  fetchOrders, getShopInfo, fetchVendedores, fetchAlmacen, createSeguimiento, fetchVentasPedidosAsignados, fetchAlmacenPedidosAsignados,
  fetchSeguimientoVentas
} from './components/services/shopifyService';
import './PedidosDashboard.css';
import NoteIcon from '@mui/icons-material/Note';
import SaveIcon from '@mui/icons-material/Save';
import TablePagination from '@mui/material/TablePagination';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { useConfirmDialog } from './components/Modals/useConfirmDialog';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';


function EstadoBadge({ label, color }) {
  return (
    <Box
      sx={{
        display: 'inline-block',
        px: 2,
        py: 0.5,
        bgcolor: color,
        color: '#fff',
        borderRadius: '6px',
        fontWeight: 'bold',
        fontSize: '0.98em',
        textTransform: 'uppercase',
        textAlign: 'center',
        minWidth: 110,
        boxShadow: '0 1px 3px rgba(60,60,60,0.08)'
      }}
    >
      {label}
    </Box>
  );
}
function NotaIcono(props) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="#222" strokeWidth="2" fill="none" />
      <rect x="7" y="8" width="10" height="2" rx="1" fill="#222" />
      <rect x="7" y="12" width="10" height="2" rx="1" fill="#222" />
      <rect x="7" y="16" width="7" height="2" rx="1" fill="#222" />
      <path d="M17 19l2.5-2.5M18.5 18.5l-1-1" stroke="#222" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function NotaEditable({ nota, onSave, Icono }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(nota || '');

  const handleSave = () => {
    setEditando(false);
    if (onSave) onSave(valor);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {editando ? (
        <>
          <TextField
            value={valor}
            onChange={e => setValor(e.target.value)}
            size="small"
            variant="outlined"
            sx={{ minWidth: 100 }}
          />
          <IconButton size="small" color="primary" onClick={handleSave}>
            <SaveIcon />
          </IconButton>
        </>
      ) : (
        <>
          <IconButton size="small" onClick={() => setEditando(true)}>
            {Icono ? <Icono /> : <NoteIcon />}
          </IconButton>
          <Box
            onClick={() => setEditando(true)}
            sx={{ cursor: 'pointer', minWidth: 60, color: '#333', fontSize: '0.9em' }}
          >
            {nota || <span style={{ color: '#aaa' }}>Sin nota</span>}
          </Box>
        </>
      )}
    </Box>
  );
}

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

const mapDeliveryStatus = (order) => {
  if (order.fulfillment_status === 'fulfilled') return 'FINAL DE ENTREGA';
  if (order.fulfillment_status === 'partial') return 'POR DERIVAR';
  if (order.financial_status === 'paid') return 'ADMITIDO';
  return 'IN-WOW';
};

const getTrazabilidadStatus = (order) => {
  if (order.cancelled_at) return 'ANULADO';
  if (order.fulfillment_status === 'fulfilled') return 'ENTREGADO';
  if (order.fulfillment_status === 'partial') return 'EN_TRANSITO';
  if (order.fulfillment_status === 'shipped') return 'EN_TRANSITO';
  if (order.tags && order.tags.includes('listo-enviar')) return 'LISTO_PARA_ENVIAR';
  if (order.tags && order.tags.includes('preparando')) return 'PREPARANDO_PEDIDO';
  if (order.financial_status === 'paid') return 'PREPARANDO_PEDIDO';
  return 'PENDIENTE';
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

const EstadoChip = ({ estado, estadoAdicional, trazabilidad, pedidoId, onTrazabilidadChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const estadosTrazabilidad = [
    { value: 'PENDIENTE', label: 'Pendiente', color: '#f59e0b' },
    { value: 'PREPARANDO_PEDIDO', label: 'Preparando pedido', color: '#3b82f6' },
    { value: 'LISTO_PARA_ENVIAR', label: 'Listo para enviar', color: '#8b5cf6' },
    { value: 'EN_TRANSITO', label: 'En tránsito', color: '#06b6d4' },
    { value: 'ENTREGADO', label: 'Entregado', color: '#10b981' },
    { value: 'ANULADO', label: 'Anulado / Reprogramado', color: '#ef4444' }
  ];

  const estadoTrazabilidadActual = estadosTrazabilidad.find(e => e.value === trazabilidad) || estadosTrazabilidad[0];

  const colorMap = {
    'IN-WOW': '#3884f7',
    'ADMITIDO': '#10b981',
    'POR DERIVAR': '#f59e0b',
    'FINAL DE ENTREGA': '#8b5cf6',
    'default': '#4763e4'
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEstadoSelect = (nuevoEstado) => {
    if (onTrazabilidadChange) {
      onTrazabilidadChange(pedidoId, nuevoEstado);
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
        label={estadoTrazabilidadActual.label}
        onClick={handleClick}
        sx={{
          bgcolor: estadoTrazabilidadActual.color,
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
        {estadosTrazabilidad.map((estado) => (
          <MenuItem
            key={estado.value}
            onClick={() => handleEstadoSelect(estado.value)}
            sx={{
              color: estado.color,
              fontWeight: trazabilidad === estado.value ? 'bold' : 'normal'
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

function PedidosDashboard() {

  /// -------------------------------------- Mostrar componentes por roles -------------------------------------- //
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const isVendedor = currentUser.rol === 'Vendedor';
  const userId = Number(currentUser.id);
  //------------------------------//

  const [filtros, setFiltros] = useState({
    estado: 'PENDIENTE',
    almacen: 'TODOS',
    tipoFecha: 'ingreso',
    fechaInicio: '',
    fechaFin: '',
    searchTerm: ''
  });
  const { confirm } = useConfirmDialog();
  const navigate = useNavigate();
  const handleExportar = () => {
    const csvRows = [];
    csvRows.push("ID,Cliente,Vendedor,Estado de Pago,Estado de Entrega,Total");

    pedidosFiltrados.forEach(pedido => {
      const row = [
        pedido.id,
        pedido.cliente || "",
        pedido.vendedor?.nombre || "Sin asignar",
        pedido.financial_status === "paid" ? "Pagado" : "Pago pendiente",
        pedido.fulfillment_status === "fulfilled" ? "Preparado" : "No preparado",
        pedido.total || ""
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
      csvRows.push(row);
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'pedidos.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoEditado, setPedidoEditado] = useState({});
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const estadoInicial = {
    numeroOrden: '',
    canal: 'Shopify',
    nota: '',
    vendedor: '',

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
    estadoAdicional: 'IN-WOW',
    medioPago: '',
    total: '',
    notaAdicional: ''
  };

  const [nuevoPedido, setNuevoPedido] = useState(estadoInicial);
  const [nuevoProducto, setNuevoProducto] = useState({ descripcion: '', cantidad: 1, precio: '' });

  const [pedidos, setPedidos] = useState([]);
  const [pedidosOriginales, setPedidosOriginales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroPago, setFiltroPago] = useState("");
  const [filtroPreparado, setFiltroPreparado] = useState("");

  // -----------------------------------------------------------------------//
  const [vendedores, setVendedores] = useState([]);
  const [loadingVendedores, setLoadingVendedores] = useState(true);
  const [modalAsignarOpen, setModalAsignarOpen] = useState(false);
  const [vendedorAsignado, setVendedorAsignado] = useState('');

  useEffect(() => {
    const cargarVendedores = async () => {
      try {
        setLoadingVendedores(true);
        const vendedoresData = await fetchVendedores();
        console.log('📥 Vendedores cargados:', vendedoresData);
        setVendedores(Array.isArray(vendedoresData) ? vendedoresData : []);
        if (!vendedoresData || vendedoresData.length === 0) {
          Swal.fire({
            title: 'Advertencia',
            text: 'No se encontraron vendedores disponibles.',
            icon: 'warning',
            confirmButtonText: 'OK',
          });
        }
      } catch (error) {
        console.error('❌ Error cargando vendedores:', error);
        setVendedores([]);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar la lista de vendedores.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } finally {
        setLoadingVendedores(false);
      }
    };
    cargarVendedores();
  }, []);

  const [usuariosAlmacen, setUsuariosAlmacen] = useState([]);
  const [loadingUsuariosAlmacen, setLoadingUsuariosAlmacen] = useState(true);
  const [modalAsignarAlmacenOpen, setModalAsignarAlmacenOpen] = useState(false);
  const [usuarioAlmacenAsignado, setUsuarioAlmacenAsignado] = useState('');

  useEffect(() => {
    const cargarUsuariosAlmacen = async () => {
      try {
        setLoadingUsuariosAlmacen(true);
        const response = await fetchAlmacen();
        const usuariosData = response.data; // Extraer el campo 'data'
        console.log('📦 Respuesta de fetchAlmacen:', usuariosData);
        setUsuariosAlmacen(Array.isArray(usuariosData) ? usuariosData : []);
        if (!usuariosData || usuariosData.length === 0) {
          Swal.fire({
            title: 'Advertencia',
            text: 'No se encontraron usuarios de almacén disponibles.',
            icon: 'warning',
            confirmButtonText: 'OK',
          });
        }
      } catch (error) {
        console.error('❌ Error cargando usuarios de almacén:', error);
        setUsuariosAlmacen([]);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar la lista de usuarios de almacén.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } finally {
        setLoadingUsuariosAlmacen(false);
      }
    };
    cargarUsuariosAlmacen();
  }, []);


  // Función para abrir modal de vendedor
  const handleAbrirAsignarVendedor = (pedido) => {
    setPedidoSeleccionado(pedido);
    setVendedorAsignado(""); // Reset
    setModalAsignarOpen(true);
  };

  const handleAsignarVendedor = async () => {
    try {
      if (!vendedorAsignado || !pedidoSeleccionado?.shopifyId) {
        throw new Error('Falta el ID del vendedor o del pedido');
      }

      const vendedor = vendedores.find(v => Number(v.id) === Number(vendedorAsignado));
      if (!vendedor) {
        throw new Error('Vendedor no encontrado en la lista');
      }

      const seguimientoData = {
        shopify_order_id: Number(pedidoSeleccionado.shopifyId),
        area: 'Ventas',
        estado: 'Pendiente',
        responsable_id: Number(vendedorAsignado),
      };

      console.log('📤 Enviando datos a createSeguimiento:', seguimientoData);
      const response = await createSeguimiento(seguimientoData);
      console.log('📥 Respuesta de createSeguimiento:', response);

      if (response) {
        const updatedPedidos = pedidos.map((p) =>
          p.shopifyId === pedidoSeleccionado.shopifyId
            ? { ...p, responsable: { ...vendedor } }
            : p
        );
        const updatedPedidosOriginales = pedidosOriginales.map((p) =>
          p.shopifyId === pedidoSeleccionado.shopifyId
            ? { ...p, responsable: { ...vendedor } }
            : p
        );

        setPedidos(updatedPedidos);
        setPedidosOriginales(updatedPedidosOriginales);

        Swal.fire({
          title: '¡Éxito!',
          text: `Vendedor ${vendedor.nombre_completo} asignado al pedido #${pedidoSeleccionado.id}.`,
          icon: 'success',
          confirmButtonText: 'OK',
        });

        setModalAsignarOpen(false);
        setVendedorAsignado('');
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error asignando vendedor:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo asignar el vendedor. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleAbrirAsignarUsuarioAlmacen = (pedido) => {
    setPedidoSeleccionado(pedido);
    setUsuarioAlmacenAsignado('');
    setModalAsignarAlmacenOpen(true);
  };

  const handleAsignarUsuarioAlmacen = async () => {
    try {
      if (!usuarioAlmacenAsignado || !pedidoSeleccionado?.shopifyId) {
        throw new Error('Falta el ID del usuario de almacén o del pedido');
      }

      const usuario = usuariosAlmacen.find(u => Number(u.id) === Number(usuarioAlmacenAsignado));
      if (!usuario) {
        throw new Error('Usuario de almacén no encontrado en la lista');
      }

      console.log('Usuario seleccionado:', usuario); // Depurar el objeto usuario

      const seguimientoData = {
        shopify_order_id: Number(pedidoSeleccionado.shopifyId),
        area: 'Almacen',
        estado: 'Listo_Para_Despacho',
        responsable_id: Number(usuarioAlmacenAsignado),
      };

      console.log('📤 Enviando datos a createSeguimiento para almacén:', seguimientoData);
      const response = await createSeguimiento(seguimientoData);
      console.log('📥 Respuesta de createSeguimiento:', response);

      if (response) {
        const updatedPedidos = pedidos.map((p) =>
          p.shopifyId === pedidoSeleccionado.shopifyId
            ? { ...p, responsable_almacen: { ...usuario } }
            : p
        );
        const updatedPedidosOriginales = pedidosOriginales.map((p) =>
          p.shopifyId === pedidoSeleccionado.shopifyId
            ? { ...p, responsable_almacen: { ...usuario } }
            : p
        );

        setPedidos(updatedPedidos);
        setPedidosOriginales(updatedPedidosOriginales);

        Swal.fire({
          title: '¡Éxito!',
          text: `Usuario de almacén ${usuario.nombre_completo} asignado al pedido #${pedidoSeleccionado.id}.`,
          icon: 'success',
          confirmButtonText: 'OK',
        });

        setModalAsignarAlmacenOpen(false);
        setUsuarioAlmacenAsignado('');
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error asignando usuario de almacén:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo asignar el usuario de almacén. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  // -----------------------------------------------------------------------//
  //----------------Incio Array de distritos y provincias -------//

  const [provinciasAmazonas] = useState([
    { value: 'Bagua', label: 'Bagua' },
    { value: 'Bongará', label: 'Bongará' },
    { value: 'Chachapoyas', label: 'Chachapoyas' },
    { value: 'Condorcanqui', label: 'Condorcanqui' },
    { value: 'Luya', label: 'Luya' },
    { value: 'Rodríguez de Mendoza', label: 'Rodríguez de Mendoza' },
    { value: 'Utcubamba', label: 'Utcubamba' },
  ]);
  const [provinciasAncash] = useState([
    { value: 'Aija', label: 'Aija' },
    { value: 'Antonio Raymondi', label: 'Antonio Raymondi' },
    { value: 'Asunción', label: 'Asunción' },
    { value: 'Bolognesi', label: 'Bolognesi' },
    { value: 'Carhuaz', label: 'Carhuaz' },
    { value: 'Carlos Fermín Fitzcarrald', label: 'Carlos Fermín Fitzcarrald' },
    { value: 'Casma', label: 'Casma' },
    { value: 'Corongo', label: 'Corongo' },
    { value: 'Huaraz', label: 'Huaraz' },
    { value: 'Huari', label: 'Huari' },
    { value: 'Huarmey', label: 'Huarmey' },
    { value: 'Huaylas', label: 'Huaylas' },
    { value: 'Mariscal Luzuriaga', label: 'Mariscal Luzuriaga' },
    { value: 'Ocros', label: 'Ocros' },
    { value: 'Pallasca', label: 'Pallasca' },
    { value: 'Pomabamba', label: 'Pomabamba' },
    { value: 'Recuay', label: 'Recuay' },
    { value: 'Santa', label: 'Santa' },
    { value: 'Sihuas', label: 'Sihuas' },
    { value: 'Yungay', label: 'Yungay' },
  ]);
  const [provinciasApurimac] = useState([
    { value: 'Abancay', label: 'Abancay' },
    { value: 'Andahuaylas', label: 'Andahuaylas' },
    { value: 'Antabamba', label: 'Antabamba' },
    { value: 'Aymaraes', label: 'Aymaraes' },
    { value: 'Cotabambas', label: 'Cotabambas' },
    { value: 'Chincheros', label: 'Chincheros' },
    { value: 'Grau', label: 'Grau' },
  ]);
  const [provinciasArequipa] = useState([
    { value: 'Arequipa', label: 'Arequipa' },
    { value: 'Camaná', label: 'Camaná' },
    { value: 'Caravelí', label: 'Caravelí' },
    { value: 'Castilla', label: 'Castilla' },
    { value: 'Caylloma', label: 'Caylloma' },
    { value: 'Condesuyos', label: 'Condesuyos' },
    { value: 'Islay', label: 'Islay' },
    { value: 'La Unión', label: 'La Unión' },
  ]);
  const [provinciasAyacucho] = useState([
    { value: 'Cangallo', label: 'Cangallo' },
    { value: 'Huamanga', label: 'Huamanga' },
    { value: 'Huanca Sancos', label: 'Huanca Sancos' },
    { value: 'Huanta', label: 'Huanta' },
    { value: 'La Mar', label: 'La Mar' },
    { value: 'Lucanas', label: 'Lucanas' },
    { value: 'Parinacochas', label: 'Parinacochas' },
    { value: 'Páucar del Sara Sara', label: 'Páucar del Sara Sara' },
    { value: 'Sucre', label: 'Sucre' },
    { value: 'Víctor Fajardo', label: 'Víctor Fajardo' },
    { value: 'Vilcas Huamán', label: 'Vilcas Huamán' },
  ]);
  const [provinciasCajamarca] = useState([
    { value: 'Cajabamba', label: 'Cajabamba' },
    { value: 'Cajamarca', label: 'Cajamarca' },
    { value: 'Celendín', label: 'Celendín' },
    { value: 'Chota', label: 'Chota' },
    { value: 'Contumazá', label: 'Contumazá' },
    { value: 'Cutervo', label: 'Cutervo' },
    { value: 'Hualgayoc', label: 'Hualgayoc' },
    { value: 'Jaén', label: 'Jaén' },
    { value: 'San Ignacio', label: 'San Ignacio' },
    { value: 'San Marcos', label: 'San Marcos' },
    { value: 'San Miguel', label: 'San Miguel' },
    { value: 'San Pablo', label: 'San Pablo' },
    { value: 'Santa Cruz', label: 'Santa Cruz' },
  ]);
  const [provinciasCallao] = useState([
    { value: 'Callao', label: 'Callao' },
  ]);
  const [provinciasCusco] = useState([
    { value: 'Acomayo', label: 'Acomayo' },
    { value: 'Anta', label: 'Anta' },
    { value: 'Apurímac', label: 'Apurímac' },
    { value: 'Calca', label: 'Calca' },
    { value: 'Canas', label: 'Canas' },
    { value: 'Canchis', label: 'Canchis' },
    { value: 'Chumbivilcas', label: 'Chumbivilcas' },
    { value: 'Espinar', label: 'Espinar' },
    { value: 'La Convención', label: 'La Convención' },
    { value: 'Paruro', label: 'Paruro' },
    { value: 'Paucartambo', label: 'Paucartambo' },
    { value: 'Quispicanchi', label: 'Quispicanchi' },
    { value: 'Urubamba', label: 'Urubamba' }
  ]);
  const [provinciasHuancavelica] = useState([
    { value: 'Acobamba', label: 'Acobamba' },
    { value: 'Angaraes', label: 'Angaraes' },
    { value: 'Castrovirreyna', label: 'Castrovirreyna' },
    { value: 'Churcampa', label: 'Churcampa' },
    { value: 'Huancavelica', label: 'Huancavelica' },
    { value: 'Huaytará', label: 'Huaytará' },
    { value: 'Tayacaja', label: 'Tayacaja' }
  ]);
  const [provinciasHuanuco] = useState([
    { value: 'Ambo', label: 'Ambo' },
    { value: 'Dos de Mayo', label: 'Dos de Mayo' },
    { value: 'Huánuco', label: 'Huánuco' },
    { value: 'Huacaybamba', label: 'Huacaybamba' },
    { value: 'Leoncio Prado', label: 'Leoncio Prado' },
    { value: 'Marañón', label: 'Marañón' },
    { value: 'Pachitea', label: 'Pachitea' },
    { value: 'Panao', label: 'Panao' },
    { value: 'Rupa-Rupa', label: 'Rupa-Rupa' },
    { value: 'Yarowilca', label: 'Yarowilca' }
  ]);
  const [provinciasIca] = useState([
    { value: 'Ica', label: 'Ica' },
    { value: 'Chincha', label: 'Chincha' },
    { value: 'Nasca', label: 'Nasca' },
    { value: 'Palpa', label: 'Palpa' },
    { value: 'Pisco', label: 'Pisco' }
  ]);
  const [provinciasJunin] = useState([
    { value: 'Huancayo', label: 'Huancayo' },
    { value: 'Junín', label: 'Junín' },
    { value: 'Chanchamayo', label: 'Chanchamayo' },
    { value: 'Chupaca', label: 'Chupaca' },
    { value: 'Concepción', label: 'Concepción' },
    { value: 'Jauja', label: 'Jauja' },
    { value: 'Tarma', label: 'Tarma' },
    { value: 'Yauli', label: 'Yauli' },
    { value: 'Satipo', label: 'Satipo' }
  ]);
  const [provinciasLaLibertad] = useState([
    { value: 'Trujillo', label: 'Trujillo' },
    { value: 'Ascope', label: 'Ascope' },
    { value: 'Bolívar', label: 'Bolívar' },
    { value: 'Chepén', label: 'Chepén' },
    { value: 'Gran Chimú', label: 'Gran Chimú' },
    { value: 'Julcán', label: 'Julcán' },
    { value: 'Otuzco', label: 'Otuzco' },
    { value: 'Pacasmayo', label: 'Pacasmayo' },
    { value: 'Pataz', label: 'Pataz' },
    { value: 'Santiago de Chuco', label: 'Santiago de Chuco' },
    { value: 'Gran Chimú', label: 'Gran Chimú' },
    { value: 'Virú', label: 'Virú' }
  ]);
  const [provinciasLambayeque] = useState([
    { value: 'Chiclayo', label: 'Chiclayo' },
    { value: 'Chongoyape', label: 'Chongoyape' },
    { value: 'Eten', label: 'Eten' },
    { value: 'Ferreñafe', label: 'Ferreñafe' },
    { value: 'Lambayeque', label: 'Lambayeque' },
    { value: 'Lagunillas', label: 'Lagunillas' },
    { value: 'Mochumi', label: 'Mochumi' },
    { value: 'Olmos', label: 'Olmos' },
    { value: 'Pítipo', label: 'Pítipo' },
    { value: 'Reque', label: 'Reque' },
    { value: 'Túcume', label: 'Túcume' }
  ]);
  const [provinciasLima] = useState([
    { value: 'Barranca', label: 'Barranca' },
    { value: 'Cajatambo', label: 'Cajatambo' },
    { value: 'Canta', label: 'Canta' },
    { value: 'Cañete', label: 'Cañete' },
    { value: 'Huaral', label: 'Huaral' },
    { value: 'Huarochirí', label: 'Huarochirí' },
    { value: 'Huaura', label: 'Huaura' },
    { value: 'Lima', label: 'Lima' },
    { value: 'Oyón', label: 'Oyón' },
    { value: 'Yauyos', label: 'Yauyos' },
  ]);
  const [provinciasLoreto] = useState([
    { value: 'Maynas', label: 'Maynas' },
    { value: 'Alto Amazonas', label: 'Alto Amazonas' },
    { value: 'Datem del Marañón', label: 'Datem del Marañón' },
    { value: 'Loreto', label: 'Loreto' },
    { value: 'Mariscal Ramón Castilla', label: 'Mariscal Ramón Castilla' },
    { value: 'Requena', label: 'Requena' },
    { value: 'Ucayali', label: 'Ucayali' }
  ]);
  const [provinciasMadreDeDios] = useState([
    { value: 'Tambopata', label: 'Tambopata' },
    { value: 'Manu', label: 'Manu' },
    { value: 'Tahuamanu', label: 'Tahuamanu' }
  ]);
  const [provinciasMoquegua] = useState([
    { value: 'Mariscal Nieto', label: 'Mariscal Nieto' },
    { value: 'Ilo', label: 'Ilo' },
    { value: 'General Sánchez Cerro', label: 'General Sánchez Cerro' },
    { value: 'Pedro Ruiz Gallo', label: 'Pedro Ruiz Gallo' }
  ]);
  const [provinciasPasco] = useState([
    { value: 'Pasco', label: 'Pasco' },
    { value: 'Daniel Alcides Carrión', label: 'Daniel Alcides Carrión' },
    { value: 'Oxapampa', label: 'Oxapampa' }
  ]);
  const [provinciasPiura] = useState([
    { value: 'Piura', label: 'Piura' },
    { value: 'Ayabaca', label: 'Ayabaca' },
    { value: 'Huancabamba', label: 'Huancabamba' },
    { value: 'Morropón', label: 'Morropón' },
    { value: 'Paita', label: 'Paita' },
    { value: 'Sullana', label: 'Sullana' },
    { value: 'Talara', label: 'Talara' },
    { value: 'Sechura', label: 'Sechura' }
  ]);
  const [provinciasPuno] = useState([
    { value: 'Puno', label: 'Puno' },
    { value: 'Azángaro', label: 'Azángaro' },
    { value: 'Carabaya', label: 'Carabaya' },
    { value: 'Chucuito', label: 'Chucuito' },
    { value: 'Huancané', label: 'Huancané' },
    { value: 'Lampa', label: 'Lampa' },
    { value: 'Melgar', label: 'Melgar' },
    { value: 'San Antonio de Putina', label: 'San Antonio de Putina' },
    { value: 'San Román', label: 'San Román' },
    { value: 'Sandia', label: 'Sandia' },
    { value: 'Yunguyo', label: 'Yunguyo' }
  ]);
  const [provinciasSanMartin] = useState([
    { value: 'Moyobamba', label: 'Moyobamba' },
    { value: 'Bellavista', label: 'Bellavista' },
    { value: 'El Dorado', label: 'El Dorado' },
    { value: 'Huallaga', label: 'Huallaga' },
    { value: 'Lamas', label: 'Lamas' },
    { value: 'Mariscal Cáceres', label: 'Mariscal Cáceres' },
    { value: 'Picota', label: 'Picota' },
    { value: 'Rioja', label: 'Rioja' },
    { value: 'San Martín', label: 'San Martín' },
    { value: 'Tocache', label: 'Tocache' }
  ]);
  const [provinciasTacna] = useState([
    { value: 'Tacna', label: 'Tacna' },
    { value: 'Candarave', label: 'Candarave' },
    { value: 'Jorge Basadre', label: 'Jorge Basadre' },
    { value: 'Tarata', label: 'Tarata' }
  ]);
  const [provinciasTumbes] = useState([
    { value: 'Tumbes', label: 'Tumbes' },
    { value: 'Contralmirante Villar', label: 'Contralmirante Villar' },
    { value: 'Zorritos', label: 'Zorritos' }
  ]);
  const [provinciasUcayali] = useState([
    { value: 'Pucallpa', label: 'Pucallpa' },
    { value: 'Atalaya', label: 'Atalaya' },
    { value: 'Coronel Portillo', label: 'Coronel Portillo' },
    { value: 'Padre Abad', label: 'Padre Abad' },
    { value: 'Purús', label: 'Purús' }
  ]);
  const provinciasPorDepartamento = {
    Amazonas: provinciasAmazonas,
    Áncash: provinciasAncash,
    Apurímac: provinciasApurimac,
    Arequipa: provinciasArequipa,
    Ayacucho: provinciasAyacucho,
    Cajamarca: provinciasCajamarca,
    Callao: provinciasCallao,
    Cusco: provinciasCusco,
    Huancavelica: provinciasHuancavelica,
    Huánuco: provinciasHuanuco,
    Ica: provinciasIca,
    Junín: provinciasJunin,
    'La Libertad': provinciasLaLibertad,
    Lambayeque: provinciasLambayeque,
    Lima: provinciasLima,
    Loreto: provinciasLoreto,
    'Madre de Dios': provinciasMadreDeDios,
    Moquegua: provinciasMoquegua,
    Pasco: provinciasPasco,
    Piura: provinciasPiura,
    Puno: provinciasPuno,
    'San Martín': provinciasSanMartin,
    Tacna: provinciasTacna,
    Tumbes: provinciasTumbes,
    Ucayali: provinciasUcayali,
  };
  const distritosAmazonasData = {
    Bagua: [
      { value: 'Bagua', label: 'Bagua' },
      { value: 'Cajaruro', label: 'Cajaruro' },
      { value: 'El Parco', label: 'El Parco' },
      { value: 'Imaza', label: 'Imaza' },
      { value: 'La Peca', label: 'La Peca' },
    ],
    Bongará: [
      { value: 'Jumbilla', label: 'Jumbilla' },
      { value: 'Cuispes', label: 'Cuispes' },
      { value: 'Chisquilla', label: 'Chisquilla' },
      { value: 'Recta', label: 'Recta' },
      { value: 'San Nicolás', label: 'San Nicolás' },
      { value: 'Shipasbamba', label: 'Shipasbamba' },
      { value: 'Yambrasbamba', label: 'Yambrasbamba' },
    ],
    Chachapoyas: [
      { value: 'Chachapoyas', label: 'Chachapoyas' },
      { value: 'Asunción', label: 'Asunción' },
      { value: 'Balsas', label: 'Balsas' },
      { value: 'Cheto', label: 'Cheto' },
      { value: 'Chiliquín', label: 'Chiliquín' },
      { value: 'Huancas', label: 'Huancas' },
      { value: 'Leimebamba', label: 'Leimebamba' },
      { value: 'Lima', label: 'Lima' },
      { value: 'Mármol', label: 'Mármol' },
      { value: 'Molinos', label: 'Molinos' },
      { value: 'San Juan de Chachapoyas', label: 'San Juan de Chachapoyas' },
      { value: 'San Nicolás', label: 'San Nicolás' },
      { value: 'Tingo', label: 'Tingo' },
      { value: 'Valera', label: 'Valera' },
    ],
    Condorcanqui: [
      { value: 'Nieves', label: 'Nieves' },
      { value: 'Jumbilla', label: 'Jumbilla' },
      { value: 'Santa María', label: 'Santa María' },
      { value: 'Valera', label: 'Valera' },
      { value: 'Cuispes', label: 'Cuispes' },
    ],
    Luya: [
      { value: 'Luya', label: 'Luya' },
      { value: 'Cocabamba', label: 'Cocabamba' },
      { value: 'Conila', label: 'Conila' },
      { value: 'Lámud', label: 'Lámud' },
      { value: 'Longuita', label: 'Longuita' },
      { value: 'Ocalli', label: 'Ocalli' },
      { value: 'San Cristóbal', label: 'San Cristóbal' },
      { value: 'San Juan de Loa', label: 'San Juan de Loa' },
      { value: 'Tingo', label: 'Tingo' },
    ],
    'Rodríguez de Mendoza': [
      { value: 'Rodríguez de Mendoza', label: 'Rodríguez de Mendoza' },
      { value: 'Chirimoto', label: 'Chirimoto' },
      { value: 'Cochamal', label: 'Cochamal' },
      { value: 'Huambo', label: 'Huambo' },
      { value: 'Luna', label: 'Luna' },
      { value: 'San Nicolás', label: 'San Nicolás' },
      { value: 'Vista Alegre', label: 'Vista Alegre' },
    ],
    Utcubamba: [
      { value: 'Bagua Grande', label: 'Bagua Grande' },
      { value: 'Cajaruro', label: 'Cajaruro' },
      { value: 'El Parco', label: 'El Parco' },
      { value: 'Imaza', label: 'Imaza' },
      { value: 'La Peca', label: 'La Peca' },
    ]
  };
  const distritosAncashData = {
    Aija: [
      { value: 'Aija', label: 'Aija' },
      { value: 'Coris', label: 'Coris' },
      { value: 'Huacllán', label: 'Huacllán' },
      { value: 'La Merced', label: 'La Merced' },
      { value: 'Succha', label: 'Succha' },
    ],
    'Antonio Raymondi': [
      { value: 'Huaraz', label: 'Huaraz' },
      { value: 'Aija', label: 'Aija' },
      { value: 'Pariahuanca', label: 'Pariahuanca' },
      { value: 'Piscobamba', label: 'Piscobamba' },
      { value: 'Pampas', label: 'Pampas' },
    ],
    Asunción: [
      { value: 'Asunción', label: 'Asunción' },
      { value: 'Cerro Colorado', label: 'Cerro Colorado' },
      { value: 'La Huerta', label: 'La Huerta' },
      { value: 'Santa Cruz', label: 'Santa Cruz' },
      { value: 'San Miguel', label: 'San Miguel' },
    ],
    Bolognesi: [
      { value: 'Chiquián', label: 'Chiquián' },
      { value: 'Aco', label: 'Aco' },
      { value: 'Cajacay', label: 'Cajacay' },
      { value: 'La Primavera', label: 'La Primavera' },
      { value: 'Huallanca', label: 'Huallanca' },
      { value: 'Llamellín', label: 'Llamellín' },
      { value: 'Macashca', label: 'Macashca' },
      { value: 'San Luis de Shuaro', label: 'San Luis de Shuaro' },
    ],
    Carhuaz: [
      { value: 'Carhuaz', label: 'Carhuaz' },
      { value: 'Acopampa', label: 'Acopampa' },
      { value: 'Amparo', label: 'Amparo' },
      { value: 'Asunción', label: 'Asunción' },
      { value: 'Chacas', label: 'Chacas' },
      { value: 'Mancos', label: 'Mancos' },
      { value: 'San Miguel de Aco', label: 'San Miguel de Aco' },
      { value: 'Shilla', label: 'Shilla' },
    ],
    'Carlos Fermín Fitzcarrald': [
      { value: 'Yuracmarca', label: 'Yuracmarca' },
      { value: 'San Juan de Rontoy', label: 'San Juan de Rontoy' },
      { value: 'San Luis', label: 'San Luis' },
      { value: 'Ricardo Palma', label: 'Ricardo Palma' },
      { value: 'La Merced', label: 'La Merced' },
      { value: 'Caraz', label: 'Caraz' },
    ],
    Casma: [
      { value: 'Casma', label: 'Casma' },
      { value: 'Bolognesi', label: 'Bolognesi' },
      { value: 'Comandante Noel', label: 'Comandante Noel' },
      { value: 'Yaután', label: 'Yaután' },
      { value: 'Cáceres del Perú', label: 'Cáceres del Perú' },
    ],
    Corongo: [
      { value: 'Corongo', label: 'Corongo' },
      { value: 'Aco', label: 'Aco' },
      { value: 'Chimán', label: 'Chimán' },
      { value: 'Cusca', label: 'Cusca' },
      { value: 'La Pampa', label: 'La Pampa' },
      { value: 'Pichincha', label: 'Pichincha' },
    ],
    Huaraz: [
      { value: 'Huaraz', label: 'Huaraz' },
      { value: 'Cochabamba', label: 'Cochabamba' },
      { value: 'Colcabamba', label: 'Colcabamba' },
      { value: 'Huanchay', label: 'Huanchay' },
      { value: 'Independencia', label: 'Independencia' },
      { value: 'Jangas', label: 'Jangas' },
      { value: 'La Libertad', label: 'La Libertad' },
      { value: 'Olleros', label: 'Olleros' },
      { value: 'Pampas Chico', label: 'Pampas Chico' },
      { value: 'Pariacoto', label: 'Pariacoto' },
      { value: 'Pira', label: 'Pira' },
      { value: 'Recuay', label: 'Recuay' },
      { value: 'San Marcos', label: 'San Marcos' },
      { value: 'San Pedro', label: 'San Pedro' },
      { value: 'Yungar', label: 'Yungar' },
    ],
    Huari: [
      { value: 'Huari', label: 'Huari' },
      { value: 'Chavín de Huántar', label: 'Chavín de Huántar' },
      { value: 'Aczo', label: 'Aczo' },
      { value: 'Cajacay', label: 'Cajacay' },
      { value: 'Rapayán', label: 'Rapayán' },
      { value: 'San Marcos', label: 'San Marcos' },
      { value: 'San Pedro de Chana', label: 'San Pedro de Chana' },
      { value: 'Uco', label: 'Uco' },
    ],
    Huarmey: [
      { value: 'Huarmey', label: 'Huarmey' },
      { value: 'Cochapetí', label: 'Cochapetí' },
      { value: 'Huacho', label: 'Huacho' },
      { value: 'Lima', label: 'Lima' },
      { value: 'San Pedro', label: 'San Pedro' },
    ],
    Huaylas: [
      { value: 'Caraz', label: 'Caraz' },
      { value: 'Huallanca', label: 'Huallanca' },
      { value: 'Yuracmarca', label: 'Yuracmarca' },
      { value: 'San Luis', label: 'San Luis' },
      { value: 'San Juan de Rontoy', label: 'San Juan de Rontoy' },
      { value: 'Casma', label: 'Casma' },
    ],
    'Mariscal Luzuriaga': [
      { value: 'Lima', label: 'Lima' },
      { value: 'Toccha', label: 'Toccha' },
      { value: 'Jircan', label: 'Jircan' },
      { value: 'Yauyos', label: 'Yauyos' },
    ],
    Pallasca: [
      { value: 'Cabana', label: 'Cabana' },
      { value: 'Bolognesi', label: 'Bolognesi' },
      { value: 'Conchucos', label: 'Conchucos' },
      { value: 'Pampas', label: 'Pampas' },
      { value: 'Santa Rosa', label: 'Santa Rosa' },
      { value: 'Tauca', label: 'Tauca' },
    ],
    Pomabamba: [
      { value: 'Pomabamba', label: 'Pomabamba' },
      { value: 'Aco', label: 'Aco' },
      { value: 'Parobamba', label: 'Parobamba' },
      { value: 'San José de los Chillos', label: 'San José de los Chillos' },
      { value: 'Yupan', label: 'Yupan' },
    ],
    Recuay: [
      { value: 'Recuay', label: 'Recuay' },
      { value: 'Canchis', label: 'Canchis' },
      { value: 'Colcabamba', label: 'Colcabamba' },
      { value: 'La Libertad', label: 'La Libertad' },
      { value: 'Pampa', label: 'Pampa' },
    ],
    Santa: [
      { value: 'Chimbote', label: 'Chimbote' },
      { value: 'Cáceres del Perú', label: 'Cáceres del Perú' },
      { value: 'Coishco', label: 'Coishco' },
      { value: 'Macate', label: 'Macate' },
      { value: 'Moro', label: 'Moro' },
      { value: 'Nepeña', label: 'Nepeña' },
      { value: 'Samanco', label: 'Samanco' },
      { value: 'Santa', label: 'Santa' },
      { value: 'Santo Toribio', label: 'Santo Toribio' },
    ],
    Sihuas: [
      { value: 'Sihuas', label: 'Sihuas' },
      { value: 'Cochabamba', label: 'Cochabamba' },
      { value: 'Quiches', label: 'Quiches' },
      { value: 'Rahuapampa', label: 'Rahuapampa' },
      { value: 'San Juan de Rontoy', label: 'San Juan de Rontoy' },
    ],
    Yungay: [
      { value: 'Yungay', label: 'Yungay' },
      { value: 'Catarhuasi', label: 'Catarhuasi' },
      { value: 'Gonzalo Fernández Gasco', label: 'Gonzalo Fernández Gasco' },
      { value: 'Cachín', label: 'Cachín' },
      { value: 'Matara', label: 'Matara' },
      { value: 'Pira', label: 'Pira' },
    ]
  };
  const distritosApurímacData = {
    Abancay: [
      { value: 'Abancay', label: 'Abancay' },
      { value: 'Andahuaylas', label: 'Andahuaylas' },
      { value: 'Antabamba', label: 'Antabamba' },
      { value: 'Chacoche', label: 'Chacoche' },
      { value: 'Ccarhuayo', label: 'Ccarhuayo' },
      { value: 'Huanipaca', label: 'Huanipaca' },
      { value: 'Lambrama', label: 'Lambrama' },
      { value: 'Pachaconas', label: 'Pachaconas' },
      { value: 'San Juan de Chacña', label: 'San Juan de Chacña' },
      { value: 'Santa María de Chicmo', label: 'Santa María de Chicmo' },
    ],
    Andahuaylas: [
      { value: 'Andahuaylas', label: 'Andahuaylas' },
      { value: 'Chiara', label: 'Chiara' },
      { value: 'Navan', label: 'Navan' },
      { value: 'Pomacocha', label: 'Pomacocha' },
      { value: 'San Pedro de Andahuaylas', label: 'San Pedro de Andahuaylas' },
      { value: 'Saño', label: 'Saño' },
      { value: 'Talavera', label: 'Talavera' },
      { value: 'Turpo', label: 'Turpo' },
      { value: 'Cangallo', label: 'Cangallo' },
    ],
    Antabamba: [
      { value: 'Antabamba', label: 'Antabamba' },
      { value: 'Ahuaycha', label: 'Ahuaycha' },
      { value: 'Chalhuanca', label: 'Chalhuanca' },
      { value: 'Huaynacancha', label: 'Huaynacancha' },
      { value: 'Juan Espinoza Medrano', label: 'Juan Espinoza Medrano' },
      { value: 'Sancos', label: 'Sancos' },
      { value: 'Torrechayoc', label: 'Torrechayoc' },
    ],
    Aymaraes: [
      { value: 'Aymaraes', label: 'Aymaraes' },
      { value: 'Caraybamba', label: 'Caraybamba' },
      { value: 'Chacopampa', label: 'Chacopampa' },
      { value: 'Chapimarca', label: 'Chapimarca' },
      { value: 'Colcabamba', label: 'Colcabamba' },
      { value: 'Pachaconas', label: 'Pachaconas' },
      { value: 'Santo Tomas', label: 'Santo Tomas' },
      { value: 'Soraya', label: 'Soraya' },
    ],
    Cotabambas: [
      { value: 'Tambobamba', label: 'Tambobamba' },
      { value: 'Cotabambas', label: 'Cotabambas' },
      { value: 'Haquira', label: 'Haquira' },
      { value: 'Mara', label: 'Mara' },
      { value: 'Challhuahuacho', label: 'Challhuahuacho' },
      { value: 'Coyllurqui', label: 'Coyllurqui' },
    ],
    Chincheros: [
      { value: 'Chincheros', label: 'Chincheros' },
      { value: 'Anco-Huallo', label: 'Anco-Huallo' },
      { value: 'Cocharcas', label: 'Cocharcas' },
      { value: 'Huanipaca', label: 'Huanipaca' },
      { value: 'Ocobamba', label: 'Ocobamba' },
      { value: 'Quiñota', label: 'Quiñota' },
      { value: 'Turpo', label: 'Turpo' },
    ],
    Grau: [
      { value: 'Grau', label: 'Grau' },
      { value: 'Chacayan', label: 'Chacayan' },
      { value: 'Chongos Bajo', label: 'Chongos Bajo' },
      { value: 'Cochas', label: 'Cochas' },
      { value: 'El Porvenir', label: 'El Porvenir' },
      { value: 'Pachachaca', label: 'Pachachaca' },
      { value: 'San Pedro de Castrovirreyna', label: 'San Pedro de Castrovirreyna' },
      { value: 'San Juan de Chancay', label: 'San Juan de Chancay' },
    ],
  };
  const distritosArequipaData = {
    Arequipa: [
      { value: 'Arequipa', label: 'Arequipa' },
      { value: 'Alto Selva Alegre', label: 'Alto Selva Alegre' },
      { value: 'Cayma', label: 'Cayma' },
      { value: 'Characato', label: 'Characato' },
      { value: 'Chiguata', label: 'Chiguata' },
      { value: 'Hunter', label: 'Hunter' },
      { value: 'José Luis Bustamante y Rivero', label: 'José Luis Bustamante y Rivero' },
      { value: 'La Joya', label: 'La Joya' },
      { value: 'Miraflores', label: 'Miraflores' },
      { value: 'Mollebaya', label: 'Mollebaya' },
      { value: 'Paucarpata', label: 'Paucarpata' },
      { value: 'San Juan de Siguas', label: 'San Juan de Siguas' },
      { value: 'San Juan de Tarucani', label: 'San Juan de Tarucani' },
      { value: 'San Sebastián', label: 'San Sebastián' },
      { value: 'Santiago', label: 'Santiago' },
      { value: 'Sachaca', label: 'Sachaca' },
      { value: 'Yura', label: 'Yura' },
    ],
    Camaná: [
      { value: 'Camaná', label: 'Camaná' },
      { value: 'José María Quimper', label: 'José María Quimper' },
      { value: 'Mariano Nicolás Valcárcel', label: 'Mariano Nicolás Valcárcel' },
      { value: 'Nuevos Horizontes', label: 'Nuevos Horizontes' },
      { value: 'Ocoña', label: 'Ocoña' },
      { value: 'Punta de Bombón', label: 'Punta de Bombón' },
      { value: 'Samuel Pastor', label: 'Samuel Pastor' },
    ],
    Caravelí: [
      { value: 'Caravelí', label: 'Caravelí' },
      { value: 'Acarí', label: 'Acarí' },
      { value: 'Atico', label: 'Atico' },
      { value: 'Bella Unión', label: 'Bella Unión' },
      { value: 'Cahuacho', label: 'Cahuacho' },
      { value: 'Chala', label: 'Chala' },
      { value: 'Lomas', label: 'Lomas' },
      { value: 'Yauca', label: 'Yauca' },
    ],
    Castilla: [
      { value: 'Aplao', label: 'Aplao' },
      { value: 'Chachas', label: 'Chachas' },
      { value: 'Huancarqui', label: 'Huancarqui' },
      { value: 'Orcopampa', label: 'Orcopampa' },
      { value: 'Pampacolca', label: 'Pampacolca' },
      { value: 'Yanaquihua', label: 'Yanaquihua' },
    ],
    Caylloma: [
      { value: 'Chivay', label: 'Chivay' },
      { value: 'Achoma', label: 'Achoma' },
      { value: 'Cabanaconde', label: 'Cabanaconde' },
      { value: 'Callalli', label: 'Callalli' },
      { value: 'Coporaque', label: 'Coporaque' },
      { value: 'Huambo', label: 'Huambo' },
      { value: 'Huanca', label: 'Huanca' },
      { value: 'Ichupampa', label: 'Ichupampa' },
      { value: 'Lari', label: 'Lari' },
      { value: 'Madrigal', label: 'Madrigal' },
      { value: 'Mollepampa', label: 'Mollepampa' },
      { value: 'Pinchollo', label: 'Pinchollo' },
      { value: 'San Antonio de Chuca', label: 'San Antonio de Chuca' },
      { value: 'Tuti', label: 'Tuti' },
    ],
    Condesuyos: [
      { value: 'Chuquibamba', label: 'Chuquibamba' },
      { value: 'Andaray', label: 'Andaray' },
      { value: 'Cayarani', label: 'Cayarani' },
      { value: 'Chichas', label: 'Chichas' },
      { value: 'Iray', label: 'Iray' },
      { value: 'Río Grande', label: 'Río Grande' },
      { value: 'Salamanca', label: 'Salamanca' },
    ],
    Islay: [
      { value: 'Mollendo', label: 'Mollendo' },
      { value: 'Arequipa', label: 'Arequipa' },
      { value: 'Camarones', label: 'Camarones' },
      { value: 'Cocachacra', label: 'Cocachacra' },
      { value: 'Deán Valdivia', label: 'Deán Valdivia' },
      { value: 'Mejía', label: 'Mejía' },
      { value: 'Punta de Bombón', label: 'Punta de Bombón' },
    ],
    'La Unión': [
      { value: 'Huayna', label: 'Huayna' },
      { value: 'Andahuaylas', label: 'Andahuaylas' },
      { value: 'Condorcanqui', label: 'Condorcanqui' },
      { value: 'Uctubamba', label: 'Uctubamba' },
    ]
  };
  const distritosCallaoData = {
    Callao: [
      { value: 'Callao', label: 'Callao' },
      { value: 'Bellavista', label: 'Bellavista' },
      { value: 'Carmen de la Legua-Reynoso', label: 'Carmen de la Legua-Reynoso' },
      { value: 'La Perla', label: 'La Perla' },
      { value: 'La Punta', label: 'La Punta' },
      { value: 'Ventanilla', label: 'Ventanilla' },
      { value: 'San Miguel', label: 'San Miguel' },
    ]
  };
  const distritosLimaData = {
    Barranca: [
      { value: 'Barranca', label: 'Barranca' },
      { value: 'Paramonga', label: 'Paramonga' },
      { value: 'Pativilca', label: 'Pativilca' },
      { value: 'Supe', label: 'Supe' },
      { value: 'Supe Puerto', label: 'Supe Puerto' },
    ],
    Cajatambo: [
      { value: 'Cajatambo', label: 'Cajatambo' },
      { value: 'Copa', label: 'Copa' },
      { value: 'Gorgor', label: 'Gorgor' },
      { value: 'Huancapon', label: 'Huancapon' },
      { value: 'Manas', label: 'Manas' },
    ],
    Canta: [
      { value: 'Canta', label: 'Canta' },
      { value: 'Arahuay', label: 'Arahuay' },
      { value: 'Huamantanga', label: 'Huamantanga' },
      { value: 'Huaros', label: 'Huaros' },
      { value: 'Lachaqui', label: 'Lachaqui' },
      { value: 'San Buenaventura', label: 'San Buenaventura' },
      { value: 'Santa Rosa de Quives', label: 'Santa Rosa de Quives' },
    ],
    Cañete: [
      { value: 'San Vicente de Cañete', label: 'San Vicente de Cañete' },
      { value: 'Asia', label: 'Asia' },
      { value: 'Calango', label: 'Calango' },
      { value: 'Cerro Azul', label: 'Cerro Azul' },
      { value: 'Chilca', label: 'Chilca' },
      { value: 'Coayllo', label: 'Coayllo' },
      { value: 'Imperial', label: 'Imperial' },
      { value: 'Lunahuaná', label: 'Lunahuaná' },
      { value: 'Mala', label: 'Mala' },
      { value: 'Nuevo Imperial', label: 'Nuevo Imperial' },
      { value: 'Pacarán', label: 'Pacarán' },
      { value: 'Quilmaná', label: 'Quilmaná' },
      { value: 'San Antonio', label: 'San Antonio' },
      { value: 'Santa Cruz de Flores', label: 'Santa Cruz de Flores' },
      { value: 'Zúñiga', label: 'Zúñiga' },
    ],
    Huaral: [
      { value: 'Huaral', label: 'Huaral' },
      { value: 'Atavillos Alto', label: 'Atavillos Alto' },
      { value: 'Atavillos Bajo', label: 'Atavillos Bajo' },
      { value: 'Aucallama', label: 'Aucallama' },
      { value: 'Chancay', label: 'Chancay' },
      { value: 'Ihuari', label: 'Ihuari' },
      { value: 'Lampian', label: 'Lampian' },
      { value: 'Pacaraos', label: 'Pacaraos' },
      { value: 'San Miguel de Acos', label: 'San Miguel de Acos' },
      { value: 'Santa Cruz de Andamarca', label: 'Santa Cruz de Andamarca' },
      { value: 'Sumbilca', label: 'Sumbilca' },
      { value: 'Veintisiete de Noviembre', label: 'Veintisiete de Noviembre' },
    ],
    Huarochirí: [
      { value: 'Matucana', label: 'Matucana' },
      { value: 'Antioquia', label: 'Antioquia' },
      { value: 'Callahuanca', label: 'Callahuanca' },
      { value: 'Carampoma', label: 'Carampoma' },
      { value: 'Chicla', label: 'Chicla' },
      { value: 'Cuenca', label: 'Cuenca' },
      { value: 'Huachupampa', label: 'Huachupampa' },
      { value: 'Huanza', label: 'Huanza' },
      { value: 'Huarochirí', label: 'Huarochirí' },
      { value: 'Lahuaytambo', label: 'Lahuaytambo' },
      { value: 'Langa', label: 'Langa' },
      { value: 'Laraos', label: 'Laraos' },
      { value: 'Mariatana', label: 'Mariatana' },
      { value: 'Ricardo Palma', label: 'Ricardo Palma' },
      { value: 'San Andrés de Tupicocha', label: 'San Andrés de Tupicocha' },
      { value: 'San Antonio', label: 'San Antonio' },
      { value: 'San Bartolomé', label: 'San Bartolomé' },
      { value: 'San Damian', label: 'San Damian' },
      { value: 'San Juan de Iris', label: 'San Juan de Iris' },
      { value: 'San Juan de Tantaranche', label: 'San Juan de Tantaranche' },
      { value: 'San Lorenzo de Quinti', label: 'San Lorenzo de Quinti' },
      { value: 'San Mateo', label: 'San Mateo' },
      { value: 'San Mateo de Otao', label: 'San Mateo de Otao' },
      { value: 'San Pedro de Casta', label: 'San Pedro de Casta' },
      { value: 'San Pedro de Huancayre', label: 'San Pedro de Huancayre' },
      { value: 'Sangallaya', label: 'Sangallaya' },
      { value: 'Santa Cruz de Cocachacra', label: 'Santa Cruz de Cocachacra' },
      { value: 'Santa Eulalia', label: 'Santa Eulalia' },
      { value: 'Santiago de Anchucaya', label: 'Santiago de Anchucaya' },
      { value: 'Santiago de Tuna', label: 'Santiago de Tuna' },
      { value: 'Santo Domingo de los Olleros', label: 'Santo Domingo de los Olleros' },
      { value: 'Surco', label: 'Surco' },
    ],
    Huaura: [
      { value: 'Huacho', label: 'Huacho' },
      { value: 'Ambar', label: 'Ambar' },
      { value: 'Caleta de Carquín', label: 'Caleta de Carquín' },
      { value: 'Checras', label: 'Checras' },
      { value: 'Hualmay', label: 'Hualmay' },
      { value: 'Huaura', label: 'Huaura' },
      { value: 'Leoncio Prado', label: 'Leoncio Prado' },
      { value: 'Paccho', label: 'Paccho' },
      { value: 'Santa Leonor', label: 'Santa Leonor' },
      { value: 'Santa María', label: 'Santa María' },
      { value: 'Sayán', label: 'Sayán' },
      { value: 'Vegueta', label: 'Vegueta' },
    ],
    Lima: [
      { value: 'Ancón', label: 'Ancón' },
      { value: 'Ate', label: 'Ate' },
      { value: 'Barranco', label: 'Barranco' },
      { value: 'Breña', label: 'Breña' },
      { value: 'Carabayllo', label: 'Carabayllo' },
      { value: 'Chaclacayo', label: 'Chaclacayo' },
      { value: 'Chorrillos', label: 'Chorrillos' },
      { value: 'Cieneguilla', label: 'Cieneguilla' },
      { value: 'Comas', label: 'Comas' },
      { value: 'El Agustino', label: 'El Agustino' },
      { value: 'Independencia', label: 'Independencia' },
      { value: 'Jesús María', label: 'Jesús María' },
      { value: 'La Molina', label: 'La Molina' },
      { value: 'La Victoria', label: 'La Victoria' },
      { value: 'Lince', label: 'Lince' },
      { value: 'Los Olivos', label: 'Los Olivos' },
      { value: 'Lurigancho-Chosica', label: 'Lurigancho-Chosica' },
      { value: 'Lurín', label: 'Lurín' },
      { value: 'Magdalena del Mar', label: 'Magdalena del Mar' },
      { value: 'Pueblo Libre', label: 'Pueblo Libre' },
      { value: 'Miraflores', label: 'Miraflores' },
      { value: 'Pachacámac', label: 'Pachacámac' },
      { value: 'Pucusana', label: 'Pucusana' },
      { value: 'Puente Piedra', label: 'Puente Piedra' },
      { value: 'Rímac', label: 'Rímac' },
      { value: 'San Bartolo', label: 'San Bartolo' },
      { value: 'San Borja', label: 'San Borja' },
      { value: 'San Isidro', label: 'San Isidro' },
      { value: 'San Juan de Lurigancho', label: 'San Juan de Lurigancho' },
      { value: 'San Juan de Miraflores', label: 'San Juan de Miraflores' },
      { value: 'San Luis', label: 'San Luis' },
      { value: 'San Martín de Porres', label: 'San Martín de Porres' },
      { value: 'San Miguel', label: 'San Miguel' },
      { value: 'Santa Anita', label: 'Santa Anita' },
      { value: 'Santa María del Mar', label: 'Santa María del Mar' },
      { value: 'Santa Rosa', label: 'Santa Rosa' },
      { value: 'Santiago de Surco', label: 'Santiago de Surco' },
      { value: 'Surquillo', label: 'Surquillo' },
      { value: 'Villa El Salvador', label: 'Villa El Salvador' },
      { value: 'Villa María del Triunfo', label: 'Villa María del Triunfo' },
      { value: 'San Sebastián', label: 'San Sebastián' },
      { value: 'Santa Eulalia', label: 'Santa Eulalia' },
      { value: 'Ricardo Palma', label: 'Ricardo Palma' },
    ],
    Oyón: [
      { value: 'Oyón', label: 'Oyón' },
      { value: 'Andajes', label: 'Andajes' },
      { value: 'Caujul', label: 'Caujul' },
      { value: 'Cochamarca', label: 'Cochamarca' },
      { value: 'Naván', label: 'Naván' },
      { value: 'Pachangara', label: 'Pachangara' },
    ],
    Yauyos: [
      { value: 'Yauyos', label: 'Yauyos' },
      { value: 'Alis', label: 'Alis' },
      { value: 'Allauca', label: 'Allauca' },
      { value: 'Ayavirí', label: 'Ayavirí' },
      { value: 'Azángaro', label: 'Azángaro' },
      { value: 'Cacra', label: 'Cacra' },
      { value: 'Carania', label: 'Carania' },
      { value: 'Catahuasi', label: 'Catahuasi' },
      { value: 'Chocos', label: 'Chocos' },
      { value: 'Cochas', label: 'Cochas' },
      { value: 'Colonia', label: 'Colonia' },
      { value: 'Hongos', label: 'Hongos' },
      { value: 'Huampara', label: 'Huampara' },
      { value: 'Huancaya', label: 'Huancaya' },
      { value: 'Huangáscar', label: 'Huangáscar' },
      { value: 'Huantán', label: 'Huantán' },
      { value: 'Huañec', label: 'Huañec' },
      { value: 'Laraos', label: 'Laraos' },
      { value: 'Lincha', label: 'Lincha' },
      { value: 'Madean', label: 'Madean' },
      { value: 'Miraflores', label: 'Miraflores' },
      { value: 'Omas', label: 'Omas' },
      { value: 'Putinza', label: 'Putinza' },
      { value: 'Quinches', label: 'Quinches' },
      { value: 'Quinocay', label: 'Quinocay' },
      { value: 'San Joaquín', label: 'San Joaquín' },
      { value: 'San Pedro de Pilas', label: 'San Pedro de Pilas' },
      { value: 'Tanta', label: 'Tanta' },
      { value: 'Tauripampa', label: 'Tauripampa' },
      { value: 'Tomas', label: 'Tomas' },
      { value: 'Tupe', label: 'Tupe' },
      { value: 'Viñac', label: 'Viñac' },
      { value: 'Vitis', label: 'Vitis' },
    ],
  };
  const distritosPorDepartamentoProvincia = {
    Áncash: distritosAncashData,
    Arequipa: distritosArequipaData,
    Amazonas: distritosAmazonasData,
    Apurímac: distritosApurímacData,
    Callao: distritosCallaoData,
    Lima: distritosLimaData,
  };
  const [provinciasSeleccionadas, setProvinciasSeleccionadas] = useState([]);
  const [distritosSeleccionados, setDistritosSeleccionados] = useState([]);
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);
  const [estadosEntregaDisponibles, setEstadosEntregaDisponibles] = useState([]);
  const [almacenesDisponibles, setAlmacenesDisponibles] = useState(['TODOS', 'LIMA', 'PROVINCIA']);

  //----------------Fin Array de distritos y provincias -------//


  const handleFiltroChange = (campo, valor) => {
    setFiltros({ ...filtros, [campo]: valor });
  };

  useEffect(() => {
    const cargarTodosLosPedidos = async () => {
      try {
        setLoading(true);
        console.log('Cargando TODOS los pedidos desde Shopify...');

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

        console.log(`TOTAL DE PEDIDOS CARGADOS: ${allOrders.length}`);

        const estadosInternos = await fetchEstadosPedidos();

        let ventasOrders = [];
        let almacenOrders = [];
        try {
          ventasOrders = await fetchVentasPedidosAsignados();
          almacenOrders = await fetchAlmacenPedidosAsignados();
        } catch (err) {
          console.error('❌ Error cargando asignaciones:', err);
          setError('Error cargando asignaciones de ventas o almacén');
        }

        const estadosVentas = await fetchSeguimientoVentas();
        console.log('📥 Estados de seguimiento cargados:', estadosVentas);


        const pedidosFormateados = allOrders.map(order => {
          const estado = mapShopifyStatus(order);
          const estadoAdicional = mapDeliveryStatus(order);
          const trazabilidad = getTrazabilidadStatus(order);
          const ubicacion = getLocationFromOrder(order);
          const almacen = getAlmacenFromLocation(ubicacion);
          const estadoInterno = estadosInternos.find(e => Number(e.shopify_order_id) === Number(order.id));
          const ventaAsignada = ventasOrders.find(v => Number(v.shopify_order_id) === Number(order.id));
          const almacenAsignado = almacenOrders.find(a => Number(a.shopify_order_id) === Number(order.id));
          const seguimientoVenta = estadosVentas.find(s => Number(s.shopify_order_id) === Number(order.id));

          return {
            id: order.name || `#${order.order_number}`,
            orderNumber: order.order_number,
            shopifyId: order.id,
            estadoSeguimiento: seguimientoVenta?.estado || 'Pendiente',
            estado_pago: estadoInterno?.estado_pago,
            estado_preparacion: estadoInterno?.estado_preparacion,
            responsable: ventaAsignada?.responsable || null,
            responsable_almacen: almacenAsignado?.responsable_almacen || null,
            cliente: getNoteAttributeValue(order, 'Nombre y Apellidos') !== 'No disponible'
              ? getNoteAttributeValue(order, 'Nombre y Apellidos')
              : (order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : order.email || 'Cliente no registrado'),

            telefono: getNoteAttributeValue(order, 'Celular') !== 'No disponible'
              ? getNoteAttributeValue(order, 'Celular')
              : (order.phone || 'Sin teléfono'),

            ubicacion: ubicacion,
            almacen: almacen,

            estado: estado,
            estadoAdicional: estadoAdicional,

            financial_status: order.financial_status,
            fulfillment_status: order.fulfillment_status,

            importes: {
              total: `${order.presentment_currency || 'PEN'} ${order.current_total_price || order.total_price || '0.00'}`,
              subtotal: order.subtotal_price || '0.00',
              currency: order.presentment_currency || order.currency || 'PEN',
              detalles: order.line_items ? order.line_items.map(item => ({
                descripcion: `${item.quantity || 1} ${item.name || 'Producto'}`,
                valor: `${order.presentment_currency || 'PEN'} ${item.price || '0.00'}`
              })) : []
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

        setPedidos(pedidosFormateados);
        setPedidosOriginales(pedidosFormateados);

        const estadosUnicos = [...new Set(pedidosFormateados.map(p => p.estado))].filter(Boolean);
        const estadosEntregaUnicos = [...new Set(pedidosFormateados.map(p => p.estadoAdicional))].filter(Boolean);

        setEstadosDisponibles(estadosUnicos);
        setEstadosEntregaDisponibles(estadosEntregaUnicos);

      } catch (err) {
        console.error('❌ Error al cargar pedidos:', err);

        setError(err.message || 'Error al cargar pedidos');

      } finally {
        setLoading(false);
      }
    };

    cargarTodosLosPedidos();
  }, []);



  const fetchOrdersWithPagination = async (page = 1, limit = 250) => {
    try {
      const API_BASE_URL = 'https://psicologosenlima.com/shopify/public/api';

      const urls = [
        `${API_BASE_URL}/shopify/orders?limit=${limit}&page=${page}`,
        `${API_BASE_URL}/shopify/orders?limit=${limit}&page_info=${page}`,
        `${API_BASE_URL}/shopify/orders?per_page=${limit}&page=${page}`,
        `${API_BASE_URL}/shopify/orders`
      ];

      for (const url of urls) {
        try {
          console.log(`Intentando URL: ${url}`);
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data && Array.isArray(data.orders)) {
            return data.orders;
          }
        } catch (urlError) {
          console.warn(`Error con URL ${url}:`, urlError.message);
        }
      }

      throw new Error("No se pudo cargar con ninguna URL de paginación");
    } catch (error) {
      console.error("Error en fetchOrdersWithPagination:", error);
      throw error;
    }
  };

  const handleFormChange = (e) => {
    setNuevoPedido({ ...nuevoPedido, [e.target.name]: e.target.value });

    if (e.target.name === 'departamento') {
      const departamentoSeleccionado = e.target.value;
      const provincias = provinciasPorDepartamento[departamentoSeleccionado] || [];
      setProvinciasSeleccionadas(provincias);
      setNuevoPedido(prevState => ({ ...prevState, provincia: '', distrito: '' }));
      setDistritosSeleccionados([]);
    } else if (e.target.name === 'provincia') {
      const departamentoSeleccionado = nuevoPedido.departamento;
      const provinciaSeleccionada = e.target.value;
      const distritos = distritosPorDepartamentoProvincia[departamentoSeleccionado]?.[provinciaSeleccionada] || [];

      setDistritosSeleccionados(distritos);
      setNuevoPedido(prevState => ({ ...prevState, distrito: '' }));
    }
  };

  const handleTrazabilidadChange = (pedidoId, nuevoEstado) => {
    console.log(`Cambiando trazabilidad de ${pedidoId} a ${nuevoEstado}`);

    setPedidos(prev => prev.map(pedido =>
      pedido.id === pedidoId
        ? { ...pedido, trazabilidad: nuevoEstado }
        : pedido
    ));

    setPedidosOriginales(prev => prev.map(pedido =>
      pedido.id === pedidoId
        ? { ...pedido, trazabilidad: nuevoEstado }
        : pedido
    ));
  };

  const handleProductoChange = (e) => {
    setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.value });
  };

  const agregarProducto = () => {
    if (nuevoProducto.descripcion && nuevoProducto.precio) {
      setNuevoPedido({
        ...nuevoPedido,
        productos: [...nuevoPedido.productos, {
          descripcion: `${nuevoProducto.cantidad} ${nuevoProducto.descripcion}`,
          valor: `S/ ${nuevoProducto.precio}`
        }]
      });
      setNuevoProducto({ descripcion: '', cantidad: 1, precio: '' });
    }
  };

  const guardarPedido = () => {
    setDrawerOpen(false);
    setNuevoPedido(estadoInicial);
  };

  const pedidosFiltrados = pedidosOriginales.filter(pedido => {
    const { fechaInicio, fechaFin, searchTerm, tipoFecha } = filtros;

    // Mostrar componentes por roles
    if (isVendedor && (!pedido.responsable || Number(pedido.responsable.id) !== userId)) { //--
      return false; //--
    } //-------------------------

    // Estado de pago: prioriza el interno, si no existe usa Shopify
    const estadoPago = pedido.estado_pago || (pedido.financial_status === 'paid' ? 'pagado' : 'pendiente');
    if (filtroPago) {
      if (filtroPago === "pendiente" && estadoPago === "pagado") return false;
      if (filtroPago === "pagado" && estadoPago !== "pagado") return false;
    }

    // Estado de preparación: prioriza el interno, si no existe usa Shopify
    const estadoPreparacion = pedido.estado_preparacion || (pedido.fulfillment_status === 'fulfilled' ? 'preparado' : 'no_preparado');
    if (filtroPreparado === "preparado" && estadoPreparacion !== "preparado") return false;
    if (filtroPreparado === "no_preparado" && estadoPreparacion !== "no_preparado") return false;

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
      const matchesVendedor = pedido.vendedor?.nombre && pedido.vendedor.nombre.toLowerCase().includes(searchLower);

      if (!matchesCliente && !matchesId && !matchesTelefono && !matchesUbicacion && !matchesNote && !matchesTags && !matchesVendedor) {
        return false;
      }
    }

    return true;
  });

  const pedidosPaginados = pedidosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Cargando pedidos desde Shopify...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">Error al cargar pedidos</Typography>
        <Typography variant="body1">{error}</Typography>
        <Typography variant="body2">Verifique que el servidor backend esté en ejecución y que las credenciales de Shopify sean correctas.</Typography>
      </Box>
    );
  }

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
      <Button
        variant="outlined"
        sx={{
          color: "#09C46B",
          borderColor: "#09C46B",
          backgroundColor: "#fff",
          fontWeight: "bold",
          "&:hover": {
            borderColor: "#09C46B",
            backgroundColor: "#E9FBF2",
          },
        }}
        onClick={handleExportar}
      >
        Exportar
      </Button>

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
          Nuevo Pedido
        </Button>

        <TextField
          placeholder="Buscar por cliente, pedido, teléfono, ubicación o vendedor..."
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

        <FormControl size="small">
          <Select
            value={filtroPago}
            onChange={(e) => setFiltroPago(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pendiente">Pago pendiente</MenuItem>
            <MenuItem value="pagado">Pagado</MenuItem>
          </Select>
          <Typography variant="caption" sx={{ ml: 1 }}>
            Estado de pago
          </Typography>
        </FormControl>

        <FormControl size="small">
          <Select
            value={filtroPreparado}
            onChange={(e) => setFiltroPreparado(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="preparado">Preparado</MenuItem>
            <MenuItem value="no_preparado">No preparado</MenuItem>
          </Select>
          <Typography variant="caption" sx={{ ml: 1 }}>
            Estado de entrega
          </Typography>
        </FormControl>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
            Filtrar por:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 140, bgcolor: "white" }}>
            <Select
              value={filtros.tipoFecha}
              onChange={(e) => handleFiltroChange("tipoFecha", e.target.value)}
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
            onChange={(e) => handleFiltroChange("fechaInicio", e.target.value)}
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

        <Button
          variant="outlined"
          startIcon={<FilterList />}
          sx={{ bgcolor: "white", borderColor: "#4763e4", color: "#4763e4" }}
          onClick={() => {
            setFiltros({
              estado: "PENDIENTE",
              almacen: "TODOS",
              tipoFecha: "ingreso",
              fechaInicio: "",
              fechaFin: "",
              searchTerm: "",
            });
          }}
        >
          Limpiar filtros
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ mb: 4, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
      >
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f3f4f6" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Orden Pedido</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Cliente</TableCell>
              {!isVendedor && <TableCell sx={{ fontWeight: "bold" }}>Vendedor</TableCell>}
              <TableCell sx={{ fontWeight: "bold" }}>Estado del Pedido</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Almacén</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Estado de Pago</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Estado Preparación Pedido</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Detalle de Pedido
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Dirección</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Nota</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No hay pedidos encontrados.
                </TableCell>
              </TableRow>
            ) : (
              pedidosPaginados.map((pedido) => (
                <TableRow key={pedido.id} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                  <TableCell>{pedido.id}</TableCell>
                  <TableCell>
                    <Box sx={{ fontSize: "0.75rem" }}>
                      <FechaItem
                        label="Ingreso"
                        fecha={pedido.fechas?.ingreso || "-"}
                      />
                      <FechaItem
                        label="Registro"
                        fecha={pedido.fechas?.registro || "-"}
                      />
                      <FechaItem
                        label="Despacho"
                        fecha={pedido.fechas?.despacho || "-"}
                      />
                      <FechaItem
                        label="Entrega"
                        fecha={pedido.fechas?.entrega || "-"}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150 }}>
                    <Typography noWrap>{pedido.cliente || "-"}</Typography>
                  </TableCell>
                  {!isVendedor && (
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {pedido.responsable?.nombre_completo ? (
                          <Typography variant="body2">{pedido.responsable.nombre_completo}</Typography>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleAbrirAsignarVendedor(pedido)}
                            sx={{ borderColor: "#4763e4", color: "#4763e4" }}
                          >
                            Asignar
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  )}
                  <TableCell>
                    {console.log('Estado seguimiento para pedido', pedido.id, ':', pedido.estadoSeguimiento)}
                    <FormControl size="small">
                      <Select
                        value={pedido.estadoSeguimiento || 'PENDIENTE'}
                        onChange={async (e) => {
                          const nuevoEstado = e.target.value;
                          const ok = await confirm({
                            title: '¿Confirmar cambio de estado?',
                            text: `¿Cambiar el estado del pedido #${pedido.id} a ${nuevoEstado}?`,
                            confirmButtonColor: '#4D68E6',
                            confirmButtonText: 'Sí, cambiar',
                          });
                          if (!ok) return;

                          try {
                            const seguimientoData = {
                              shopify_order_id: Number(pedido.shopifyId),
                              estado: nuevoEstado,
                              responsable_id: pedido.responsable?.id || null,
                              area: 'Ventas',
                              mensaje: `El pedido #${pedido.id} cambió a ${nuevoEstado}.`,
                              tipo: 'CAMBIO_ESTADO',
                            };
                            const response = await createSeguimiento(seguimientoData);
                            if (response) {
                              setPedidos(prev =>
                                prev.map(p =>
                                  p.shopifyId === pedido.shopifyId ? { ...p, estadoSeguimiento: nuevoEstado } : p
                                )
                              );
                              setPedidosOriginales(prev =>
                                prev.map(p =>
                                  p.shopifyId === pedido.shopifyId ? { ...p, estadoSeguimiento: nuevoEstado } : p
                                )
                              );
                              Swal.fire({
                                title: '¡Estado actualizado!',
                                text: `El pedido #${pedido.id} ahora está en ${nuevoEstado}.`,
                                icon: 'success',
                                confirmButtonText: 'OK',
                              });
                            }
                          } catch (error) {
                            console.error('❌ Error al actualizar estado:', error);
                            Swal.fire({
                              title: 'Error',
                              text: 'No se pudo actualizar el estado.',
                              icon: 'error',
                              confirmButtonText: 'OK',
                            });
                          }
                        }}
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                        <MenuItem value="Confirmado">Confirmado</MenuItem>
                        <MenuItem value="Cancelado">Cancelado</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {pedido.responsable_almacen?.nombre_completo ? (
                        <Typography variant="body2">{pedido.responsable_almacen.nombre_completo}</Typography>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleAbrirAsignarUsuarioAlmacen(pedido)}
                          sx={{ borderColor: "#4763e4", color: "#4763e4" }}
                        >
                          Asignar
                        </Button>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={
                        (pedido.estado_pago ||
                          (pedido.financial_status === "paid"
                            ? "pagado"
                            : "pendiente")) === "pagado"
                      }
                      onClick={async () => {
                        const estadoActual =
                          pedido.estado_pago ||
                          (pedido.financial_status === "paid"
                            ? "pagado"
                            : "pendiente");
                        const nuevoEstado =
                          estadoActual === "pagado" ? "pendiente" : "pagado";

                        const ok = await confirm({
                          title: "¿Confirmar cambio de estado de pago?",
                          text: `¿Estás seguro de que deseas marcar este pedido como ${nuevoEstado === "pagado" ? "pagado" : "pendiente"
                            }?`,
                          confirmButtonColor: "#4D68E6",
                          confirmButtonText: "Sí, cambiar",
                        });
                        if (!ok) return;

                        const res = await actualizarEstadoInternoPago(
                          pedido.shopifyId,
                          nuevoEstado
                        );
                        if (res?.data && res.data.message) {
                          setPedidos((prev) =>
                            prev.map((p) =>
                              p.shopifyId === pedido.shopifyId
                                ? { ...p, estado_pago: nuevoEstado }
                                : p
                            )
                          );
                          setPedidosOriginales((prev) =>
                            prev.map((p) =>
                              p.shopifyId === pedido.shopifyId
                                ? { ...p, estado_pago: nuevoEstado }
                                : p
                            )
                          );
                          if (nuevoEstado === "pagado") {
                            console.log("➡ Enviando notificación de pago al backend...");
                            const respuesta = await crearNotificacionAlmacen({
                              shopify_order_id: Number(pedido.shopifyId),
                              mensaje: `El pedido ${pedido.id} ha sido marcado como pagado.`,
                              tipo: "PAGO_CONFIRMADO"
                            });
                            console.log("✅ Respuesta backend:", respuesta);
                          }

                        }
                      }}
                      sx={
                        (pedido.estado_pago ||
                          (pedido.financial_status === "paid"
                            ? "pagado"
                            : "pendiente")) === "pagado"
                          ? {
                            backgroundColor: "#b0b0b0",
                            color: "#222",
                            textTransform: "none",
                            fontWeight: "bold",
                            boxShadow: "none",
                            opacity: 1,
                          }
                          : {
                            backgroundColor: "#f0c47c",
                            color: "#000",
                            textTransform: "none",
                            fontWeight: "bold",
                            boxShadow: "none",
                            opacity: 1,
                            "&:hover": {
                              backgroundColor: "#e6a05d",
                              color: "#000",
                            },
                          }
                      }
                    >
                      {(pedido.estado_pago ||
                        (pedido.financial_status === "paid"
                          ? "pagado"
                          : "pendiente")) === "pagado"
                        ? "Pagado"
                        : "Pago pendiente"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={
                        (pedido.estado_preparacion ||
                          (pedido.fulfillment_status === "fulfilled"
                            ? "preparado"
                            : "no_preparado")) === "preparado"
                      }
                      onClick={async () => {
                        const estadoActual =
                          pedido.estado_preparacion ||
                          (pedido.fulfillment_status === "fulfilled"
                            ? "preparado"
                            : "no_preparado");
                        const nuevoEstado =
                          estadoActual === "preparado"
                            ? "no_preparado"
                            : "preparado";

                        const ok = await confirm({
                          title: "¿Confirmar preparación?",
                          text: `¿Estás seguro de que deseas marcar este pedido como ${nuevoEstado === "preparado"
                            ? "preparado"
                            : "no preparado"
                            }?`,
                          confirmButtonColor: "#09C46B",
                          confirmButtonText: "Sí, preparar",
                        });
                        if (!ok) return;

                        const res = await actualizarEstadoInternoPreparacion(
                          pedido.shopifyId,
                          nuevoEstado
                        );
                        if (res?.data && res.data.message) {
                          setPedidos((prev) =>
                            prev.map((p) =>
                              p.shopifyId === pedido.shopifyId
                                ? { ...p, estado_preparacion: nuevoEstado }
                                : p
                            )
                          );
                          setPedidosOriginales((prev) =>
                            prev.map((p) =>
                              p.shopifyId === pedido.shopifyId
                                ? { ...p, estado_preparacion: nuevoEstado }
                                : p
                            )
                          );
                        }
                      }}
                      sx={
                        (pedido.estado_preparacion ||
                          (pedido.fulfillment_status === "fulfilled"
                            ? "preparado"
                            : "no_preparado")) === "preparado"
                          ? {
                            backgroundColor: "#555",
                            color: "#fff",
                            textTransform: "none",
                            fontWeight: "bold",
                            boxShadow: "none",
                            opacity: 1,
                          }
                          : {
                            backgroundColor: "#faea88",
                            color: "#000",
                            textTransform: "none",
                            fontWeight: "bold",
                            boxShadow: "none",
                            opacity: 1,
                            "&:hover": {
                              backgroundColor: "#f5d94f",
                              color: "#000",
                            },
                          }
                      }
                    >
                      {(pedido.estado_preparacion ||
                        (pedido.fulfillment_status === "fulfilled"
                          ? "preparado"
                          : "no_preparado")) === "preparado"
                        ? "Preparado"
                        : "No preparado"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ borderColor: "#4763e4", color: "#4763e4" }}
                      onClick={() => navigate(`/pedidos/${pedido.shopifyId}`)}
                    >
                      Ver detalle
                    </Button>
                  </TableCell>
                  <TableCell>{pedido.ubicacion || "-"}</TableCell>
                  <TableCell>
                    <NotaEditable
                      nota={pedido.note}
                      onSave={(nuevaNota) => {
                        setPedidos((prev) =>
                          prev.map((p) =>
                            p.id === pedido.id ? { ...p, note: nuevaNota } : p
                          )
                        );
                      }}
                      Icono={NotaIcono}
                    />
                  </TableCell>
                 
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={pedidosFiltrados.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Pedidos por página"
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      </TableContainer>

      {!isVendedor && (
        <Dialog open={modalAsignarOpen} onClose={() => setModalAsignarOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Asignar Vendedor al Pedido #{pedidoSeleccionado?.id || ''}
          </DialogTitle>
          <DialogContent sx={{ minWidth: 500 }}>
            <FormControl fullWidth size="small">
              <Select
                value={vendedorAsignado}
                onChange={(e) => setVendedorAsignado(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">
                  <em>Seleccionar vendedor</em>
                </MenuItem>
                {Array.isArray(vendedores) && vendedores.length > 0 ? (
                  vendedores.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.nombre_completo} ({v.correo})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {loadingVendedores ? 'Cargando vendedores...' : 'No hay vendedores disponibles'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalAsignarOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              color="primary"
              disabled={!vendedorAsignado || loadingVendedores}
              onClick={handleAsignarVendedor}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Dialog open={modalAsignarAlmacenOpen} onClose={() => setModalAsignarAlmacenOpen(false)} maxWidth="sm" fullWidth>
        {console.log('📦 Renderizando modal de almacén:', {
          modalAsignarAlmacenOpen,
          usuariosAlmacen,
          usuariosAlmacenLength: usuariosAlmacen.length,
          isArray: Array.isArray(usuariosAlmacen),
          loadingUsuariosAlmacen,
          usuarioAlmacenAsignado
        })}
        <DialogTitle>
          Asignar Usuario de Almacén al Pedido #{pedidoSeleccionado?.id || ''}
        </DialogTitle>
        <DialogContent sx={{ minWidth: 500 }}>

          <FormControl fullWidth size="small">

            <Select
              value={usuarioAlmacenAsignado}
              onChange={(e) => setUsuarioAlmacenAsignado(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Seleccionar usuario de almacén</em>
              </MenuItem>
              {Array.isArray(usuariosAlmacen) && usuariosAlmacen.length > 0 ? (
                usuariosAlmacen.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.nombre_completo} ({u.correo})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  {loadingUsuariosAlmacen ? 'Cargando usuarios de almacén...' : 'No hay usuarios de almacén disponibles'}
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalAsignarAlmacenOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!usuarioAlmacenAsignado || loadingUsuariosAlmacen}
            onClick={handleAsignarUsuarioAlmacen}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Pedido</DialogTitle>
        <DialogContent sx={{ minWidth: 500, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Cliente"
            value={pedidoEditado.cliente}
            onChange={(e) => setPedidoEditado({ ...pedidoEditado, cliente: e.target.value })}
            fullWidth
            size="small"
          />
          <FormControl fullWidth size="small">
            <InputLabel>Vendedor</InputLabel>
            <Select
              value={pedidoEditado.vendedor_id || ''}
              onChange={(e) => setPedidoEditado({ ...pedidoEditado, vendedor_id: e.target.value })}
              label="Vendedor"
            >
              <MenuItem value="">
                <em>Sin asignar</em>
              </MenuItem>
              {vendedores.map((vendedor) => (
                <MenuItem key={vendedor.id} value={vendedor.id}>
                  {vendedor.nombre_completo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Teléfono"
            value={pedidoEditado.telefono}
            onChange={(e) => setPedidoEditado({ ...pedidoEditado, telefono: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Dirección"
            value={pedidoEditado.direccion}
            onChange={(e) => setPedidoEditado({ ...pedidoEditado, direccion: e.target.value })}
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              setModalOpen(false);
              try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/pedido-interno/${pedidoSeleccionado.shopifyId}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(pedidoEditado),
                });

                if (res.ok) {
                  const vendedorSeleccionado = vendedores.find((v) => v.id === pedidoEditado.vendedor_id);
                  setPedidos((prev) =>
                    prev.map((p) =>
                      p.id === pedidoSeleccionado.id
                        ? {
                          ...p,
                          ...pedidoEditado,
                          vendedor: vendedorSeleccionado || null,
                        }
                        : p
                    )
                  );
                  setPedidosOriginales((prev) =>
                    prev.map((p) =>
                      p.id === pedidoSeleccionado.id
                        ? {
                          ...p,
                          ...pedidoEditado,
                          vendedor: vendedorSeleccionado || null,
                        }
                        : p
                    )
                  );
                  Swal.fire({
                    title: '¡Pedido actualizado!',
                    text: 'La información del pedido se actualizó correctamente.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                  });
                } else {
                  throw new Error('No se pudo actualizar el pedido');
                }
              } catch (error) {
                Swal.fire({
                  title: 'Error',
                  text: 'No se pudo conectar al servidor.',
                  icon: 'error',
                  confirmButtonText: 'OK',
                });
              }
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "500px",
            boxSizing: "border-box",
            padding: 3,
          },
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Nuevo Pedido
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Nueva Orden
            </Typography>

            <TextField
              label="Nota"
              name="nota"
              value={nuevoPedido.nota}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={3}
              size="small"
            />

            <FormControl fullWidth size="small">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  component="span"
                  color="error"
                  sx={{ minWidth: "8px" }}
                >
                  *
                </Typography>
                <Typography variant="body2">Canal:</Typography>
              </Box>
              <Select
                name="canal"
                value={nuevoPedido.canal}
                onChange={handleFormChange}
              >
                <MenuItem value="Shopify">Shopify</MenuItem>
                <MenuItem value="Instagram">Instagram</MenuItem>
                <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                <MenuItem value="Facebook">Facebook</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography component="span" color="error" sx={{ minWidth: "8px" }}>*</Typography>
                <Typography variant="body2">Vendedor:</Typography>
              </Box>
              <Select
                name="vendedor"
                value={nuevoPedido.vendedor}
                onChange={handleFormChange}
                disabled={loadingVendedores}
              >
                <MenuItem value="">
                  <em>Seleccionar vendedor</em>
                </MenuItem>
                {Array.isArray(vendedores) && vendedores.length > 0 ? (
                  vendedores.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.nombre_completo} ({v.correo})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {loadingVendedores ? 'Cargando vendedores...' : 'No hay vendedores disponibles'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              Cliente
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                component="span"
                color="error"
                sx={{ minWidth: "8px" }}
              >
                *
              </Typography>
              <Typography variant="body2">Nombres y Apellidos:</Typography>
            </Box>
            <TextField
              name="cliente"
              value={nuevoPedido.cliente}
              onChange={handleFormChange}
              fullWidth
              size="small"
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                component="span"
                color="error"
                sx={{ minWidth: "8px" }}
              >
                *
              </Typography>
              <Typography variant="body2">Móvil:</Typography>
            </Box>
            <TextField
              name="telefono"
              value={nuevoPedido.telefono}
              onChange={handleFormChange}
              fullWidth
              size="small"
            />

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              Entrega
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                component="span"
                color="error"
                sx={{ minWidth: "8px" }}
              >
                *
              </Typography>
              <Typography variant="body2">Departamento:</Typography>
            </Box>
            <FormControl fullWidth size="small">
              <Select
                name="departamento"
                value={nuevoPedido.departamento}
                onChange={handleFormChange}
              >
                <MenuItem value="Amazonas">Amazonas</MenuItem>
                <MenuItem value="Áncash">Áncash</MenuItem>
                <MenuItem value="Apurímac">Apurímac</MenuItem>
                <MenuItem value="Arequipa">Arequipa</MenuItem>
                <MenuItem value="Ayacucho">Ayacucho</MenuItem>
                <MenuItem value="Cajamarca">Cajamarca</MenuItem>
                <MenuItem value="Callao">Callao</MenuItem>
                <MenuItem value="Cusco">Cusco</MenuItem>
                <MenuItem value="Huancavelica">Huancavelica</MenuItem>
                <MenuItem value="Huánuco">Huánuco</MenuItem>
                <MenuItem value="Ica">Ica</MenuItem>
                <MenuItem value="Junín">Junín</MenuItem>
                <MenuItem value="La Libertad">La Libertad</MenuItem>
                <MenuItem value="Lambayeque">Lambayeque</MenuItem>
                <MenuItem value="Lima">Lima</MenuItem>
                <MenuItem value="Loreto">Loreto</MenuItem>
                <MenuItem value="Madre de Dios">Madre de Dios</MenuItem>
                <MenuItem value="Moquegua">Moquegua</MenuItem>
                <MenuItem value="Pasco">Pasco</MenuItem>
                <MenuItem value="Piura">Piura</MenuItem>
                <MenuItem value="Puno">Puno</MenuItem>
                <MenuItem value="San Martín">San Martín</MenuItem>
                <MenuItem value="Tacna">Tacna</MenuItem>
                <MenuItem value="Tumbes">Tumbes</MenuItem>
                <MenuItem value="Ucayali">Ucayali</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                component="span"
                color="error"
                sx={{ minWidth: "8px" }}
              >
                *
              </Typography>
              <Typography variant="body2">Provincia:</Typography>
            </Box>
            <FormControl fullWidth size="small">
              <Select
                name="provincia"
                value={nuevoPedido.provincia}
                onChange={handleFormChange}
                disabled={!nuevoPedido.departamento}
              >
                {provinciasSeleccionadas.map((provincia) => (
                  <MenuItem key={provincia.value} value={provincia.value}>
                    {provincia.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                component="span"
                color="error"
                sx={{ minWidth: "8px" }}
              >
                *
              </Typography>
              <Typography variant="body2">Distrito:</Typography>
            </Box>
            <FormControl fullWidth size="small">
              <Select
                name="distrito"
                value={nuevoPedido.distrito}
                onChange={handleFormChange}
                disabled={!nuevoPedido.provincia}
              >
                {distritosSeleccionados.map((distrito) => (
                  <MenuItem key={distrito.value} value={distrito.value}>
                    {distrito.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                component="span"
                color="error"
                sx={{ minWidth: "8px" }}
              >
                *
              </Typography>
              <Typography variant="body2">Dirección:</Typography>
            </Box>
            <TextField
              name="direccion"
              value={nuevoPedido.direccion}
              onChange={handleFormChange}
              fullWidth
              size="small"
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                component="span"
                color="error"
                sx={{ minWidth: "8px" }}
              >
                *
              </Typography>
              <Typography variant="body2">Referencia:</Typography>
            </Box>
            <TextField
              name="referencia"
              value={nuevoPedido.referencia}
              onChange={handleFormChange}
              fullWidth
              size="small"
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                component="span"
                color="error"
                sx={{ minWidth: "8px" }}
              >
                *
              </Typography>
              <Typography variant="body2">GPS:</Typography>
            </Box>
            <TextField
              name="gps"
              value={nuevoPedido.gps}
              onChange={handleFormChange}
              fullWidth
              size="small"
              placeholder="Latitud,Longitud"
            />

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              Estado del Pedido
            </Typography>

            <FormControl component="fieldset">
              <RadioGroup
                row
                name="estado"
                value={nuevoPedido.estado}
                onChange={handleFormChange}
              >
                {["CONFIRMADO", "PENDIENTE", "CANCELADO"].map((opt) => (
                  <FormControlLabel
                    key={opt}
                    value={opt}
                    control={<Radio />}
                    label={opt}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              Productos
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Cantidad"
                name="cantidad"
                type="number"
                value={nuevoProducto.cantidad}
                onChange={handleProductoChange}
                size="small"
                sx={{ width: "100px" }}
              />
              <TextField
                label="Descripción"
                name="descripcion"
                value={nuevoProducto.descripcion}
                onChange={handleProductoChange}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Precio"
                name="precio"
                type="number"
                value={nuevoProducto.precio}
                onChange={handleProductoChange}
                size="small"
                sx={{ width: "100px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">S/</InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={agregarProducto}
                sx={{ width: "40px", minWidth: "40px", height: "40px", p: 0 }}
              >
                <Add />
              </Button>
            </Box>

            {nuevoPedido.productos.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Productos añadidos:
                </Typography>

                {nuevoPedido.productos.map((producto, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 0.5,
                    }}
                  >
                    <Typography variant="body2">
                      {producto.descripcion}
                    </Typography>
                    <Typography variant="body2">{producto.valor}</Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 1 }} />

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                >
                  <TextField
                    label="Total"
                    name="total"
                    value={nuevoPedido.total}
                    onChange={handleFormChange}
                    size="small"
                    sx={{ width: "100px" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">S/</InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Paper>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
              }}
            >
              <Button variant="outlined" onClick={() => setDrawerOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={guardarPedido}
                startIcon={<Save />}
                sx={{ bgcolor: "#4f46e5" }}
              >
                Guardar Pedido
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}

export default PedidosDashboard;