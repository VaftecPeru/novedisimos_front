import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import {
  cargarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  restablecerContraseña,
} from "./components/services/shopifyService";

import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import "./ControlUsuarios.css";
import Swal from "sweetalert2";

const ControlUsuarios = () => {
  const { usuario } = useUser();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [usuarioReset, setUsuarioReset] = useState(null);
  const [nuevaContraseña, setNuevaContraseña] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    rol: "Vendedor",
    estado: true,
    contraseña: "",
  });

  useEffect(() => {
    if (usuario?.rol !== "Administrador") {
      window.location.href = "/dashboard";
      return;
    }
    cargarDatos();
  }, [usuario]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await cargarUsuarios();
      setUsuarios(data);
    } catch (err) {
      Swal.fire("Error", err.message || "Error al cargar usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalEdicion = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
      contraseña: "",
    });
    setShowEditModal(true);
  };

  const guardarCambios = () => {
    // Configuración centralizada para el z-index
    const swalConfig = {
      customClass: {
        container: "swal2-zindex-superior",
      },
    };

    Swal.fire({
      ...swalConfig, // Aplicado al modal de confirmación
      title: "¿Guardar cambios?",
      text: `Se actualizará la información de ${usuarioEditando.nombre}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const payload = {
            nombre: formData.nombre,
            correo: formData.correo,
            rol: formData.rol,
          };
          if (formData.contraseña) payload.contraseña = formData.contraseña;

          await actualizarUsuario(usuarioEditando.id, payload);
          // Esta llamada de éxito no necesita la clase, ya que el modal se cierra justo antes.
          Swal.fire(
            "Actualizado",
            "Usuario actualizado correctamente",
            "success"
          );
          setShowEditModal(false);
          cargarDatos();
        } catch (err) {
          Swal.fire({
            // Corregido: Usa la configuración completa en el error
            ...swalConfig,
            title: "Error",
            text: err.message || "No se pudo actualizar",
            icon: "error",
          });
        }
      }
    });
  };

  const agregarUsuario = () => {
    // Configuración centralizada para el z-index
    const swalConfig = {
      customClass: {
        container: "swal2-zindex-superior",
      },
    };

    if (!formData.nombre || !formData.correo || !formData.contraseña) {
      Swal.fire({
        // Corregido: Usa la configuración completa para la advertencia
        ...swalConfig,
        title: "Campos incompletos",
        text: "Todos los campos son obligatorios",
        icon: "warning",
      });
      return;
    }
    if (formData.contraseña.length < 8) {
      Swal.fire({
        // Corregido: Usa la configuración completa para la advertencia
        ...swalConfig,
        title: "Contraseña débil",
        text: "Debe tener al menos 8 caracteres",
        icon: "warning",
      });
      return;
    }

    Swal.fire({
      ...swalConfig, // Aplicado al modal de confirmación
      title: "¿Crear usuario?",
      text: `Se agregará a: ${formData.nombre}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Crear",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await crearUsuario(formData);
          // Esta llamada de éxito no necesita la clase, ya que el modal se cierra justo antes.
          Swal.fire("Creado", "Usuario creado correctamente", "success");
          setShowAddModal(false);
          setFormData({
            nombre: "",
            correo: "",
            rol: "Vendedor",
            contraseña: "",
          });
          cargarDatos();
        } catch (err) {
          Swal.fire({
            // Corregido: Usa la configuración completa en el error
            ...swalConfig,
            title: "Error",
            text: err.message || "No se pudo crear el usuario",
            icon: "error",
          });
        }
      }
    });
  };

  const handleEliminar = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        container: "swal2-zindex-superior",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarUsuario(id);
          Swal.fire(
            "Eliminado",
            "El usuario fue eliminado correctamente",
            "success"
          );
          cargarDatos();
        } catch (err) {
          Swal.fire(
            "Error",
            err.message || "No se pudo eliminar el usuario",
            "error"
          );
        }
      }
    });
  };

  const abrirResetModal = (usuario) => {
    setUsuarioReset(usuario);
    setNuevaContraseña("");
    setShowResetModal(true);
  };

  const cambiarContraseña = () => {
    // Configuración centralizada para el z-index
    const swalConfig = {
      customClass: {
        container: "swal2-zindex-superior",
      },
    };

    if (!nuevaContraseña || nuevaContraseña.length < 8) {
      Swal.fire({
        // Corregido: Usa la configuración completa para la advertencia
        ...swalConfig,
        title: "Contraseña inválida",
        text: "Debe tener al menos 8 caracteres",
        icon: "warning",
      });
      return;
    }

    Swal.fire({
      ...swalConfig, // Aplicado al modal de confirmación
      title: "¿Restablecer contraseña?",
      text: `Se actualizará la contraseña de ${usuarioReset.nombre}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Restablecer",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await restablecerContraseña(usuarioReset.correo, nuevaContraseña);
          // Esta llamada de éxito no necesita la clase, ya que el modal se cierra justo antes.
          Swal.fire("Éxito", "Contraseña cambiada correctamente", "success");
          setShowResetModal(false);
        } catch (err) {
          Swal.fire({
            // Corregido: Usa la configuración completa en el error
            ...swalConfig,
            title: "Error",
            text: err.message || "No se pudo restablecer la contraseña",
            icon: "error",
          });
        }
      }
    });
  };

  if (usuario?.rol !== "Administrador") {
    return (
      <Box className="usuarios-outer-container">
        <Box className="usuarios-container">
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
      <Box className="usuarios-outer-container">
        <Box className="usuarios-container">
          <Box className="usuarios-loading">Cargando usuarios...</Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="usuarios-outer-container">
      <Box className="usuarios-container">
        <Box className="usuarios-header">
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Control de Usuarios
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowAddModal(true)}
          >
            + Agregar Usuario
          </Button>
        </Box>

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <TableContainer component={Paper} className="usuarios-tablecontainer">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className="usuarios-th">Nombre</TableCell>
                  <TableCell className="usuarios-th">Correo</TableCell>
                  <TableCell className="usuarios-th">Rol</TableCell>
                  <TableCell className="usuarios-th">Estado</TableCell>
                  <TableCell className="usuarios-th">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.nombre}</TableCell>
                    <TableCell>{u.correo}</TableCell>
                    <TableCell>{u.rol}</TableCell>
                    <TableCell>{u.estado ? "Activo" : "Inactivo"}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => abrirModalEdicion(u)}>
                        Editar
                      </Button>
                      <Button size="small" onClick={() => abrirResetModal(u)}>
                        Reset
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleEliminar(u.id)}
                        disabled={u.id === usuario?.id}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* === MODALES === */}
        <Dialog
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Nombre"
              margin="dense"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Correo"
              margin="dense"
              type="email"
              value={formData.correo}
              onChange={(e) =>
                setFormData({ ...formData, correo: e.target.value })
              }
            />
            <TextField
              select
              fullWidth
              label="Rol"
              margin="dense"
              value={formData.rol}
              onChange={(e) =>
                setFormData({ ...formData, rol: e.target.value })
              }
            >
              <MenuItem value="Administrador">Administrador</MenuItem>
              <MenuItem value="Vendedor">Vendedor</MenuItem>
              <MenuItem value="Almacen">Almacen</MenuItem>
              <MenuItem value="Delivery">Delivery</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Nueva Contraseña (opcional)"
              margin="dense"
              type="password"
              value={formData.contraseña}
              onChange={(e) =>
                setFormData({ ...formData, contraseña: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEditModal(false)}>Cancelar</Button>
            <Button variant="contained" onClick={guardarCambios}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Agregar Usuario</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Nombre"
              margin="dense"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Correo"
              margin="dense"
              type="email"
              value={formData.correo}
              onChange={(e) =>
                setFormData({ ...formData, correo: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Contraseña"
              margin="dense"
              type="password"
              value={formData.contraseña}
              onChange={(e) =>
                setFormData({ ...formData, contraseña: e.target.value })
              }
            />
            <TextField
              select
              fullWidth
              label="Rol"
              margin="dense"
              value={formData.rol}
              onChange={(e) =>
                setFormData({ ...formData, rol: e.target.value })
              }
            >
              <MenuItem value="Vendedor">Vendedor</MenuItem>
              <MenuItem value="Almacen">Almacen</MenuItem>
              <MenuItem value="Delivery">Delivery</MenuItem>
              <MenuItem value="Administrador">Administrador</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddModal(false)}>Cancelar</Button>
            <Button variant="contained" onClick={agregarUsuario}>
              Crear
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showResetModal}
          onClose={() => setShowResetModal(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Restablecer Contraseña</DialogTitle>
          <DialogContent>
            <Typography variant="body2" mb={1}>
              Cambiar contraseña de <strong>{usuarioReset?.nombre}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Nueva Contraseña"
              type="password"
              margin="dense"
              value={nuevaContraseña}
              onChange={(e) => setNuevaContraseña(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowResetModal(false)}>Cancelar</Button>
            <Button variant="contained" onClick={cambiarContraseña}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ControlUsuarios;
