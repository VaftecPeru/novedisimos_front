import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Chip,
  Drawer,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  Menu,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search,
  WhatsApp,
  FilterList,
  MusicNote,
  Instagram,
  Close,
  Add,
  Save,
} from "@mui/icons-material";
import {
  actualizarEstadoInternoPago,
  actualizarEstadoInternoPreparacion,
  crearNotificacionAlmacen,
  fetchEstadosPedidos,
  fetchOrders,
  getShopInfo,
  fetchVendedores,
  fetchAlmacen,
  createSeguimiento,
  fetchVentasPedidosAsignados,
  fetchAlmacenPedidosAsignados,
  fetchSeguimientoVentas,
} from "./components/services/shopifyService";
import "./PedidosDashboard.css";
import NoteIcon from "@mui/icons-material/Note";
import SaveIcon from "@mui/icons-material/Save";
import TablePagination from "@mui/material/TablePagination";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useConfirmDialog } from "./components/Modals/useConfirmDialog";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";

function NotaIcono(props) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
        stroke="#222"
        strokeWidth="2"
        fill="none"
      />
      <rect x="7" y="8" width="10" height="2" rx="1" fill="#222" />
      <rect x="7" y="12" width="10" height="2" rx="1" fill="#222" />
      <rect x="7" y="16" width="7" height="2" rx="1" fill="#222" />
      <path
        d="M17 19l2.5-2.5M18.5 18.5l-1-1"
        stroke="#222"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NotaEditable({ nota, onSave, Icono }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(nota || "");

  const handleSave = () => {
    setEditando(false);
    if (onSave) onSave(valor);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {editando ? (
        <>
          <TextField
            value={valor}
            onChange={(e) => setValor(e.target.value)}
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
            sx={{
              cursor: "pointer",
              minWidth: 60,
              color: "#333",
              fontSize: "0.9em",
            }}
          >
            {nota || <span style={{ color: "#aaa" }}>Sin nota</span>}
          </Box>
        </>
      )}
    </Box>
  );
}

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const FechaItem = ({ label, fecha }) => (
  <Box sx={{ display: "flex", gap: 1 }}>
    <Typography variant="caption" sx={{ color: "#6b7280" }}>
      {label}:
    </Typography>
    <Typography variant="caption">{fecha}</Typography>
  </Box>
);

