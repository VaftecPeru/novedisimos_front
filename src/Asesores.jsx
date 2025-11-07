import React, { useEffect, useState } from "react";
import {
  Box,
  Badge,
  Divider,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TablePagination,
} from "@mui/material";
import { Search, Refresh, ArrowDropDown, WhatsApp } from "@mui/icons-material";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Swal from "sweetalert2";
import "./Asesores.css";

import {
  listarNotificacionesDelivery,
  crearNotificacionDelivery,
  actualizarEstadoInternoDelivery,
  listarSeguimientosVendedores,
  listarComisionesVentas,
  listarPedidosDelivery,
} from "./components/services/shopifyService";

const ESTADOS_DELIVERY = [
  { value: "pendiente", label: "Pendiente", color: "#f59e0b" },
  { value: "en_camino", label: "En camino", color: "#6366f1" },
  { value: "entregado", label: "Entregado", color: "#10b981" },
  { value: "cancelado", label: "Cancelado", color: "#ef4444" },
];

const getEstadoObj = (estado) =>
  ESTADOS_DELIVERY.find((e) => e.value === estado) || ESTADOS_DELIVERY[0];

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
    "Cash on Delivery (COD)": "Pago Contra Entrega",
    manual: "Manual",
    bogus: "Prueba",
    "Credit Card": "Tarjeta de Crédito",
    PayPal: "PayPal",
    "Bank Transfer": "Transferencia Bancaria",
    "Mercado Pago": "Mercado Pago",
    Yape: "Yape",
    Plin: "Plin",
  };
  return traducciones[metodo] || metodo;
};

