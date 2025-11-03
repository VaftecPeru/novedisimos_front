import React, { useEffect, useState } from "react";
import {
  Box, Badge, Divider, Button, FormControl, IconButton, InputAdornment, Menu, MenuItem,
  Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography, TablePagination
} from "@mui/material";
import { Search, Refresh, ArrowDropDown, WhatsApp } from "@mui/icons-material";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import axios from "axios";
import "./Asesores.css";
import Swal from "sweetalert2";
import NotificationsIcon from '@mui/icons-material/Notifications';
import { listarNotificacionesDelivery, crearNotificacionDelivery, actualizarEstadoInternoDelivery } from './components/services/shopifyService';

const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_BASE_URL = isDevelopment
  ? "http://localhost:8000/api/shopify"
  : "https://apiz.psicologosenlima.com/api/shopify";

const ESTADOS_DELIVERY = [
  { value: "pendiente", label: "Pendiente", color: "#f59e0b" },
  { value: "en_camino", label: "En camino", color: "#6366f1" },
  { value: "entregado", label: "Entregado", color: "#10b981" },
  { value: "cancelado", label: "Cancelado", color: "#ef4444" },
];

const getEstadoObj = (estado) => {
  return ESTADOS_DELIVERY.find(e => e.value === estado) || {
    value: "pendiente",
    label: "Pendiente",
    color: "#f59e0b"
  };
};

const obtenerOpciones = (estadoActual) => {
  switch (estadoActual) {
    case "pendiente":
      return ["en_camino", "entregado", "cancelado"];
    case "en_camino":
      return ["entregado", "cancelado"];
    case "entregado":
      return ["cancelado"];
    default:
      return [];
  }
};

const traducirMetodoPago = (metodo) => {
  const traducciones = {
    'Cash on Delivery (COD)': 'Pago Contra Entrega',
    'manual': 'Manual',
    'bogus': 'Prueba',
    'Credit Card': 'Tarjeta de Crédito',
    'PayPal': 'PayPal',
    'Bank Transfer': 'Transferencia Bancaria',
    'Mercado Pago': 'Mercado Pago',
    'Yape': 'Yape',
    'Plin': 'Plin'
  };
  return traducciones[metodo] || metodo;
};

const mapOrderToMotorizado = order => ({
  factura: order.name || `#${order.order_number}`,
  fecha: order.created_at ? new Date(order.created_at).toLocaleString("es-PE") : "-",
  motorizado: order.motorizado || "Sin asignar",
  asesor: order.asesor || "Sin asignar", // Nueva columna añadida
  cliente: order.customer
    ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim()
    : order.email || "Cliente no registrado",
  telefono: order.phone || (order.customer && order.customer.phone) || "",
  metodo: order.payment_gateway_names ? 
    order.payment_gateway_names.map(m => traducirMetodoPago(m)).join(", ") : 
    "No especificado",
  cantidad: `${order.presentment_currency || "PEN"} ${order.current_total_price || order.total_price || "0.00"}`,
  estado: order.estado_delivery || "pendiente",
  shopifyId: order.id,
  originalOrder: order
});

const PAGE_SIZE = 25;

