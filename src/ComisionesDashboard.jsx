import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { fetchVendedores } from "./components/services/shopifyService";
import {
  fetchComisiones,
  crearComision,
  actualizarComision,
  getComisionByUser,
} from "./components/services/shopifyService"; // ← AÑADIDO
import "./ComisionesDashboard.css";
import {
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Swal from "sweetalert2";

const ComisionesDashboard = () => {
  const { usuario } = useUser();
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para modal
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState(null);
  const [formData, setFormData] = useState({ porcentaje: 0 });

  const isAdmin = usuario?.rol === "Administrador";
  const isVendedor = usuario?.rol === "Vendedor";

  // Verificar permisos
  useEffect(() => {
    if (!isAdmin && !isVendedor) {
      window.location.href = "/dashboard";
      return;
    }
    cargarVendedores();
  }, [usuario]);

  // Carga de vendedores desde API
  const cargarVendedores = async () => {
    try {
      setLoading(true);
      const [response, comisiones] = await Promise.all([
        fetchVendedores(),
        fetchComisiones(), // ← AÑADIDO: cargar comisiones
      ]);

      if (!Array.isArray(response)) {
        throw new Error("Respuesta inválida de la API");
      }

      // Mapear comisiones por user_id
      const comisionMap = {};
      comisiones.forEach((c) => {
        comisionMap[c.user_id] = parseFloat(c.comision);
      });

      const vendedoresData = response
        .filter((vend) => vend.rol_id === 2)
        .map((vend) => ({
          id: vend.id,
          nombre: vend.nombre_completo,
          correo: vend.correo,
          porcentaje: comisionMap[vend.id] || 0, // ← AÑADIDO: porcentaje real
          ventasTotal: 0,
        }));
      setVendedores(vendedoresData);
    } catch (error) {
      setError("Error al cargar los vendedores: " + error.message);
      console.error("Error:", error);
      setVendedores([]);
    } finally {
      setLoading(false);
    }
  };

  // Abrir dialog de edición (solo para admin)
  const handleOpenEdit = (vendedor) => {
    if (!isAdmin) return;
    setVendedorEditando(vendedor);
    setFormData({
      porcentaje: vendedor.porcentaje,
    });
    setOpenEditDialog(true);
  };

  // Guardar cambios (solo para admin)
  // Guardar cambios (solo para admin)
  const handleSaveChanges = async () => {
    const swalConfig = {
      customClass: { container: "swal2-zindex-superior" },
    };

    if (formData.porcentaje < 0 || formData.porcentaje > 100) {
      Swal.fire({
        ...swalConfig,
        title: "Valor inválido",
        text: "El porcentaje debe estar entre 0 y 100",
        icon: "warning",
      });
      return;
    }

    Swal.fire({
      ...swalConfig,
      title: "¿Guardar comisión?",
      text: `Se actualizará el porcentaje de ${vendedorEditando.nombre}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const porcentaje = parseFloat(formData.porcentaje);
          const comisionExistente = await getComisionByUser(
            vendedorEditando.id
          );

          if (comisionExistente) {
            await actualizarComision(comisionExistente.id, {
              comision: porcentaje,
            });
          } else {
            await crearComision({
              user_id: vendedorEditando.id,
              comision: porcentaje,
            });
          }

          const vendedoresActualizados = vendedores.map((vend) =>
            vend.id === vendedorEditando.id ? { ...vend, porcentaje } : vend
          );
          setVendedores(vendedoresActualizados);

          Swal.fire(
            "Guardado",
            "Comisión actualizada correctamente",
            "success"
          );
          setOpenEditDialog(false);
          setVendedorEditando(null);
        } catch (error) {
          Swal.fire({
            ...swalConfig,
            title: "Error",
            text: error.message || "No se pudo guardar la comisión",
            icon: "error",
          });
        }
      }
    });
  };

  // === EL RESTO DEL CÓDIGO ES 100% TUYO (sin cambios) ===
  if (!isAdmin && !isVendedor) {
    return (
      <Box className="comisiones-outer-container">
        <Box className="comisiones-container">
          <Box className="acceso-denegado">
            <Typography variant="h6">Acceso Denegado</Typography>
            <Typography>
              No tienes permisos para acceder a esta sección
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box className="comisiones-outer-container">
        <Box className="comisiones-container">
          <Box className="loading">Cargando comisiones...</Box>
        </Box>
      </Box>
    );
  }

  let dataToShow = vendedores;
  if (isVendedor) {
    dataToShow = vendedores.filter(
      (vend) => vend.correo === usuario?.email || vend.nombre === usuario?.name
    );
    if (dataToShow.length === 0) {
      return (
        <Box className="comisiones-outer-container">
          <Box className="comisiones-container">
            <Box className="sin-datos">
              No hay datos de comisiones disponibles
            </Box>
          </Box>
        </Box>
      );
    }
  }

  return (
    <Box className="comisiones-outer-container">
      <Box className="comisiones-container">
        <Box className="comisiones-header">
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {isAdmin ? "Gestión de Comisiones" : "Mis Comisiones"}
          </Typography>
          {error && (
            <Box
              sx={{
                color: "error.main",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography>{error}</Typography>
              <Button size="small" onClick={() => setError("")}>
                ×
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <TableContainer
            component={Paper}
            className="comisiones-tablecontainer"
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className="comisiones-th">Nombre</TableCell>
                  <TableCell className="comisiones-th">
                    Porcentaje de Comisión
                  </TableCell>
                  <TableCell className="comisiones-th">
                    Total de Ventas
                  </TableCell>
                  <TableCell className="comisiones-th">
                    Comisiones Generadas
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="comisiones-th">Acciones</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {dataToShow.map((vendedor) => {
                  const comision =
                    (vendedor.porcentaje / 100) * vendedor.ventasTotal;
                  return (
                    <TableRow
                      key={vendedor.id}
                      sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}
                    >
                      <TableCell>{vendedor.nombre}</TableCell>
                      <TableCell>{vendedor.porcentaje}%</TableCell>
                      <TableCell>
                        S/ {vendedor.ventasTotal.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        S/{" "}
                        {comision.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenEdit(vendedor)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {dataToShow.length === 0 && (
          <Box className="comisiones-vacio">
            <Typography variant="h6" sx={{ color: "#6b7280", mb: 1 }}>
              No hay vendedores registrados
            </Typography>
          </Box>
        )}

        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Editar Porcentaje de Comisión</DialogTitle>
          <DialogContent>
            <TextField
              label={`Porcentaje para ${vendedorEditando?.nombre}`}
              type="number"
              fullWidth
              variant="outlined"
              size="small"
              value={formData.porcentaje}
              onChange={(e) =>
                setFormData({ porcentaje: parseFloat(e.target.value) })
              }
              InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveChanges}>
              Guardar Cambios
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ComisionesDashboard;