const AsesoresDashboard = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [pedidosOriginales, setPedidosOriginales] = useState([]); // Órdenes crudas
  const [pedidos, setPedidos] = useState([]); // Órdenes mapeadas para mostrar
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
  const [seguimientos, setSeguimientos] = useState({}); // { shopify_order_id: { responsable_id, nombre } }
  const [comisionesMap, setComisionesMap] = useState({}); // { user_id: porcentaje }

  // === CARGAR DATOS INICIALES (SEGUIMIENTOS Y COMISIONES) ===
  const cargarDatosIniciales = async () => {
    try {
      const [seguimientosData, comisionesData] = await Promise.all([
        listarSeguimientosVendedores(),
        listarComisionesVentas(),
      ]);

      // Mapa: shopify_order_id → { responsable_id, nombre }
      const segMap = {};
      seguimientosData.forEach((s) => {
        segMap[s.shopify_order_id] = {
          responsable_id: s.responsable_id,
          nombre: s.responsable?.nombre_completo || "Sin asignar",
        };
      });
      setSeguimientos(segMap);

      // Mapa: user_id → porcentaje
      const comMap = {};
      comisionesData.forEach((c) => {
        comMap[c.user_id] = parseFloat(c.comision);
      });
      setComisionesMap(comMap);
    } catch (err) {
      console.warn(
        "Datos iniciales no disponibles (seguimientos/comisiones)",
        err
      );
    }
  };

  // === CARGAR PEDIDOS ===
  const fetchPedidosMotorizado = async (pageNum = 0, limit = rowsPerPage) => {
    setLoading(true);
    setError(null);
    try {
      const { orders, total } = await listarPedidosDelivery(pageNum + 1, limit);
      setPedidosOriginales(orders); // Guardar originales
      setTotal(total);
    } catch (err) {
      setError("No se pudieron cargar los pedidos.");
      console.error("Error al cargar pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  // === MAPEO DE PEDIDO ===
  const mapOrderToMotorizado = (order) => {
    const seguimiento = seguimientos[order.id] || {};
    const responsableId = seguimiento.responsable_id;
    const vendedorNombre = seguimiento.nombre || "Sin asignar";
    const comisionPorcentaje = responsableId
      ? comisionesMap[responsableId] || 0
      : 0;

    const totalStr = order.current_total_price || order.total_price || "0";
    const totalNumerico = parseFloat(totalStr.replace(/[^0-9.-]+/g, "")) || 0;
    const comisionCalculada = (totalNumerico * comisionPorcentaje) / 100;

    return {
      factura: order.name || `#${order.order_number}`,
      fecha: order.created_at
        ? new Date(order.created_at).toLocaleString("es-PE")
        : "-",
      motorizado: order.motorizado || "Sin asignar",
      asesor: order.asesor || "Sin asignar",
      cliente: order.customer
        ? `${order.customer.first_name || ""} ${
            order.customer.last_name || ""
          }`.trim()
        : order.email || "Cliente no registrado",
      telefono: order.phone || order.customer?.phone || "",
      metodo: order.payment_gateway_names
        ? order.payment_gateway_names.map(traducirMetodoPago).join(", ")
        : "No especificado",
      cantidad: `${order.presentment_currency || "PEN"} ${totalStr}`,
      estado: order.estado_delivery || "pendiente",
      shopifyId: order.id,
      originalOrder: order,
      vendedor: vendedorNombre,
      comisionPorcentaje: comisionPorcentaje.toFixed(2),
      comisionMonto: comisionCalculada.toFixed(2),
      moneda: order.presentment_currency || "PEN",
    };
  };

  // === RECALCULAR PEDIDOS CUANDO CAMBIEN SEGUIMIENTOS O COMISIONES ===
  useEffect(() => {
    if (pedidosOriginales.length > 0) {
      const mapeados = pedidosOriginales.map(mapOrderToMotorizado);
      setPedidos(mapeados);
    }
  }, [pedidosOriginales, seguimientos, comisionesMap]);

  // === CARGAR DATOS AL INICIAR ===
  useEffect(() => {
    cargarDatosIniciales();
    fetchPedidosMotorizado(page, rowsPerPage);
  }, [page, rowsPerPage]);

  // === NOTIFICACIONES (MANTENIMIENTO) ===
  useEffect(() => {
    setNotificaciones([]);
    console.warn("Notificaciones desactivadas temporalmente (mantenimiento)");
  }, []);

  const handleNotifClick = (e) => setAnchorNotif(e.currentTarget);
  const handleNotifClose = () => setAnchorNotif(null);

  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  // === FILTRADO LOCAL ===
  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (filtros.estado && pedido.estado !== filtros.estado) return false;
    if (filtros.searchTerm) {
      const t = filtros.searchTerm.toLowerCase();
      if (
        ![
          pedido.cliente,
          pedido.factura,
          pedido.motorizado,
          pedido.asesor,
          pedido.telefono,
        ].some((field) => field?.toString().toLowerCase().includes(t))
      )
        return false;
    }
    if (filtros.fechaInicio) {
      const fechaPedido = new Date(pedido.originalOrder.created_at);
      const desde = new Date(filtros.fechaInicio);
      if (fechaPedido < desde) return false;
    }
    if (filtros.fechaFin) {
      const fechaPedido = new Date(pedido.originalOrder.created_at);
      const hasta = new Date(filtros.fechaFin);
      hasta.setHours(23, 59, 59, 999);
      if (fechaPedido > hasta) return false;
    }
    return true;
  });

  // === ACTUALIZAR ESTADO ===
  const handleActualizarEstado = async (pedido, nuevoEstado) => {
    setAnchorElEstado((prev) => ({ ...prev, [pedido.factura]: null }));

    const estadoLabel = getEstadoObj(nuevoEstado).label;

    const result = await Swal.fire({
      title: `¿Cambiar estado a "${estadoLabel}"?`,
      text: `El pedido ${pedido.factura} cambiará de estado.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await actualizarEstadoInternoDelivery(pedido.shopifyId, nuevoEstado);

      const updatePedido = (p) =>
        p.factura === pedido.factura ? { ...p, estado: nuevoEstado } : p;

      setPedidos((prev) => prev.map(updatePedido));

      if (["en_camino", "entregado", "cancelado"].includes(nuevoEstado)) {
        await crearNotificacionDelivery({
          shopify_order_id: pedido.shopifyId,
          mensaje: `El pedido ${pedido.factura} fue marcado como ${estadoLabel} por Delivery.`,
          tipo: nuevoEstado.toUpperCase(),
        });
      }

      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: `El pedido fue marcado como "${estadoLabel}".`,
        confirmButtonText: "OK",
        confirmButtonColor: "#7B6EF6",
      });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el estado.",
        icon: "error",
      });
    }
  };

  // === RENDER ===
  if (loading) {
    return (
      <Box className="motorizados-loading" sx={{ p: 4, textAlign: "center" }}>
        <Typography>Cargando pedidos de delivery...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="motorizados-error" sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
        <Button
          onClick={() => fetchPedidosMotorizado(page, rowsPerPage)}
          sx={{ mt: 2 }}
          variant="contained"
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <div className="motorizados-outer-container">
      <Box className="motorizados-container">
        {/* Header */}
        <Box
          className="motorizados-header"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
          >
            Gestión de Ventas{" "}
            <DeliveryDiningIcon sx={{ ml: 1, color: "#3b82f6" }} />
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => fetchPedidosMotorizado(page, rowsPerPage)}
            >
              Actualizar
            </Button>
            <IconButton color="primary" onClick={handleNotifClick}>
              <Badge badgeContent={0} color="error">
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
            <MenuItem disabled>No hay notificaciones</MenuItem>
          </Menu>
        </Box>

        {/* Filtros */}
        <Box
          className="motorizados-filtros"
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Buscar cliente, factura, motorizado, asesor, teléfono..."
            size="small"
            value={filtros.searchTerm}
            onChange={(e) => handleFiltroChange("searchTerm", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange("estado", e.target.value)}
              displayEmpty
              renderValue={(v) => (v ? getEstadoObj(v).label : "Estados")}
            >
              <MenuItem value="">Todos</MenuItem>
              {ESTADOS_DELIVERY.map((e) => (
                <MenuItem key={e.value} value={e.value}>
                  {e.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Desde"
            type="date"
            size="small"
            value={filtros.fechaInicio}
            onChange={(e) => handleFiltroChange("fechaInicio", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hasta"
            type="date"
            size="small"
            value={filtros.fechaFin}
            onChange={(e) => handleFiltroChange("fechaFin", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Box className="motorizados-count">
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              {pedidosFiltrados.length} de {pedidos.length} pedidos
            </Typography>
          </Box>
        </Box>

        {/* Tabla */}
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <TableContainer component={Paper}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Factura</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Motorizado</TableCell>
                  <TableCell>Asesor</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Vendedor</TableCell>
                  <TableCell>% Comisión</TableCell>
                  <TableCell>Comisión S/</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pedidosFiltrados.map((pedido, idx) => (
                  <TableRow key={pedido.factura || idx} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: "bold", color: "#1e40af" }}>
                        {pedido.factura}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px" }}>
                      {pedido.fecha}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px" }}>
                      {pedido.motorizado}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px" }}>
                      {pedido.asesor}
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "13px", maxWidth: 150 }}
                      title={pedido.cliente}
                    >
                      {pedido.cliente}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography sx={{ fontSize: "13px" }}>
                          {pedido.telefono}
                        </Typography>
                        {pedido.telefono && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() =>
                              window.open(
                                `https://wa.me/51${pedido.telefono.replace(
                                  /\D/g,
                                  ""
                                )}`,
                                "_blank"
                              )
                            }
                          >
                            <WhatsApp fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "13px", maxWidth: 140 }}
                      title={pedido.metodo}
                    >
                      {pedido.metodo}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#059669" }}>
                      {pedido.cantidad}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px" }}>
                      {pedido.vendedor}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px" }}>
                      {pedido.comisionPorcentaje}%
                    </TableCell>
                    <TableCell sx={{ color: "#059669", fontWeight: "bold" }}>
                      {pedido.moneda} {pedido.comisionMonto}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        endIcon={<ArrowDropDown />}
                        sx={{
                          bgcolor: getEstadoObj(pedido.estado).color,
                          color: "#fff",
                          fontWeight: "bold",
                          minWidth: 130,
                          fontSize: "12px",
                          "&:hover": { filter: "brightness(0.9)" },
                        }}
                        onClick={(e) =>
                          setAnchorElEstado((prev) => ({
                            ...prev,
                            [pedido.factura]: e.currentTarget,
                          }))
                        }
                      >
                        {getEstadoObj(pedido.estado).label}
                      </Button>
                      <Menu
                        anchorEl={anchorElEstado[pedido.factura] || null}
                        open={Boolean(anchorElEstado[pedido.factura])}
                        onClose={() =>
                          setAnchorElEstado((prev) => ({
                            ...prev,
                            [pedido.factura]: null,
                          }))
                        }
                      >
                        {obtenerOpciones(pedido.estado).map((val) => {
                          const obj = getEstadoObj(val);
                          return (
                            <MenuItem
                              key={val}
                              onClick={() =>
                                handleActualizarEstado(pedido, val)
                              }
                            >
                              {obj.label}
                            </MenuItem>
                          );
                        })}
                      </Menu>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
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
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count}`
          }
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          sx={{ borderTop: "1px solid #e5e7eb", mt: 2 }}
        />

        {pedidosFiltrados.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" sx={{ color: "#6b7280" }}>
              No se encontraron pedidos
            </Typography>
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>
              Ajusta los filtros para ver más resultados
            </Typography>
            <Button
              onClick={() => fetchPedidosMotorizado(page, rowsPerPage)}
              variant="outlined"
              sx={{ mt: 2 }}
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
