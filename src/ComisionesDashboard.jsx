import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { fetchVendedores } from './components/services/shopifyService';
import './ComisionesDashboard.css';
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
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const ComisionesDashboard = () => {
  const { usuario } = useUser();
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para modal
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState(null);
  const [formData, setFormData] = useState({ porcentaje: 0 });

  const isAdmin = usuario?.rol === 'Administrador';
  const isVendedor = usuario?.rol === 'Vendedor';

  // Verificar permisos
  useEffect(() => {
    if (!isAdmin && !isVendedor) {
      window.location.href = '/dashboard';
      return;
    }
    cargarVendedores();
  }, [usuario]);

  // Carga de vendedores desde API
  const cargarVendedores = async () => {
    try {
      setLoading(true);
      const response = await fetchVendedores();
      if (!Array.isArray(response)) {
        throw new Error('Respuesta inválida de la API');
      }
      const vendedoresData = response
        .filter(vend => vend.rol_id === 2)
        .map(vend => ({
          id: vend.id,
          nombre: vend.nombre_completo,
          correo: vend.correo,
          porcentaje: 0,
          ventasTotal: 0
        }));
      setVendedores(vendedoresData);
    } catch (error) {
      setError('Error al cargar los vendedores: ' + error.message);
      console.error('Error:', error);
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
      porcentaje: vendedor.porcentaje
    });
    setOpenEditDialog(true);
  };

  // Guardar cambios (solo para admin)
  const handleSaveChanges = async () => {
    try {
      const vendedoresActualizados = vendedores.map(vend =>
        vend.id === vendedorEditando.id
          ? { ...vend, porcentaje: formData.porcentaje }
          : vend
      );
      setVendedores(vendedoresActualizados);
      setOpenEditDialog(false);
      setVendedorEditando(null);
    } catch (error) {
      setError('Error al actualizar la comisión');
    }
  };

  // Si no tiene permisos
  if (!isAdmin && !isVendedor) {
    return (
      <Box className="comisiones-outer-container">
        <Box className="comisiones-container">
          <Box className="acceso-denegado">
            <Typography variant="h6">Acceso Denegado</Typography>
            <Typography>No tienes permisos para acceder a esta sección</Typography>
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

  // Para vendedores, mostrar solo sus propios datos (filtrar por correo o nombre, asumiendo match con usuario)
  let dataToShow = vendedores;
  if (isVendedor) {
    dataToShow = vendedores.filter(vend => vend.correo === usuario?.email || vend.nombre === usuario?.name);
    if (dataToShow.length === 0) {
      return (
        <Box className="comisiones-outer-container">
          <Box className="comisiones-container">
            <Box className="sin-datos">No hay datos de comisiones disponibles</Box>
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
            {isAdmin ? 'Gestión de Comisiones' : 'Mis Comisiones'}
          </Typography>
          {error && (
            <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>{error}</Typography>
              <Button size="small" onClick={() => setError('')}>×</Button>
            </Box>
          )}
        </Box>

        {/* Tabla con scroll horizontal */}
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <TableContainer component={Paper} className="comisiones-tablecontainer">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className="comisiones-th">Nombre</TableCell>
                  <TableCell className="comisiones-th">Porcentaje de Comisión</TableCell>
                  <TableCell className="comisiones-th">Total de Ventas</TableCell>
                  <TableCell className="comisiones-th">Comisiones Generadas</TableCell>
                  {isAdmin && <TableCell className="comisiones-th">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {dataToShow.map(vendedor => {
                  const comision = (vendedor.porcentaje / 100) * vendedor.ventasTotal;
                  return (
                    <TableRow key={vendedor.id} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                      <TableCell>{vendedor.nombre}</TableCell>
                      <TableCell>{vendedor.porcentaje}%</TableCell>
                      <TableCell>S/ {vendedor.ventasTotal.toLocaleString()}</TableCell>
                      <TableCell>S/ {comision.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
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

        {/* Dialog para edición */}
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
              onChange={(e) => setFormData({ porcentaje: parseFloat(e.target.value) })}
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