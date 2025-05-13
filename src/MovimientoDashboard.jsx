import React from 'react';
import { Box, Button, Typography, FormControl, Select, MenuItem, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Chip } from '@mui/material';
import { format } from 'date-fns';

function MovimientoDashboard() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [estadoProducto, setEstadoProducto] = React.useState('TODOS');
  const movimientosInventario = [
    {
      fecha: new Date('2025-05-08T10:00:00'),
      producto: 'CARTUCHERA CAPYBARA - -',
      almacen: 'N-WOW',
      cantidad: 50,
      comentario: 'Ingreso por nueva compra',
      operacion: 'COMPRA',
      tipo: 'ENTRY',
      estado: 'DISPONIBLE',
    },
    {
      fecha: new Date('2025-05-07T15:30:00'),
      producto: 'CARTUCHERA CAPYBARA - -',
      almacen: 'N-WOW',
      cantidad: 1,
      comentario: 'Salida por venta #123',
      operacion: 'REGULARIZADO',
      tipo: 'ENTRY',
      estado: 'VENDIDO',
    },
    {
      fecha: new Date('2025-05-06T09:15:00'),
      producto: 'CARTUCHERA CAPYBARA - -',
      almacen: 'N-WOW',
      cantidad: 1,
      comentario: 'Ajuste de inventario - conteo físico',
      operacion: 'DEVUELTO',
      tipo: 'ENTRY',
      estado: 'DISPONIBLE',
    },
    
  ];

  const estadosDisponibles = ['TODOS', 'DISPONIBLE', 'VENDIDO', 'EN_REVISION', 'OBSOLETO'];

  return (
    <div
      className="top-left-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        flexGrow: 1, 
        width: '100%', 
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#f1f1f1',
            color: 'black',
            borderRadius: '20px',
            border: '1px solid #576cc4',
            '&:hover': {
              backgroundColor: '#e0e0e0',
              borderColor: '#435ca7',
              boxShadow: '0 0 5px rgba(71, 99, 228, 0.5)',
            },
            padding: '4px 16px',
            marginLeft: '20px',
          }}
          onClick={() => setDrawerOpen(true)}
          startIcon={
            <img
              src="/images/youtube icon.png"
              alt="Logo de YouTube"
              style={{
                height: '20px',
                width: '20px',
              }}
            />
          }
          disableTypography
        >
          Ver video tutorial
        </Button>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }} className="producto-label">
          Producto
        </Typography>
        <FormControl size="small" className="estado-producto-select" sx={{ borderRadius: '20px' }}>
          <Select
            value={estadoProducto}
            onChange={(e) => setEstadoProducto(e.target.value)}
            displayEmpty
            sx={{
              height: '40px',
              minWidth: '170px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0',
                borderRadius: '20px',
              }
            }}
          >
            <MenuItem value="TODOS">Todos los estados</MenuItem>
            {estadosDisponibles.slice(1).map((estado) => (
              <MenuItem key={estado} value={estado}>{estado}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <div
        className="movimiento dashboard"
        style={{
          display: 'flex',
          flexGrow: 1, 
          width: '98%',
          height: '1000px',
          marginLeft: '20px',
        }}
      >
        <TableContainer component={Paper} sx={{ mb: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', flexGrow: 1 }}>
          <Table sx={{ minWidth: 750 }} size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                {['Fecha', 'Producto', 'Almacen', 'Cantidad', 'Comentario', 'Operación', 'Tipo', 'Estado']
                  .map(header => <TableCell key={header} sx={{ fontWeight: 'bold' }}>{header}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientosInventario.map((movimiento) => (
                <TableRow key={movimiento.fecha.toISOString()} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography>{format(movimiento.fecha, 'dd/MM/yyyy HH:mm')}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>ALMACEN-{movimiento.almacen}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{movimiento.producto}</TableCell>
                  <TableCell>{movimiento.almacen}</TableCell>
                  <TableCell>{movimiento.cantidad}</TableCell>
                  <TableCell>{movimiento.comentario}</TableCell>
                  <TableCell>{movimiento.operacion}</TableCell>
                  <TableCell>{movimiento.tipo}</TableCell>
                  <TableCell><Chip label={movimiento.estado} size="small" sx={{ border: 'none', backgroundColor: 'white' }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default MovimientoDashboard;