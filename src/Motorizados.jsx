import React, { useEffect, useState } from "react";
import {
  Box, Badge, Divider, Button, FormControl, IconButton, InputAdornment, Menu, MenuItem,
  Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography, TablePagination, Link, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { Search, Refresh, ArrowDropDown, WhatsApp } from "@mui/icons-material";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import InventoryIcon from "@mui/icons-material/Inventory";
import axios from "axios";
import "./Motorizados.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import NotificationsIcon from '@mui/icons-material/Notifications';
import DescriptionIcon from "@mui/icons-material/Description";
import { listarNotificacionesDelivery, crearNotificacionDelivery, actualizarEstadoInternoDelivery, fetchSeguimientoDelivery, createSeguimiento } from './components/services/shopifyService';
import logo from "../public/images/img.png";

const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_BASE_URL = isDevelopment
  ? "http://localhost:8000/api/shopify"
  : "https://psicologosenlima.com/shopify/public/api/shopify";

const ESTADOS_DELIVERY = [
  { value: "pendiente", label: "Pendiente", color: "#f59e0b" },
  { value: "en_camino", label: "En camino", color: "#6366f1" },
  { value: "entregado", label: "Entregado", color: "#10b981" },
  { value: "cancelado", label: "Cancelado", color: "#ef4444" },
];

const DB_TO_VALUE = {
  "Pendiente": "pendiente",
  "En_Camino": "en_camino",
  "Entregado": "entregado",
  "Cancelado": "cancelado"
};

const VALUE_TO_DB = {
  "pendiente": "Pendiente",
  "en_camino": "En_Camino",
  "entregado": "Entregado",
  "cancelado": "Cancelado"
};

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
  motorizado: order.motorizado || "Pendiente",
  cliente: order.customer
    ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim()
    : order.email || "Cliente no registrado",
  telefono: order.phone || (order.customer && order.customer.phone) || "Sin teléfono",
  metodo: order.payment_gateway_names
    ? order.payment_gateway_names.map(m => traducirMetodoPago(m)).join(", ")
    : "No especificado",
  cantidad: `${order.presentment_currency || "PEN"} ${order.current_total_price || order.total_price || "0.00"}`,
  estado: order.estado_delivery || "pendiente",
  shopifyId: order.id,
  originalOrder: order,
  productos: order.line_items
    ? order.line_items.map(item => ({
      nombre: item.name || "Producto sin nombre",
      cantidad: item.quantity || 0,
      precioUnitario: item.price ? parseFloat(item.price).toFixed(2) : "0.00",
      importe: item.price && item.quantity ? (parseFloat(item.price) * item.quantity).toFixed(2) : "0.00",
    }))
    : [],
  ubicacion: order.shipping_address
    ? `${order.shipping_address.address1 || ""}, ${order.shipping_address.city || ""}, ${order.shipping_address.province || ""}`.trim() || "Sin dirección"
    : "Sin dirección",
});
const PAGE_SIZE = 25;

