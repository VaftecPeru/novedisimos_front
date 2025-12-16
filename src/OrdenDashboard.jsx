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
  cancelarPedido,
} from "./components/services/shopifyService";
import NoteIcon from "@mui/icons-material/Note";
import SaveIcon from "@mui/icons-material/Save";
import TablePagination from "@mui/material/TablePagination";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useConfirmDialog } from "./components/Modals/useConfirmDialog";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import AddPedido from "./AddPedido";
import EditPedido from "./EditPedido";

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
    <Typography variant="caption">{fecha}</Typography>
  </Box>
);

function PedidosDashboard() {
  /// -------- Mostrar componentes por roles -------- //
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const isVendedor = currentUser.rol === "Vendedor";
  const userId = Number(currentUser.id);
  /// ---------------------------------------------- //

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openImportExportModal, setOpenImportExportModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // Asignar vendedor:
  const [openAsignarVendedor, setOpenAsignarVendedor] = useState(false);
  const [vendedores, setVendedores] = useState([]);
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState("");
  const [pedidoAsignar, setPedidoAsignar] = useState(null);
  const [ventasAsignadas, setVentasAsignadas] = useState([]);

  // Pedidos ya asignados
  useEffect(() => {
    const cargarVentasAsignadas = async () => {
      try {
        const data = await fetchVentasPedidosAsignados();
        setVentasAsignadas(data);
      } catch (error) {
        console.error("Error cargando ventas asignadas", error);
      }
    };

    cargarVentasAsignadas();
  }, []);

  const getVendedorPorPedido = (pedidoId) => {
    return ventasAsignadas.find(
      (v) => Number(v.shopify_order_id) === Number(pedidoId)
    );
  };

  // Asignar

  const abrirAsignarVendedor = async (pedido) => {
    setPedidoAsignar(pedido);
    setOpenAsignarVendedor(true);

    try {
      const data = await fetchVendedores();
      setVendedores(data);
    } catch (error) {
      console.error("Error cargando vendedores", error);
    }
  };

  const asignarVendedor = async () => {
    if (!pedidoAsignar || !vendedorSeleccionado) return;

    try {
      await createSeguimiento({
        shopify_order_id: pedidoAsignar.id,
        area: "Ventas",
        estado: "pendiente",
        responsable_id: vendedorSeleccionado,
      });

      // 🔄 Recargar seguimientos
      const data = await fetchVentasPedidosAsignados();
      setVentasAsignadas(data);

      Swal.fire("Correcto", "Vendedor asignado", "success");
      cerrarAsignarVendedor();
    } catch (error) {
      Swal.fire("Error", "No se pudo asignar el vendedor", "error");
    }
  };

  const cerrarAsignarVendedor = () => {
    setOpenAsignarVendedor(false);
    setVendedorSeleccionado("");
    setPedidoAsignar(null);
  };

  // Asignar almacén
  const [openAsignarAlmacen, setOpenAsignarAlmacen] = useState(false);
  const [almacenes, setAlmacenes] = useState([]);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState("");
  const [pedidoAsignarAlmacen, setPedidoAsignarAlmacen] = useState(null);
  const [almacenAsignados, setAlmacenAsignados] = useState([]);

  useEffect(() => {
    const cargarAlmacenAsignados = async () => {
      try {
        const data = await fetchAlmacenPedidosAsignados();
        setAlmacenAsignados(data);
      } catch (error) {
        console.error("Error cargando almacén asignados", error);
      }
    };

    cargarAlmacenAsignados();
  }, []);

  const cerrarAsignarAlmacen = () => {
    setOpenAsignarAlmacen(false);
    setAlmacenSeleccionado("");
    setPedidoAsignarAlmacen(null);
  };

  const getAlmacenPorPedido = (pedidoId) => {
    return almacenAsignados.find(
      (a) => Number(a.shopify_order_id) === Number(pedidoId)
    );
  };

  const abrirAsignarAlmacen = async (pedido) => {
    setPedidoAsignarAlmacen(pedido);
    setOpenAsignarAlmacen(true);

    try {
      const data = await fetchAlmacen();
      setAlmacenes(data);
    } catch (error) {
      console.error("Error cargando almacenes", error);
    }
  };
  const asignarAlmacen = async () => {
    if (!pedidoAsignarAlmacen || !almacenSeleccionado) return;

    try {
      await createSeguimiento({
        shopify_order_id: pedidoAsignarAlmacen.id,
        area: "Almacen",
        estado: "pendiente",
        responsable_id: almacenSeleccionado,
      });

      const data = await fetchAlmacenPedidosAsignados();
      setAlmacenAsignados(data);

      Swal.fire("Correcto", "Almacén asignado", "success");
      cerrarAsignarAlmacen();
    } catch (error) {
      Swal.fire("Error", "No se pudo asignar el almacén", "error");
    }
  };

  // Carga de ordenes
  useEffect(() => {
    const cargarPedidos = async () => {
      setLoading(true);
      try {
        const data = await fetchOrders();
        const lista = data.orders || data;
        const ordenados = [...lista].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        const planos = ordenados.map(mapPedido);
        setPedidos(planos);
      } catch (err) {
        setError("Error al cargar los pedidos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargarPedidos();
  }, []);

  const recargarPedidos = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      const lista = data.orders || data;
      const ordenados = [...lista].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      const planos = ordenados.map(mapPedido);
      setPedidos(planos);
    } catch (err) {
      console.error("Error recargando pedidos:", err);
      setError("Error al recargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  function mapPedido(p) {
    return {
      id: p.id,
      financial_status: p.financial_status,
      orden: p.order_number ?? "-",
      fecha: p.created_at ?? "-",

      cliente: p.customer
        ? `${p.customer.first_name} ${p.customer.last_name}`
        : p.billing_address?.name || "-",

      vendedor_usuario: p.user_id || "N/A",

      detalle: p.line_items
        ? p.line_items.map((item) => `${item.title} (${item.quantity})`)
        : [],

      empresa_envio:
        p.note_attributes?.find((a) => a.name === "empresa_envio")?.value ||
        p.shipping_lines?.[0]?.title ||
        "-",

      costo_envio:
        Number(
          p.note_attributes?.find((a) => a.name === "costo_envio")?.value
        ) ||
        Number(p.total_shipping_price_set?.shop_money?.amount) ||
        0,

      estado_pedido: p.fulfillment_status || "Pendiente",

      estado_confirmacion: p.confirmed ? "Confirmado" : "Pendiente",

      estado_pago:
        (p.financial_status || "-")
          .replace("paid", "Pagado")
          .replace("pending", "Pendiente") || "-",

      primer_abono:
        Number(
          p.note_attributes?.find((a) => a.name === "primer_abono")?.value
        ) || 0,

      saldo:
        Number(p.note_attributes?.find((a) => a.name === "saldo")?.value) || 0,
      almacen:
        p.note_attributes?.find((a) => a.name === "almacen")?.value ||
        p.location_id ||
        "N/A",

      total: Number(p.total_price) || 0,

      direccion_resumen: p.shipping_address
        ? `${p.shipping_address.city}, ${p.shipping_address.province}`
        : p.billing_address
        ? `${p.billing_address.city}, ${p.billing_address.province}`
        : "N/A",

      direccion_completa: p.shipping_address
        ? `${p.shipping_address.address1 || ""} ${
            p.shipping_address.address2 || ""
          }, ${p.shipping_address.city}, ${p.shipping_address.province}, ${
            p.shipping_address.country
          }, ${p.shipping_address.zip}`
        : p.billing_address
        ? `${p.billing_address.address1 || ""} ${
            p.billing_address.address2 || ""
          }, ${p.billing_address.city}, ${p.billing_address.province}, ${
            p.billing_address.country
          }, ${p.billing_address.zip}`
        : "N/A",

      nota: p.note || "Sin nota",
    };
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  let filtered = pedidos;
  if (filtroEstado !== "todos") {
    filtered = filtered.filter((p) => p.financial_status === filtroEstado);
  }

  const pedidosFiltrados = filtered.filter((p) => {
    if (isVendedor) {
      const seguimiento = getVendedorPorPedido(p.id);
      if (!seguimiento) return false;
      if (Number(seguimiento.responsable_id) !== userId) return false;
    }

    const texto =
      `${p.orden} ${p.cliente} ${p.estado_pago} ${p.estado_pedido} ${p.direccion_resumen}`.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  const pedidosPaginados = pedidosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Modal notas

  const [openNoteModal, setOpenNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState("");
  const [selectedNotePedidoId, setSelectedNotePedidoId] = useState(null);

  const handleOpenNoteModal = (pedidoId, currentNote) => {
    setSelectedNotePedidoId(pedidoId);
    setEditingNote(currentNote || "");
    setOpenNoteModal(true);
  };

  const handleSaveNote = () => {
    if (selectedNotePedidoId) {
      setPedidos((prev) =>
        prev.map((ped) =>
          ped.id === selectedNotePedidoId ? { ...ped, nota: editingNote } : ped
        )
      );
    }
    setOpenNoteModal(false);
    setSelectedNotePedidoId(null);
    setEditingNote("");
  };

  const handleCloseNoteModal = () => {
    setOpenNoteModal(false);
    setSelectedNotePedidoId(null);
    setEditingNote("");
  };

  const navigate = useNavigate();

  const [openDireccionModal, setOpenDireccionModal] = useState(false);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState("");

  const handleCancelarPedido = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Cancelar pedido?",
      text: "Esta acción cancelará el pedido en Shopify y no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
    });

    if (!isConfirmed) return;

    try {
      Swal.fire({
        title: "Cancelando pedido...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const data = await cancelarPedido(id);

      Swal.close();

      Swal.fire({
        title: "Pedido cancelado",
        text: "El pedido fue cancelado correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      recargarPedidos();
    } catch (error) {
      Swal.close();
      Swal.fire(
        "Error",
        error.message || "No se pudo cancelar el pedido",
        "error"
      );
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        backgroundColor: "#ffffff",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "column", md: "row" },
          gap: { xs: 2, sm: 2, md: 0 },
          fontSize: "12px",
          padding: 1.2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            marginRight: "20px",
            fontSize: "12px",
          }}
        >
          {["todos", "paid", "pending", "refunded"].map((estado) => (
            <Button
              key={estado}
              variant={filtroEstado === estado ? "contained" : "outlined"}
              onClick={() => setFiltroEstado(estado)}
              sx={{
                textTransform: "capitalize",
                borderRadius: 2,
                border: "none",
                boxShadow: "none",
                px: 2,
                color: filtroEstado === estado ? "#353535" : "#353535",
                backgroundColor:
                  filtroEstado === estado ? "rgba(0,0,0,0.03)" : "transparent",

                "&:hover": {
                  backgroundColor:
                    filtroEstado === estado
                      ? "rgba(0,0,0,0.05)"
                      : "rgba(0,0,0,0.03)",
                  boxShadow: "none",
                },
              }}
            >
              {estado === "todos"
                ? "Todos"
                : estado === "paid"
                ? "Pagados"
                : estado === "pending"
                ? "Pendientes"
                : "Reembolsados"}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Buscar pedido..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              outline: "none",
              width: "200px",
            }}
          />
          <Button
            variant="contained"
            onClick={() => setOpenModal(true)}
            sx={{
              border: "none",
              boxShadow: "none",
              color: "#ffffffff",
              backgroundColor: "#353535ff",
              borderRadius: 2,
              textTransform: "none",
              "&:hover": { backgroundColor: "#1a1a1a", boxShadow: "none" },
            }}
          >
            Nuevo
          </Button>
        </Box>
      </Box>

      <Dialog
        open={openNoteModal}
        onClose={handleCloseNoteModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Nota</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="note"
            label="Nota"
            type="text"
            fullWidth
            variant="standard"
            multiline
            rows={4}
            value={editingNote}
            onChange={(e) => setEditingNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoteModal}>Cancelar</Button>
          <Button
            onClick={handleSaveNote}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDireccionModal}
        onClose={() => setOpenDireccionModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Dirección Completa</DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: "pre-wrap" }}>
            {direccionSeleccionada}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDireccionModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {openModal && (
        <AddPedido
          open={openModal}
          onClose={() => setOpenModal(false)}
          onPedidoCreated={recargarPedidos} // Esto recarga tu lista de pedidos
        />
      )}

      {selectedPedido && (
        <EditPedido
          pedido={selectedPedido}
          open={Boolean(selectedPedido)}
          onClose={() => setSelectedPedido(null)}
          onUpdate={() => {
            setSelectedPedido(null);
            recargarPedidos();
          }}
        />
      )}

      {openImportExportModal && (
        <ImportExportModal onClose={() => setOpenImportExportModal(false)} />
      )}

      {loading && (
        <Typography sx={{ padding: 2 }}>Cargando pedidos...</Typography>
      )}
      {error && (
        <Typography sx={{ padding: 2 }} color="error">
          {error}
        </Typography>
      )}

      {!loading && !error && pedidos.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <Table size="small" sx={{ "& *": { fontSize: "12px" } }}>
            <TableHead sx={{ backgroundColor: "#f7f7f7" }}>
              <TableRow>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Orden</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Fecha</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Cliente</TableCell>
                {!isVendedor && (
                  <TableCell sx={{ whiteSpace: "nowrap" }}>Vendedor</TableCell>
                )}
                <TableCell sx={{ whiteSpace: "nowrap" }}>Detalle</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  Empresa Envío
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  Estado Pedido
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  Confirmación
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Estado Pago</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Costo Envío</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  Primer Abono
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Saldo</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Total</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Dirección</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Nota</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Almacén</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {pedidosPaginados.map((p) => {
                const estado = p.financial_status ?? "—"; // Se usa para la lógica de color del Chip

                return (
                  <TableRow key={p.id}>
                    <TableCell>{p.orden}</TableCell>
                    <TableCell>
                      <Box sx={{ "& *": { fontSize: "10px" } }}>
                        <FechaItem fecha={formatDate(p.fecha) || "-"} />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150 }}>
                      <Typography noWrap>{p.cliente}</Typography>
                    </TableCell>

                    {!isVendedor && (
                      <TableCell>
                        {(() => {
                          const seguimiento = getVendedorPorPedido(p.id);

                          if (seguimiento) {
                            return (
                              <Chip
                                label={seguimiento.responsable?.nombre_completo}
                                size="small"
                                color="success"
                              />
                            );
                          }

                          return (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => abrirAsignarVendedor(p)}
                            >
                              Asignar
                            </Button>
                          );
                        })()}
                      </TableCell>
                    )}

                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ borderColor: "#4763e4", color: "#4763e4" }}
                        onClick={() => navigate(`/pedidos/${p.id}`)}
                      >
                        Ver
                      </Button>
                    </TableCell>
                    <TableCell>{p.empresa_envio}</TableCell>
                    <TableCell>{p.estado_pedido}</TableCell>
                    <TableCell>{p.estado_confirmacion}</TableCell>
                    <TableCell>
                      <Chip
                        label={p.estado_pago}
                        sx={{
                          fontWeight: "bold",
                          textTransform: "capitalize",
                          color:
                            estado.toLowerCase() === "paid"
                              ? "#0E6245"
                              : estado.toLowerCase() === "pending"
                              ? "#7A7A7A"
                              : "#B42318",
                          backgroundColor:
                            estado.toLowerCase() === "paid"
                              ? "#E3FCEF"
                              : estado.toLowerCase() === "pending"
                              ? "#F5F5F5"
                              : "#FEECEC",
                        }}
                      />
                    </TableCell>
                    <TableCell>{p.costo_envio}</TableCell>
                    <TableCell>{p.primer_abono}</TableCell>
                    <TableCell>{p.saldo}</TableCell>
                    <TableCell>{p.total}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {p.direccion_resumen}

                      <IconButton
                        size="small"
                        onClick={() => {
                          setDireccionSeleccionada(p.direccion_completa);
                          setOpenDireccionModal(true);
                        }}
                      >
                        <NoteIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenNoteModal(p.id, p.nota)}
                      >
                        <NotaIcono />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const seguimiento = getAlmacenPorPedido(p.id);

                        if (seguimiento) {
                          return (
                            <Chip
                              label={seguimiento.responsable?.nombre_completo}
                              size="small"
                              color="info"
                            />
                          );
                        }

                        return (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => abrirAsignarAlmacen(p)}
                          >
                            Asignar
                          </Button>
                        );
                      })()}
                    </TableCell>

                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setSelectedPedido(p)}
                          sx={{
                            mr: 1,
                            color: "#5c6ac4",
                            borderColor: "#5c6ac4",
                            "&:hover": {
                              backgroundColor: "#f0f1fa",
                              borderColor: "#4f5bbd",
                            },
                          }}
                        >
                          Editar
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleCancelarPedido(p.id)}
                          sx={{
                            color: "#d82c0d",
                            borderColor: "#d82c0d",
                            "&:hover": {
                              backgroundColor: "#fdecea",
                              borderColor: "#b0250b",
                            },
                          }}
                        >
                          Cancelar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {!loading && !error && pedidos.length === 0 && (
        <Typography sx={{ padding: 2 }}>No hay pedidos registrados.</Typography>
      )}
      <TablePagination
        component="div"
        count={pedidosFiltrados.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="Pedidos por página:"
      />

      <Dialog
        open={openAsignarVendedor}
        onClose={cerrarAsignarVendedor}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Asignar vendedor</DialogTitle>

        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Vendedor</InputLabel>
            <Select
              value={vendedorSeleccionado}
              label="Vendedor"
              onChange={(e) => setVendedorSeleccionado(e.target.value)}
            >
              {vendedores.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.nombre_completo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={cerrarAsignarVendedor}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={asignarVendedor}
            disabled={!vendedorSeleccionado}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAsignarAlmacen}
        onClose={cerrarAsignarAlmacen}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Asignar almacén</DialogTitle>

        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Usuario de almacén</InputLabel>
            <Select
              value={almacenSeleccionado}
              label="Usuario de almacén"
              onChange={(e) => setAlmacenSeleccionado(e.target.value)}
            >
              {almacenes.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.nombre_completo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={cerrarAsignarAlmacen}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={asignarAlmacen}
            disabled={!almacenSeleccionado}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PedidosDashboard;
