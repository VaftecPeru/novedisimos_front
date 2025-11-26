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

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openImportExportModal, setOpenImportExportModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);

  // 🔹 Estados de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // 🔹 Cargar pedidos al iniciar
  useEffect(() => {
    const cargarPedidos = async () => {
      setLoading(true);
      try {
        const data = await fetchOrders();
        const lista = data.orders || data; // Ajustar según si fetchOrders devuelve { orders: [...] } o directamente el array
        // 🔹 Ordenar por fecha de creación (más recientes primero)
        console.log("Pedidos cargados:", lista);
        const ordenados = [...lista].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        console.log("Pedidos completos:", ordenados);
        setPedidos(ordenados);
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

      setPedidos(ordenados);
    } catch (err) {
      console.error("Error recargando pedidos:", err);
      setError("Error al recargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cambiar de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // 🔹 Cambiar cantidad de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    const coincideEstado =
      filtroEstado === "todos"
        ? true
        : (p.financial_status || "").toLowerCase() === filtroEstado;

    const coincideBusqueda = (p.customer ? `${p.customer.first_name} ${p.customer.last_name}` : p.billing_address?.name || "")
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    return coincideEstado && coincideBusqueda;
  });

  // 🔹 Pedidos que se mostrarán según la página actual
  const pedidosPaginados = pedidosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDelete = async (id) => {
    // 1️⃣ Confirmación
    const confirm = await Swal.fire({
      title: "¿Eliminar pedido?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d82c0d",
    });

    if (!confirm.isConfirmed) return;

    // 2️⃣ Mostrar alerta de procesando
    Swal.fire({
      title: "Eliminando...",
      text: "Por favor espera",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const result = await deletePedido(id); // Asumiendo que hay una función deletePedido similar a deleteProduct

      if (result.success) {
        // 3️⃣ Exito
        await Swal.fire({
          title: "Eliminado",
          text: "El pedido fue eliminado correctamente.",
          icon: "success",
        });

        recargarPedidos(); // 🔄 Refrescar la tabla
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el pedido.",
        icon: "error",
      });
    }
  };

  // Los estados, funciones y el <Dialog> del modal permanecen iguales:
  // En PedidosDashboard, agrega estos estados
  const [openNoteModal, setOpenNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState("");
  const [selectedNotePedidoId, setSelectedNotePedidoId] = useState(null);

  // Funciones para el modal
  const handleOpenNoteModal = (pedidoId, currentNote) => {
    setSelectedNotePedidoId(pedidoId);
    setEditingNote(currentNote || "");
    setOpenNoteModal(true);
  };

  const handleSaveNote = () => {
    if (selectedNotePedidoId) {
      setPedidos((prev) =>
        prev.map((ped) =>
          ped.id === selectedNotePedidoId ? { ...ped, note: editingNote } : ped
        )
      );
      // Opcional: await updateOrderNote(selectedNotePedidoId, editingNote);
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

  return (
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Filtros tipo Shifu */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {["todos", "paid", "pending", "refunded"].map((estado) => (
            <Button
              key={estado}
              variant={filtroEstado === estado ? "contained" : "outlined"}
              onClick={() => setFiltroEstado(estado)}
              sx={{
                textTransform: "capitalize",
                borderRadius: 2,
                px: 2,
                color: filtroEstado === estado ? "#fff" : "#353535",
                backgroundColor:
                  filtroEstado === estado ? "#353535" : "transparent",
                borderColor: "#353535",
                "&:hover": {
                  backgroundColor:
                    filtroEstado === estado ? "#1a1a1a" : "rgba(0,0,0,0.04)",
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

        {/* Buscador */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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
              color: "#ffffffff",
              backgroundColor: "#353535ff",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#1a1a1a",
              },
            }}
          >
            + Nuevo Pedido
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenImportExportModal(true)}
            sx={{
              color: "#ffffffff",
              backgroundColor: "#353535ff",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#1a1a1a",
              },
            }}
          >
            Exportar/Importar
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

      {openModal && (
        <AddPedido // Asumiendo un componente AddPedido similar a AddProduct
          onClose={() => setOpenModal(false)}
          onPedidoCreated={recargarPedidos}
        />
      )}

      {selectedPedido && (
        <EditPedido // Asumiendo un componente EditPedido similar a EditProduct
          pedido={selectedPedido}
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
      {loading && <Typography>Cargando pedidos...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && pedidos.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
              <TableRow>
                <TableCell>Orden</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Vendedor</TableCell>
                <TableCell>Detalle</TableCell>
                <TableCell>Envío</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Confirmación</TableCell>
                <TableCell>Pago</TableCell>
                <TableCell>Costo Env.</TableCell>
                <TableCell>1er Abono</TableCell>
                <TableCell>Saldo</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Nota</TableCell>
                <TableCell>Almacén</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidosPaginados.map((p) => {
                const estado = p.financial_status ?? "—";
                const cliente = p.customer ? `${p.customer.first_name} ${p.customer.last_name}` : p.billing_address?.name || "-";
                const direccion = p.shipping_address ? `${p.shipping_address.address1}, ${p.shipping_address.city}, ${p.shipping_address.province}` : p.billing_address ? `${p.billing_address.address1}, ${p.billing_address.city}, ${p.billing_address.province}` : "-";
                // const vendedor = p.user_id ? `Usuario ID: ${p.user_id}` : "-"; // Ajustar si se puede fetch nombre
                const vendedor = "-";
                const total = p.total_price || "-";
                const saldo = p.total_outstanding || "-";
                const costoEnvio = p.total_shipping_price_set.shop_money.amount || "-";
                const nota = p.note || "-";
                const almacen = p.location_id ? `Locación ID: ${p.location_id}` : "-"; // Ajustar si se puede fetch
                return (
                  <TableRow key={p.id}>
                    <TableCell>{p.order_number}</TableCell>
                    <TableCell>
                      <Box sx={{ fontSize: "0.75rem" }}>
                        <FechaItem
                          label="Registro"
                          fecha={formatDate(p.created_at) || "-"}
                        />
                        <FechaItem
                          label="Entrega"
                          fecha={formatDate(p.fulfillments[0]?.created_at) || "-"}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150 }}>
                      <Typography noWrap>{cliente}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {vendedor !== "-" ? (
                          <Typography variant="body2">
                            {vendedor}
                          </Typography>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleAbrirAsignarVendedor(p)}
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
                        onClick={() => navigate(`/pedidos/${p.id}`)}
                      >
                        Ver
                      </Button>
                    </TableCell>
                    <TableCell>{"-"}</TableCell>
                    <TableCell>{p.fulfillment_status || "-"}</TableCell>
                    <TableCell>{p.confirmed ? "Confirmado" : "Pendiente"}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          estado.toLowerCase() === "paid"
                            ? "Pagado"
                            : estado.toLowerCase() === "pending"
                            ? "Pendiente"
                            : "Otro"
                        }
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
                    <TableCell>{costoEnvio}</TableCell>
                    <TableCell>{p.current_total_price || "-"}</TableCell>
                    <TableCell>{saldo}</TableCell>
                    <TableCell>{total}</TableCell>
                    <TableCell>{direccion}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenNoteModal(p.id, nota)}
                      >
                        <NotaIcono />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {almacen !== "-" ? (
                          <Typography variant="body2">
                            {almacen}
                          </Typography>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleAbrirAsignarUsuarioAlmacen(p)}
                            sx={{ borderColor: "#4763e4", color: "#4763e4" }}
                          >
                            Asignar
                          </Button>
                        )}
                      </Box>
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
                          onClick={() => handleDelete(p.id)}
                          sx={{
                            color: "#d82c0d",
                            borderColor: "#d82c0d",
                            "&:hover": {
                              backgroundColor: "#fdecea",
                              borderColor: "#b0250b",
                            },
                          }}
                        >
                          Eliminar
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
      <TablePagination
        component="div"
        count={pedidos.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="Pedidos por página:"
      />
      {!loading && !error && pedidos.length === 0 && (
        <Typography>No hay pedidos registrados.</Typography>
      )}
    </Box>
  );
}

export default PedidosDashboard;