const AsesoresDashboard = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [pedidos, setPedidos] = useState([]);
  const [pedidosOriginales, setPedidosOriginales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: "",
    searchTerm: "",
    fechaInicio: "",
    fechaFin: "",
  });
  const [anchorElEstado, setAnchorElEstado] = useState({});
  const [error, setError] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [anchorNotif, setAnchorNotif] = useState(null);

  const handleNotifClick = (event) => {
    setAnchorNotif(event.currentTarget);
  };

  const handleNotifClose = () => {
    setAnchorNotif(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const cargarNotificaciones = async () => {
      try {
        const notifs = await listarNotificacionesDelivery();
        setNotificaciones(notifs);
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      }
    };

    cargarNotificaciones();
    const intervalo = setInterval(cargarNotificaciones, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const fetchPedidosMotorizado = async (pageNum = 0, limit = rowsPerPage) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/orders?page=${pageNum + 1}&limit=${limit}`);
      const pedidosMapeados = (res.data.orders || []).map(mapOrderToMotorizado);
      setPedidos(pedidosMapeados);
      setPedidosOriginales(pedidosMapeados);
      setTotal(res.data.total || pedidosMapeados.length);
    } catch (err) {
      setError("No se pudieron cargar los pedidos.");
      console.error("Error al cargar pedidos:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPedidosMotorizado(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros({ ...filtros, [campo]: valor });
  };

  const pedidosFiltrados = pedidosOriginales.filter(pedido => {
    if (filtros.estado && pedido.estado !== filtros.estado) return false;
    if (filtros.searchTerm) {
      const t = filtros.searchTerm.toLowerCase();
      if (
        !(
          pedido.cliente?.toLowerCase().includes(t) ||
          pedido.factura?.toString().includes(t) ||
          pedido.motorizado?.toLowerCase().includes(t) ||
          pedido.asesor?.toLowerCase().includes(t) || // Búsqueda por asesor añadida
          pedido.telefono?.toLowerCase().includes(t)
        )
      ) return false;
    }
    if (filtros.fechaInicio) {
      const fechaPedido = new Date(pedido.originalOrder.created_at);
      const desde = new Date(filtros.fechaInicio);
      if (fechaPedido < desde) return false;
    }
    if (filtros.fechaFin) {
      const fechaPedido = new Date(pedido.originalOrder.created_at);
      const hasta = new Date(filtros.fechaFin);
      if (fechaPedido > hasta) return false;
    }
    return true;
  });

  const handleActualizarEstado = async (pedido, nuevoEstado) => {
    setAnchorElEstado({ ...anchorElEstado, [pedido.factura]: null });

    const estadoAnterior = pedido.estado;
    const estadoLabel = getEstadoObj(nuevoEstado).label;

    const result = await Swal.fire({
      title: `¿Cambiar estado a "${estadoLabel}"?`,
      text: `El pedido ${pedido.factura} cambiará de estado.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await actualizarEstadoInternoDelivery(pedido.shopifyId, nuevoEstado);

      const updatePedido = (p) => 
        p.factura === pedido.factura ? { ...p, estado: nuevoEstado } : p;
      
      setPedidos(prev => prev.map(updatePedido));
      setPedidosOriginales(prev => prev.map(updatePedido));

      if (nuevoEstado === 'en_camino' || nuevoEstado === 'entregado' || nuevoEstado === 'cancelado') {
        await crearNotificacionDelivery({
          shopify_order_id: pedido.shopifyId,
          mensaje: `El pedido ${pedido.factura} fue marcado como ${estadoLabel} por Delivery.`,
          tipo: nuevoEstado.toUpperCase(),
        });
      }

      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: `El pedido fue marcado como "${estadoLabel}".`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#7B6EF6'
      });

      console.log("Estado actualizado:", {
        pedido: pedido.factura,
        estadoAnterior,
        nuevoEstado,
        estadoLabel
      });

    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el estado del pedido.',
        icon: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Box className="motorizados-loading">
        <Typography>Cargando pedidos de delivery...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="motorizados-error">
        <Typography>{error}</Typography>
        <Button onClick={() => fetchPedidosMotorizado(page, rowsPerPage)} sx={{ mt: 2 }}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <div className="motorizados-outer-container">
      <Box className="motorizados-container">
        <Box className="motorizados-header">
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Gestión de Ventas <DeliveryDiningIcon sx={{ ml: 1, color: "#3b82f6" }} />
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              className="motorizados-btn-refresh"
              onClick={() => fetchPedidosMotorizado(page, rowsPerPage)}
            >
              Actualizar
            </Button>
            <IconButton color="primary" onClick={handleNotifClick}>
              <Badge
                badgeContent={notificaciones.filter((n) => !n.leido).length}
                color="error"
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorNotif}
            open={Boolean(anchorNotif)}
            onClose={handleNotifClose}
            PaperProps={{ sx: { minWidth: 300, maxHeight: 400 } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <strong>Notificaciones desde almacén</strong>
            </Box>
            <Divider />
            {notificaciones.length === 0 ? (
              <MenuItem disabled>No hay notificaciones</MenuItem>
            ) : (
              notificaciones.map((n) => (
                <MenuItem
                  key={n.id}
                  sx={{
                    bgcolor: n.leido ? "#f5f5f5" : "#fffbe6",
                    whiteSpace: "normal",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <p style={{ margin: 0 }}>{n.mensaje}</p>
                    <small style={{ color: "#888" }}>
                      {new Date(n.created_at).toLocaleString()}
                    </small>
                  </Box>
                </MenuItem>
              ))
            )}
          </Menu>
        </Box>

        {/* Filtros */}
        <Box className="motorizados-filtros">
          <TextField
            placeholder="Buscar cliente, factura, motorizado, asesor, teléfono..."
            variant="outlined"
            size="small"
            value={filtros.searchTerm}
            onChange={e => handleFiltroChange("searchTerm", e.target.value)}
            className="motorizados-search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" className="motorizados-select">
            <Select
              value={filtros.estado}
              onChange={e => handleFiltroChange("estado", e.target.value)}
              displayEmpty
              renderValue={selected => selected ? getEstadoObj(selected).label : "Estados"}
            >
              <MenuItem value="">Todos los estados</MenuItem>
              {ESTADOS_DELIVERY.map((estado) => (
                <MenuItem key={estado.value} value={estado.value}>
                  {estado.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Desde"
            type="date"
            size="small"
            value={filtros.fechaInicio}
            onChange={e => handleFiltroChange("fechaInicio", e.target.value)}
            className="motorizados-date"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hasta"
            type="date"
            size="small"
            value={filtros.fechaFin}
            onChange={e => handleFiltroChange("fechaFin", e.target.value)}
            className="motorizados-date"
            InputLabelProps={{ shrink: true }}
          />
          <Box className="motorizados-count">
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              {pedidosFiltrados.length} de {pedidosOriginales.length} pedidos
            </Typography>
          </Box>
        </Box>

        {/* Tabla con scroll horizontal */}
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <TableContainer 
            component={Paper} 
            className="motorizados-tablecontainer"
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className="motorizados-th">Factura</TableCell>
                  <TableCell className="motorizados-th">Fecha</TableCell>
                  <TableCell className="motorizados-th">Motorizado</TableCell>
                  <TableCell className="motorizados-th">Asesor</TableCell>
                  <TableCell className="motorizados-th">Cliente</TableCell>
                  <TableCell className="motorizados-th">Teléfono</TableCell>
                  <TableCell className="motorizados-th">Método</TableCell>
                  <TableCell className="motorizados-th">Total</TableCell>
                  <TableCell className="motorizados-th">Estado</TableCell>
                  <TableCell className="motorizados-th">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pedidosFiltrados.map((pedido, idx) => (
                  <TableRow 
                    key={pedido.factura || idx}
                    sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: "bold", color: "#1e40af" }}>
                        {pedido.factura}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '13px', lineHeight: '1.4' }}>
                        {pedido.fecha}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '13px' }}>
                        {pedido.motorizado}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '13px' }}>
                        {pedido.asesor}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '13px',
                          maxWidth: '150px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={pedido.cliente}
                      >
                        {pedido.cliente}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ fontSize: '13px' }}>
                          {pedido.telefono}
                        </Typography>
                        {pedido.telefono && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => window.open(`https://wa.me/51${pedido.telefono.replace(/\D/g, "")}`, "_blank")}
                          >
                            <WhatsApp fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '13px',
                          maxWidth: '140px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={pedido.metodo}
                      >
                        {pedido.metodo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: "bold", 
                          color: "#059669",
                          fontSize: '13px'
                        }}
                      >
                        {pedido.cantidad}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        endIcon={<ArrowDropDown />}
                        sx={{
                          backgroundColor: getEstadoObj(pedido.estado).color,
                          color: "#fff",
                          textTransform: "none",
                          fontWeight: "bold",
                          minWidth: 130,
                          height: 36,
                          fontSize: '12px',
                          '&:hover': {
                            backgroundColor: getEstadoObj(pedido.estado).color,
                            filter: 'brightness(0.9)'
                          }
                        }}
                        onClick={e => setAnchorElEstado({ ...anchorElEstado, [pedido.factura]: e.currentTarget })}
                      >
                        {getEstadoObj(pedido.estado).label}
                      </Button>
                      <Menu
                        anchorEl={anchorElEstado?.[pedido.factura] || null}
                        open={Boolean(anchorElEstado?.[pedido.factura])}
                        onClose={() => setAnchorElEstado({ ...anchorElEstado, [pedido.factura]: null })}
                      >
                        {obtenerOpciones(pedido.estado).map((estadoValue) => {
                          const estadoObj = ESTADOS_DELIVERY.find(e => e.value === estadoValue);
                          if (!estadoObj) return null;

                          return (
                            <MenuItem
                              key={estadoObj.value}
                              onClick={() => handleActualizarEstado(pedido, estadoObj.value)}
                            >
                              {estadoObj.label}
                            </MenuItem>
                          );
                        })}
                      </Menu>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1, justifyContent: 'center' }}>
                        <IconButton size="small" title="Imprimir">
                          <PrintIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" title="Ver detalle">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Pedidos por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          sx={{ 
            borderTop: '1px solid #e5e7eb',
            padding: '16px',
            '& .MuiTablePagination-toolbar': {
              minHeight: '56px'
            }
          }}
        />

        {pedidosFiltrados.length === 0 && !loading && (
          <Box className="motorizados-vacio">
            <Typography variant="h6" sx={{ color: "#6b7280", mb: 1 }}>
              No se encontraron pedidos
            </Typography>
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>
              Ajusta los filtros para ver más resultados
            </Typography>
            <Button 
              onClick={() => fetchPedidosMotorizado(page, rowsPerPage)} 
              sx={{ mt: 2 }}
              variant="outlined"
            >
              Recargar pedidos
            </Button>
          </Box>
        )}
      </Box>
    </div>
  );
};

export default AsesoresDashboard;