function PedidosDashboard() {
  /// -------------------------------------- Mostrar componentes por roles -------------------------------------- //
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const isVendedor = currentUser.rol === "Vendedor";
  const userId = Number(currentUser.id);
  //------------------------------//

  const [filtros, setFiltros] = useState({
    estado: "PENDIENTE",
    almacen: "TODOS",
    tipoFecha: "ingreso",
    fechaInicio: "",
    fechaFin: "",
    searchTerm: "",
  });
  const { confirm } = useConfirmDialog();
  const navigate = useNavigate();
  const handleExportar = () => {
    const csvRows = [];
    csvRows.push("ID,Cliente,Vendedor,Estado de Pago,Estado de Entrega,Total");

    pedidosFiltrados.forEach((pedido) => {
      const row = [
        pedido.id,
        pedido.cliente || "",
        pedido.vendedor?.nombre || "Sin asignar",
        pedido.financial_status === "paid" ? "Pagado" : "Pago pendiente",
        pedido.fulfillment_status === "fulfilled"
          ? "Preparado"
          : "No preparado",
        pedido.total || "",
      ]
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",");
      csvRows.push(row);
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "pedidos.csv");
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
    numeroOrden: "",
    canal: "Shopify",
    nota: "",
    vendedor: "",

    cliente: "",
    telefono: "",

    departamento: "",
    provincia: "",
    distrito: "",
    direccion: "",
    referencia: "",
    gps: "",

    productos: [],
    estado: "CONFIRMADO",
    estadoAdicional: "IN-WOW",
    medioPago: "",
    total: "",
    notaAdicional: "",
  };

  const [nuevoPedido, setNuevoPedido] = useState(estadoInicial);
  const [nuevoProducto, setNuevoProducto] = useState({
    descripcion: "",
    cantidad: 1,
    precio: "",
  });

  const [pedidos, setPedidos] = useState([]);
  const [pedidosOriginales, setPedidosOriginales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroPago, setFiltroPago] = useState("");
  const [filtroPreparado, setFiltroPreparado] = useState("");

  const [provinciasSeleccionadas, setProvinciasSeleccionadas] = useState([]);
  const [distritosSeleccionados, setDistritosSeleccionados] = useState([]);
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);
  const [estadosEntregaDisponibles, setEstadosEntregaDisponibles] = useState(
    []
  );
  const [almacenesDisponibles, setAlmacenesDisponibles] = useState([
    "TODOS",
    "LIMA",
    "PROVINCIA",
  ]);

  //----------------Fin Array de distritos y provincias -------//

  const handleFiltroChange = (campo, valor) => {
    setFiltros({ ...filtros, [campo]: valor });
  };

  useEffect(() => {
    const cargarTodosLosPedidos = async () => {
      try {
        setLoading(true);
        console.log("Cargando TODOS los pedidos desde Shopify...");

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

            console.log(
              `Página ${page - 1}: ${ordersData.length} pedidos. Total: ${
                allOrders.length
              }`
            );
          } catch (pageError) {
            console.error(`Error en página ${page}:`, pageError);
            hasMore = false;
          }
        }

        if (allOrders.length === 0) {
          console.log("Fallback: Cargando con método original...");
          const response = await fetchOrders();
          if (response && response.orders) allOrders = response.orders;
          else if (Array.isArray(response)) allOrders = response;
          else {
            setError("Formato de respuesta no reconocido.");
            return;
          }
        }

        console.log(`TOTAL PEDIDOS: ${allOrders.length}`);

        const estadosInternos = await fetchEstadosPedidos();
        let ventasOrders = [],
          almacenOrders = [];
        try {
          ventasOrders = await fetchVentasPedidosAsignados();
          almacenOrders = await fetchAlmacenPedidosAsignados();
        } catch (err) {
          console.error("Error asignaciones:", err);
        }

        const estadosVentas = await fetchSeguimientoVentas();

        // === FUNCIONES AUXILIARES ===
        const getNoteAttributeValue = (order, name) => {
          if (!order.note_attributes) return "No disponible";
          const attr = order.note_attributes.find((a) => a.name === name);
          return attr ? attr.value : "No disponible";
        };

        const mapShopifyStatus = (order) => {
          if (order.cancelled_at) return "CANCELADO";
          if (order.financial_status === "paid") return "CONFIRMADO";
          if (order.financial_status === "pending") return "PENDIENTE";
          return "PENDIENTE";
        };

        const mapDeliveryStatus = (order) => {
          if (order.fulfillment_status === "fulfilled")
            return "FINAL DE ENTREGA";
          if (order.fulfillment_status === "partial") return "POR DERIVAR";
          if (order.financial_status === "paid") return "ADMITIDO";
          return "IN-WOW";
        };

        const getTrazabilidadStatus = (order) => {
          if (order.cancelled_at) return "ANULADO";
          if (order.fulfillment_status === "fulfilled") return "ENTREGADO";
          if (order.fulfillment_status === "partial") return "EN_TRANSITO";
          if (order.fulfillment_status === "shipped") return "EN_TRANSITO";
          if (order.tags?.includes("listo-enviar")) return "LISTO_PARA_ENVIAR";
          if (order.tags?.includes("preparando")) return "PREPARANDO_PEDIDO";
          if (order.financial_status === "paid") return "PREPARANDO_PEDIDO";
          return "PENDIENTE";
        };

        // === EXTRAER DIRECCIÓN COMPLETA (shipping > billing > note_attributes) ===
        const getAddressFromOrder = (order) => {
          const shipping = order.shipping_address;
          const billing = order.billing_address;

          // Prioridad: shipping_address
          if (shipping) return { ...shipping, source: "shipping" };
          if (billing) return { ...billing, source: "billing" };

          // Fallback: note_attributes (antiguo)
          const provincia = getNoteAttributeValue(
            order,
            "Provincia y Distrito:"
          );
          const direccion = getNoteAttributeValue(order, "Dirección");
          if (provincia !== "No disponible" || direccion !== "No disponible") {
            return {
              name: getNoteAttributeValue(order, "Nombre y Apellidos"),
              first_name: "",
              last_name: "",
              phone: getNoteAttributeValue(order, "Celular"),
              address1: direccion,
              address2: "",
              city: "",
              province: provincia,
              country: "Peru",
              zip: "",
              company: "",
              latitude: null,
              longitude: null,
              country_code: "PE",
              province_code: "",
              source: "note_attributes",
            };
          }

          return null;
        };

        // === FORMATEAR UBICACIÓN PARA MOSTRAR ===
        const formatUbicacion = (addr) => {
          if (!addr) return "Sin ubicación";
          const partes = [
            addr.address1,
            addr.address2,
            addr.city,
            addr.province,
            addr.country,
          ].filter(Boolean);
          return partes.join(", ") || "Sin ubicación";
        };

        // === COORDENADAS ===
        const getCoordenadas = (addr) => {
          if (addr?.latitude && addr?.longitude) {
            return {
              lat: parseFloat(addr.latitude),
              lng: parseFloat(addr.longitude),
            };
          }
          return null;
        };

        // === ALMACÉN ===
        const getAlmacen = (ubicacion) => {
          if (!ubicacion || ubicacion === "Sin ubicación") return "TODOS";
          const lower = ubicacion.toLowerCase();
          return lower.includes("lima") || lower.includes("callao")
            ? "LIMA"
            : "PROVINCIA";
        };

        // === MAPEO FINAL DE PEDIDOS ===
        const pedidosFormateados = allOrders.map((order) => {
          const address = getAddressFromOrder(order);
          const ubicacion = formatUbicacion(address);
          const coordenadas = getCoordenadas(address);
          const almacen = getAlmacen(ubicacion);

          const estadoInterno = estadosInternos.find(
            (e) => Number(e.shopify_order_id) === Number(order.id)
          );
          const ventaAsignada = ventasOrders.find(
            (v) => Number(v.shopify_order_id) === Number(order.id)
          );
          const almacenAsignado = almacenOrders.find(
            (a) => Number(a.shopify_order_id) === Number(order.id)
          );
          const seguimientoVenta = estadosVentas.find(
            (s) => Number(s.shopify_order_id) === Number(order.id)
          );

          // Cliente desde address o customer
          const clienteDesdeAddress =
            address?.name ||
            (address
              ? `${address.first_name || ""} ${address.last_name || ""}`.trim()
              : "");
          const clienteFinal =
            clienteDesdeAddress ||
            (order.customer
              ? `${order.customer.first_name || ""} ${
                  order.customer.last_name || ""
                }`.trim()
              : "") ||
            order.email ||
            "Cliente no registrado";

          return {
            id: order.name || `#${order.order_number}`,
            orderNumber: order.order_number,
            shopifyId: order.id,
            estadoSeguimiento: seguimientoVenta?.estado || "Pendiente",
            estado_pago: estadoInterno?.estado_pago,
            estado_preparacion: estadoInterno?.estado_preparacion,
            responsable: ventaAsignada?.responsable || null,
            responsable_almacen: almacenAsignado?.responsable_almacen || null,

            // === DATOS DEL CLIENTE ===
            cliente: clienteFinal,
            telefono: address?.phone || order.phone || "Sin teléfono",
            dni: address?.company || "No disponible", // En Perú, company a veces es DNI

            // === DIRECCIÓN COMPLETA ===
            direccion: {
              nombreCompleto: address?.name || "",
              direccion1: address?.address1 || "",
              direccion2: address?.address2 || "",
              ciudad: address?.city || "",
              provincia: address?.province || "",
              pais: address?.country || "",
              codigoPostal: address?.zip || "",
              telefono: address?.phone || "",
              empresa_dni: address?.company || "",
              fuente: address?.source || "desconocida",
            },

            ubicacion: ubicacion,
            coordenadas: coordenadas,
            almacen: almacen,

            // === ESTADOS ===
            estado: mapShopifyStatus(order),
            estadoAdicional: mapDeliveryStatus(order),
            trazabilidad: getTrazabilidadStatus(order),

            financial_status: order.financial_status,
            fulfillment_status: order.fulfillment_status,

            // === IMPORTES ===
            importes: {
              total: `${order.presentment_currency || "PEN"} ${
                order.current_total_price || order.total_price || "0.00"
              }`,
              subtotal: order.subtotal_price || "0.00",
              currency: order.presentment_currency || order.currency || "PEN",
              detalles: (order.line_items || []).map((item) => ({
                descripcion: `${item.quantity || 1} ${item.name || "Producto"}`,
                valor: `${order.presentment_currency || "PEN"} ${
                  item.price || "0.00"
                }`,
              })),
            },

            // === FECHAS ===
            fechas: {
              ingreso: formatDate(order.created_at),
              registro: formatDate(order.processed_at),
              despacho: formatDate(order.shipped_at) || "-",
              entrega: order.fulfilled_at
                ? formatDate(order.fulfilled_at)
                : order.fulfillment_status === "fulfilled"
                ? formatDate(order.updated_at)
                : "-",
            },

            medioPago:
              order.payment_gateway_names?.join(", ") || "No especificado",
            tags: order.tags || "",
            note: order.note || "",
            fechaCreacion: new Date(order.created_at),
            fechaActualizacion: new Date(order.updated_at),
            originalOrder: order,
          };
        });

        setPedidos(pedidosFormateados);
        setPedidosOriginales(pedidosFormateados);

        const estadosUnicos = [
          ...new Set(pedidosFormateados.map((p) => p.estado)),
        ].filter(Boolean);
        const estadosEntregaUnicos = [
          ...new Set(pedidosFormateados.map((p) => p.estadoAdicional)),
        ].filter(Boolean);

        setEstadosDisponibles(estadosUnicos);
        setEstadosEntregaDisponibles(estadosEntregaUnicos);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message || "Error al cargar pedidos");
      } finally {
        setLoading(false);
      }
    };

    cargarTodosLosPedidos();
  }, []);

  const fetchOrdersWithPagination = async (page = 1, limit = 250) => {
    try {
      const API_BASE_URL = "https://psicologosenlima.com/shopify/public/api";

      const urls = [
        `${API_BASE_URL}/shopify/orders?limit=${limit}&page=${page}`,
        `${API_BASE_URL}/shopify/orders?limit=${limit}&page_info=${page}`,
        `${API_BASE_URL}/shopify/orders?per_page=${limit}&page=${page}`,
        `${API_BASE_URL}/shopify/orders`,
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

    if (e.target.name === "departamento") {
      const departamentoSeleccionado = e.target.value;
      const provincias =
        provinciasPorDepartamento[departamentoSeleccionado] || [];
      setProvinciasSeleccionadas(provincias);
      setNuevoPedido((prevState) => ({
        ...prevState,
        provincia: "",
        distrito: "",
      }));
      setDistritosSeleccionados([]);
    } else if (e.target.name === "provincia") {
      const departamentoSeleccionado = nuevoPedido.departamento;
      const provinciaSeleccionada = e.target.value;
      const distritos =
        distritosPorDepartamentoProvincia[departamentoSeleccionado]?.[
          provinciaSeleccionada
        ] || [];

      setDistritosSeleccionados(distritos);
      setNuevoPedido((prevState) => ({ ...prevState, distrito: "" }));
    }
  };

  const handleTrazabilidadChange = (pedidoId, nuevoEstado) => {
    console.log(`Cambiando trazabilidad de ${pedidoId} a ${nuevoEstado}`);

    setPedidos((prev) =>
      prev.map((pedido) =>
        pedido.id === pedidoId
          ? { ...pedido, trazabilidad: nuevoEstado }
          : pedido
      )
    );

    setPedidosOriginales((prev) =>
      prev.map((pedido) =>
        pedido.id === pedidoId
          ? { ...pedido, trazabilidad: nuevoEstado }
          : pedido
      )
    );
  };

  const handleProductoChange = (e) => {
    setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.value });
  };

  const agregarProducto = () => {
    if (nuevoProducto.descripcion && nuevoProducto.precio) {
      setNuevoPedido({
        ...nuevoPedido,
        productos: [
          ...nuevoPedido.productos,
          {
            descripcion: `${nuevoProducto.cantidad} ${nuevoProducto.descripcion}`,
            valor: `S/ ${nuevoProducto.precio}`,
          },
        ],
      });
      setNuevoProducto({ descripcion: "", cantidad: 1, precio: "" });
    }
  };

  const guardarPedido = () => {
    setDrawerOpen(false);
    setNuevoPedido(estadoInicial);
  };

  const pedidosFiltrados = pedidosOriginales.filter((pedido) => {
    const { fechaInicio, fechaFin, searchTerm, tipoFecha } = filtros;

    // Mostrar componentes por roles
    if (
      isVendedor &&
      (!pedido.responsable || Number(pedido.responsable.id) !== userId)
    ) {
      //--
      return false; //--
    } //-------------------------

    // Estado de pago: prioriza el interno, si no existe usa Shopify
    const estadoPago =
      pedido.estado_pago ||
      (pedido.financial_status === "paid" ? "pagado" : "pendiente");
    if (filtroPago) {
      if (filtroPago === "pendiente" && estadoPago === "pagado") return false;
      if (filtroPago === "pagado" && estadoPago !== "pagado") return false;
    }

    // Estado de preparación: prioriza el interno, si no existe usa Shopify
    const estadoPreparacion =
      pedido.estado_preparacion ||
      (pedido.fulfillment_status === "fulfilled"
        ? "preparado"
        : "no_preparado");
    if (filtroPreparado === "preparado" && estadoPreparacion !== "preparado")
      return false;
    if (
      filtroPreparado === "no_preparado" &&
      estadoPreparacion !== "no_preparado"
    )
      return false;

    if (fechaInicio || fechaFin) {
      let fechaComparar = null;

      switch (tipoFecha) {
        case "ingreso":
          fechaComparar = pedido.originalOrder.created_at;
          break;
        case "registro":
          fechaComparar =
            pedido.originalOrder.processed_at ||
            pedido.originalOrder.created_at;
          break;
        case "despacho":
          fechaComparar = pedido.originalOrder.shipped_at;
          if (!fechaComparar) return false;
          break;
        case "entrega":
          fechaComparar = pedido.originalOrder.fulfilled_at;
          if (
            !fechaComparar &&
            pedido.originalOrder.fulfillment_status === "fulfilled"
          ) {
            fechaComparar = pedido.originalOrder.updated_at;
          }
          if (!fechaComparar) return false;
          break;
        default:
          fechaComparar = pedido.originalOrder.created_at;
      }

      if (!fechaComparar) return false;

      const fechaPedido = new Date(fechaComparar);
      const fechaPedidoSoloFecha = new Date(
        fechaPedido.getFullYear(),
        fechaPedido.getMonth(),
        fechaPedido.getDate()
      );

      if (fechaInicio) {
        const fechaInicioComparar = new Date(fechaInicio);
        if (fechaPedidoSoloFecha < fechaInicioComparar) return false;
      }

      if (fechaFin) {
        const fechaFinComparar = new Date(fechaFin);
        if (fechaPedidoSoloFecha > fechaFinComparar) return false;
      }
    }

    if (searchTerm && searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesCliente =
        pedido.cliente && pedido.cliente.toLowerCase().includes(searchLower);
      const matchesId =
        pedido.id && pedido.id.toLowerCase().includes(searchLower);
      const matchesTelefono =
        pedido.telefono && pedido.telefono.toLowerCase().includes(searchLower);
      const matchesUbicacion =
        pedido.ubicacion &&
        pedido.ubicacion.toLowerCase().includes(searchLower);
      const matchesNote =
        pedido.note && pedido.note.toLowerCase().includes(searchLower);
      const matchesTags =
        pedido.tags && pedido.tags.toLowerCase().includes(searchLower);
      const matchesVendedor =
        pedido.vendedor?.nombre &&
        pedido.vendedor.nombre.toLowerCase().includes(searchLower);

      if (
        !matchesCliente &&
        !matchesId &&
        !matchesTelefono &&
        !matchesUbicacion &&
        !matchesNote &&
        !matchesTags &&
        !matchesVendedor
      ) {
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
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h6">Cargando pedidos desde Shopify...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h6" color="error">
          Error al cargar pedidos
        </Typography>
        <Typography variant="body1">{error}</Typography>
        <Typography variant="body2">
          Verifique que el servidor backend esté en ejecución y que las
          credenciales de Shopify sean correctas.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        overflowX: "auto",
      }}
    >
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
      </Box>

      <TableContainer
        component={Paper}
        sx={{ mb: 4, boxShadow: "0 2px 3px -1px rgb(0 0 0 / 0.1)" }}
      >
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: "14px"}}>Orden Pedido</TableCell>
              <TableCell sx={{ fontSize: "14px"}} >Fecha</TableCell>
              <TableCell sx={{ fontSize: "14px"}}>Cliente</TableCell>
              <TableCell sx={{ fontSize: "14px"}}>Vendedor</TableCell>
              <TableCell sx={{ fontSize: "14px"}}>Detalle</TableCell>
              <TableCell sx={{ fontSize: "14px"}}>Empresa de Envío</TableCell>
              <TableCell sx={{ fontSize: "14px"}} >Estado del Pedido</TableCell>
              <TableCell sx={{ fontSize: "14px"}}>Estado del confirmacion de pedido</TableCell>
              <TableCell sx={{ fontSize: "14px"}}>Estado de Pago</TableCell>
              <TableCell sx={{ fontSize: "14px"}}>Costo de envio</TableCell>
              <TableCell sx={{ fontSize: "14px"}}>Primer abono</TableCell>
              <TableCell sx={{ fontSize: "14px"}}>Saldo restante</TableCell>
              <TableCell sx={{ fontSize: "14px"}}>Total a pagar</TableCell>
              <TableCell sx={{ fontSize: "14px"}}>Dirección</TableCell>
              <TableCell sx={{ fontSize: "14px"}}>Nota</TableCell>
              <TableCell sx={{ fontSize: "14px"}}>Almacén</TableCell>
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
                <TableRow
                  key={pedido.id}
                  sx={{ "&:hover": { bgcolor: "#f9fafb" } }}
                >
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
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {pedido.responsable?.nombre_completo ? (
                        <Typography variant="body2">
                          {pedido.responsable.nombre_completo}
                        </Typography>
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
                  <TableCell>-</TableCell>
                  <TableCell>
                    {console.log(
                      "Estado seguimiento para pedido",
                      pedido.id,
                      ":",
                      pedido.estadoSeguimiento
                    )}
                    <FormControl size="small">
                      <Select
                        value={pedido.estadoSeguimiento || "PENDIENTE"}
                        onChange={async (e) => {
                          const nuevoEstado = e.target.value;
                          const ok = await confirm({
                            title: "¿Confirmar cambio de estado?",
                            text: `¿Cambiar el estado del pedido #${pedido.id} a ${nuevoEstado}?`,
                            confirmButtonColor: "#4D68E6",
                            confirmButtonText: "Sí, cambiar",
                          });
                          if (!ok) return;

                          try {
                            const seguimientoData = {
                              shopify_order_id: Number(pedido.shopifyId),
                              estado: nuevoEstado,
                              responsable_id: pedido.responsable?.id || null,
                              area: "Ventas",
                              mensaje: `El pedido #${pedido.id} cambió a ${nuevoEstado}.`,
                              tipo: "CAMBIO_ESTADO",
                            };
                            const response = await createSeguimiento(
                              seguimientoData
                            );
                            if (response) {
                              setPedidos((prev) =>
                                prev.map((p) =>
                                  p.shopifyId === pedido.shopifyId
                                    ? { ...p, estadoSeguimiento: nuevoEstado }
                                    : p
                                )
                              );
                              setPedidosOriginales((prev) =>
                                prev.map((p) =>
                                  p.shopifyId === pedido.shopifyId
                                    ? { ...p, estadoSeguimiento: nuevoEstado }
                                    : p
                                )
                              );
                              Swal.fire({
                                title: "¡Estado actualizado!",
                                text: `El pedido #${pedido.id} ahora está en ${nuevoEstado}.`,
                                icon: "success",
                                confirmButtonText: "OK",
                              });
                            }
                          } catch (error) {
                            console.error(
                              "❌ Error al actualizar estado:",
                              error
                            );
                            Swal.fire({
                              title: "Error",
                              text: "No se pudo actualizar el estado.",
                              icon: "error",
                              confirmButtonText: "OK",
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
                  <TableCell>-</TableCell>
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
                          text: `¿Estás seguro de que deseas marcar este pedido como ${
                            nuevoEstado === "pagado" ? "pagado" : "pendiente"
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
                            console.log(
                              "➡ Enviando notificación de pago al backend..."
                            );
                            const respuesta = await crearNotificacionAlmacen({
                              shopify_order_id: Number(pedido.shopifyId),
                              mensaje: `El pedido ${pedido.id} ha sido marcado como pagado.`,
                              tipo: "PAGO_CONFIRMADO",
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
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
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
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {pedido.responsable_almacen?.nombre_completo ? (
                        <Typography variant="body2">
                          {pedido.responsable_almacen.nombre_completo}
                        </Typography>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            handleAbrirAsignarUsuarioAlmacen(pedido)
                          }
                          sx={{ borderColor: "#4763e4", color: "#4763e4" }}
                        >
                          Asignar
                        </Button>
                      )}
                    </Box>
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
    </Box>
  );
}

export default PedidosDashboard;