const MotorizadosDashboard = () => {
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

  const [comprobantes, setComprobantes] = useState([]); // Estado para almacenar comprobantes
  const [vistaPreviaOpen, setVistaPreviaOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [vistaComprobantesOpen, setVistaComprobantesOpen] = useState(false);

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
      const seguimientos = await fetchSeguimientoDelivery();
      const pedidosMapeados = (res.data.orders || []).map(order => {
        const mapped = mapOrderToMotorizado(order);
        const segs = seguimientos.filter(s => s.shopify_order_id === mapped.shopifyId)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const latestSeg = segs[0];
        let estado = "pendiente";
        let motorizado = "Pendiente";
        if (latestSeg) {
          estado = DB_TO_VALUE[latestSeg.estado] || "pendiente";
          motorizado = latestSeg.responsable.nombre_completo || "Pendiente";
        }
        return { ...mapped, estado, motorizado };
      });
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
      await createSeguimiento({
        shopify_order_id: pedido.shopifyId,
        area: "Delivery",
        estado: VALUE_TO_DB[nuevoEstado],
        responsable_id: 4
      });

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

  const handleGenerarComprobante = (pedido, action = 'download') => {
    if (!pedido) {
      Swal.fire({
        title: 'Error',
        text: 'No hay un pedido seleccionado para generar el comprobante.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (comprobantes.some(c => c.id === pedido.factura)) {
      Swal.fire({
        title: 'Advertencia',
        text: `El comprobante para el pedido ${pedido.factura} ya fue generado.`,
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      if (action === 'preview') {
        setPedidoSeleccionado(pedido);
        setVistaPreviaOpen(true);
      }
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 10;
      const marginX = 14;
      const col1_X = marginX;
      const col2_X = pageWidth / 2;

      // Cabecera
      doc.setFont("helvetica", "normal");
      try {
        doc.addImage(logo, 'PNG', col1_X, y, 65, 15); 
      } catch (error) {
        console.warn("No se pudo cargar el logo:", error.message);
      }
      y += 15;
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("COMPROBANTE DE ENTREGA", pageWidth / 2, y + 15, { align: 'center' });
      doc.setFontSize(10);
      y += 30;

      // Datos del pedido y cliente
    
      const clienteText = pedido.cliente || 'N/A';
      const direccionText = pedido.ubicacion || 'N/A';
      const clienteLines = doc.splitTextToSize(clienteText, pageWidth / 2 - marginX - 10);
      const direccionLines = doc.splitTextToSize(direccionText, pageWidth / 2 - marginX - 10);
      const lineHeight = 5;
      const dataHeight = Math.max(40, (clienteLines.length + direccionLines.length + 3) * lineHeight + 10);

      const startYData = y;
      doc.setDrawColor(180, 180, 180);
      doc.rect(marginX, startYData - 2, pageWidth - 2 * marginX, dataHeight, 'S');
      y += 3;

      // Datos del Pedido
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("DATOS DEL PEDIDO", col1_X + 2, y);
      y += 5;
      doc.setFont("helvetica", "normal");

      doc.text(`Nro. Factura:`, col1_X + 2, y);
      doc.text(pedido.factura || 'N/A', col1_X + 35, y);
      y += 5;

      doc.text(`Fecha:`, col1_X + 2, y);
      doc.text(pedido.fecha || 'N/A', col1_X + 35, y);
      y += 5;

      doc.text(`Motorizado:`, col1_X + 2, y);
      doc.text(pedido.motorizado || 'N/A', col1_X + 35, y);
      y += 5;

      doc.text(`Estado:`, col1_X + 2, y);
      doc.text(getEstadoObj(pedido.estado).label || 'N/A', col1_X + 35, y);
      y += 5;

      doc.text(`Método de Pago:`, col1_X + 2, y);
      doc.text(pedido.metodo || 'N/A', col1_X + 35, y);
      y += 5;

      // Datos del Cliente
      y = startYData + 3;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("DATOS DEL CLIENTE", col2_X + 2, y);
      y += 5;
      doc.setFont("helvetica", "normal");

      doc.text(`Cliente:`, col2_X + 2, y);
      doc.text(clienteLines, col2_X + 20, y);
      y += clienteLines.length * lineHeight;

      doc.text(`Teléfono:`, col2_X + 2, y);
      doc.text(pedido.telefono || 'N/A', col2_X + 20, y);
      y += lineHeight;

      doc.text(`Dirección:`, col2_X + 2, y);
      doc.text(direccionLines, col2_X + 20, y);
      y += direccionLines.length * lineHeight;

      y = startYData + dataHeight + 5;

      // Productos
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("DETALLE DE PRODUCTOS ENTREGADOS", marginX, y);
      y += 5;

      let tableEndY = y;
      if (pedido.productos && Array.isArray(pedido.productos) && pedido.productos.length > 0) {
        const tableBody = pedido.productos.map((p, index) => [
          index + 1,
          p.nombre || 'Producto sin nombre',
          p.cantidad || 0,
          `${pedido.originalOrder.presentment_currency || 'PEN'} ${p.precioUnitario || '0.00'}`,
          `${pedido.originalOrder.presentment_currency || 'PEN'} ${p.importe || '0.00'}`,
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Nro.", "Descripción del Producto", "Cantidad", "Precio Unitario", "Importe"]],
          body: tableBody,
          styles: { fontSize: 10, cellPadding: 2, overflow: 'linebreak' },
          headStyles: {
            fillColor: [30, 30, 30],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          margin: { left: marginX, right: marginX },
          columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 75 },
            2: { cellWidth: 20 },
            3: { cellWidth: 30 },
            4: { cellWidth: 30 },
          },
          didDrawPage: (data) => {
            tableEndY = data.cursor.y + 10; // Guardar la posición Y después de la tabla
          },
        });
      } else {
        doc.setFontSize(10);
        doc.text("No hay productos registrados para este pedido.", marginX, y + 5);
        tableEndY = y + 15;
      }

      // Total 
      const importeColumnX = marginX + 15 + 75 + 20 + 30; 
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Total: ${pedido.cantidad || 'N/A'}`, importeColumnX, tableEndY, { align: 'left' });
      tableEndY += 10;

      const pdfOutput = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfOutput);
      const fileName = `Comprobante_Entrega_${pedido.factura.replace('#', '')}.pdf`;

      // Guardar comprobante en el estado
      setComprobantes(prev => [
        ...prev,
        { id: pedido.factura, fileName, url: pdfUrl, timestamp: new Date().toLocaleString('es-PE') }
      ]);

      if (action === 'download') {
        doc.save(fileName);
        const printWindow = window.open(pdfUrl);
        printWindow.print();
        Swal.fire({
          title: '¡Éxito!',
          text: `Comprobante de entrega para el pedido ${pedido.factura} generado y descargado.`,
          icon: 'success',
          confirmButtonText: 'OK',
        });
      } else if (action === 'preview') {
        setPedidoSeleccionado(pedido);
        setVistaPreviaOpen(true);
      }
    } catch (error) {
      console.error("Error al generar el comprobante:", error);
      Swal.fire({
        title: 'Error',
        text: `No se pudo generar el comprobante de entrega. Detalle: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleVistaPrevia = (pedido) => {
    handleGenerarComprobante(pedido, 'preview');
  };

  const handleDescargarComprobante = (pedido) => {
    handleGenerarComprobante(pedido, 'download');
  };

  useEffect(() => {
    return () => {
      // Liberar URLs de blobs al desmontar el componente
      comprobantes.forEach(comprobante => URL.revokeObjectURL(comprobante.url));
      setComprobantes([]);
    };
  }, []);
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Gestión de Entrega <DeliveryDiningIcon sx={{ ml: 1, color: "#3b82f6" }} />
            </Typography>

            {/* Link de Almacén Mejorado */}
            <Link
              href="/dashboard/almacenes"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(16, 185, 129, 0.4)',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  textDecoration: 'none'
                }
              }}
            >
              <InventoryIcon sx={{
                mr: 1,
                fontSize: '1.2rem',
                transition: 'transform 0.3s ease'
              }} />
              <Typography variant="body1" sx={{
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                Ir a Almacén
              </Typography>
            </Link>
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon />}
              onClick={() => setVistaComprobantesOpen(true)}
              sx={{ textTransform: 'none', color: '#10b981', borderColor: '#10b981' }}
            >
              Ver Comprobantes
            </Button>
          </Box>
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
            placeholder="Buscar cliente, factura, motorizado, teléfono..."
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
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '13px',
                          color: pedido.motorizado === "Pendiente" ? "#059669" : "inherit",
                          fontWeight: pedido.motorizado === "Pendiente" ? "bold" : "normal"
                        }}
                      >
                        {pedido.motorizado}
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
                        <IconButton
                          size="small"
                          title="Imprimir comprobante"
                          onClick={() => handleDescargarComprobante(pedido)}
                        >
                          <PrintIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Ver comprobante"
                          onClick={() => handleVistaPrevia(pedido)}
                        >
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

        {/* Dialog para vista previa */}
        <Dialog
          open={vistaPreviaOpen}
          onClose={() => setVistaPreviaOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Vista Previa - Comprobante de Entrega #{pedidoSeleccionado?.factura || 'N/A'}
          </DialogTitle>
          <DialogContent>
            {pedidoSeleccionado && (
              <Box sx={{ p: 2, bgcolor: 'white', border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  COMPROBANTE DE ENTREGA
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  NOVEDÍSIMOS E-COMMERCE
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      DATOS DEL PEDIDO
                    </Typography>
                    <Typography variant="body2">Nro. Factura: {pedidoSeleccionado.factura || 'N/A'}</Typography>
                    <Typography variant="body2">Fecha: {pedidoSeleccionado.fecha || 'N/A'}</Typography>
                    <Typography variant="body2">Motorizado: {pedidoSeleccionado.motorizado || 'N/A'}</Typography>
                    <Typography variant="body2">Estado: {getEstadoObj(pedidoSeleccionado.estado).label || 'N/A'}</Typography>
                    <Typography variant="body2">Método de Pago: {pedidoSeleccionado.metodo || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      DATOS DEL CLIENTE
                    </Typography>
                    <Typography variant="body2">Cliente: {pedidoSeleccionado.cliente || 'N/A'}</Typography>
                    <Typography variant="body2">Teléfono: {pedidoSeleccionado.telefono || 'N/A'}</Typography>
                    <Typography variant="body2">Dirección: {pedidoSeleccionado.ubicacion || 'N/A'}</Typography>
                  </Box>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  DETALLE DE PRODUCTOS ENTREGADOS
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nro.</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Cantidad</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pedidoSeleccionado.productos && pedidoSeleccionado.productos.length > 0 ? (
                        pedidoSeleccionado.productos.map((p, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{p.sku || 'N/A'}</TableCell>
                            <TableCell>{p.nombre || 'Producto sin nombre'}</TableCell>
                            <TableCell>{p.cantidad || 0}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4}>No hay productos registrados.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
                  Total: {pedidoSeleccionado.cantidad || 'N/A'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Pedido%20ID%20-%20${encodeURIComponent(pedidoSeleccionado.factura || 'N/A')}`}
                    alt="QR Code"
                    style={{ width: 100, height: 100 }}
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVistaPreviaOpen(false)}>Cerrar</Button>
            <Button
              variant="contained"
              onClick={() => handleDescargarComprobante(pedidoSeleccionado)}
              startIcon={<PrintIcon />}
            >
              Descargar PDF
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para lista de comprobantes */}
        <Dialog
          open={vistaComprobantesOpen}
          onClose={() => setVistaComprobantesOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Comprobantes Generados</DialogTitle>
          <DialogContent>
            {comprobantes.length === 0 ? (
              <Typography>No hay comprobantes generados.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Factura</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comprobantes.map((comprobante, index) => (
                      <TableRow key={index}>
                        <TableCell>{comprobante.id}</TableCell>
                        <TableCell>{comprobante.timestamp}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => window.open(comprobante.url, '_blank')}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = comprobante.url;
                                link.download = comprobante.fileName;
                                link.click();
                              }}
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVistaComprobantesOpen(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>

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

export default MotorizadosDashboard;