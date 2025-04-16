import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  Grid, 
  IconButton, 
  InputAdornment, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';

const SeguimientoContraentrega = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isSidebarOpen = useMediaQuery(theme.breakpoints.up('lg'));

  // Datos de ejemplo para los pedidos
  const pedidosData = [
    { fecha: '15/04/2025', pedidos: 21, total: 'S/ 2029' },
    { fecha: '14/04/2025', pedidos: 33, total: 'S/ 3711 - S/ 2375 - S/ 2375' },
    { fecha: '12/04/2025', pedidos: 28, total: 'S/ 2941 - S/ 2587 - S/ 2453' },
    { fecha: '11/04/2025', pedidos: 20, total: 'S/ 1853 - S/ 1438 - S/ 1424' },
    { fecha: '10/04/2025', pedidos: 20, total: 'S/ 1924 - S/ 1746 - S/ 1632' },
    { fecha: '09/04/2025', pedidos: 23, total: 'S/ 2125 - S/ 1903 - S/ 1819' },
    { fecha: '08/04/2025', pedidos: 21, total: 'S/ 2023 - S/ 1613 - S/ 1613' },
    { fecha: '07/04/2025', pedidos: 35, total: 'S/ 5850 - S/ 5272 - S/ 5193' },
    { fecha: '05/04/2025', pedidos: 22, total: 'S/ 2035 - S/ 1575 - S/ 1575' },
    { fecha: '04/04/2025', pedidos: 25, total: 'S/ 3156 - S/ 3156 - S/ 2844' },
    { fecha: '03/04/2025', pedidos: 18, total: 'S/ 1635 - S/ 1403 - S/ 1403' },
    { fecha: '02/04/2025', pedidos: 34, total: 'S/ 3349 - S/ 2802 - S/ 2802' },
    { fecha: '01/04/2025', pedidos: 25, total: 'S/ 2167 - S/ 1461 - S/ 1323' },
    { fecha: '31/03/2025', pedidos: 63, total: 'S/ 6669 - S/ 6344 - S/ 5957' },
    { fecha: '29/03/2025', pedidos: 33, total: 'S/ 3318 - S/ 2963 - S/ 2963' },
  ];

  // Estado para filtros
  const [filtroDE, setFiltroDE] = useState('TODOS');
  const [departamento, setDepartamento] = useState('TODOS');
  const [pedidosFiltro, setPedidosFiltro] = useState('TODOS');
  const [transportadora, setTransportadora] = useState('TODOS');
  const [estadoEntrega, setEstadoEntrega] = useState('PENDIENTE');

  // Estado para fechas
  const [fechaInicio, setFechaInicio] = useState(new Date('2025-03-14'));
  const [fechaFin, setFechaFin] = useState(new Date('2025-04-13'));

  // Estado para búsqueda
  const [busqueda, setBusqueda] = useState('');

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box
        sx={{
          width: '100%',
          bgcolor: '#f8f8f8',
          padding: 2,
          boxSizing: 'border-box',
          transition: 'all 0.3s',
          marginLeft: { xs: 0, lg: isSidebarOpen ? '0' : '0' },
        }}
      >
        {/* Primer div: Búsqueda, Cant Total, Seleccione, Fechas */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 2, 
            borderRadius: 1,
            backgroundColor: 'white'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            {/* Campo de búsqueda */}
            <Grid item xs={12} sm={2.5} md={2.5}>
              <TextField
                fullWidth
                placeholder="Buscar"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton sx={{ color: '#4a41ee' }}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                size="small"
                className="search-bar"
                sx={{ minWidth: '160px' }}
              />
            </Grid>
            
            {/* Estadísticas */}
            <Grid item xs={12} sm={2.5} md={2.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} className="stats-container">
                <Typography variant="body2" className="stat-label">
                  Cant: 3611
                </Typography>
                <Typography variant="body2">
                  Total: <span className="stat-value">S/ 364256.00</span>
                </Typography>
              </Box>
            </Grid>
            
            {/* Estado de entrega */}
            <Grid item xs={12} sm={3} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} className="estado-entrega-container">
                <Typography variant="body2" sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }} className="estado-entrega-label">
                  Seleccione:
                </Typography>
                <FormControl size="small" fullWidth className="estado-entrega-select">
                  <Select
                    value={estadoEntrega}
                    onChange={(e) => setEstadoEntrega(e.target.value)}
                    displayEmpty
                    sx={{ 
                      height: '40px',
                      minWidth: '170px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0'
                      }
                    }}
                  >
                    <MenuItem value="PENDIENTE">Estado de entrega</MenuItem>
                    <MenuItem value="TODOS">TODOS</MenuItem>
                    <MenuItem value="ENTREGADO">ENTREGADO</MenuItem>
                    <MenuItem value="EN_TRANSITO">EN TRÁNSITO</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            
            {/* Fechas - Simplificado según la imagen */}
            <Grid item xs={12} sm={4} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} className="fechas-container">
                {/* Etiqueta de "Fechas" */}
                <Typography variant="body2" sx={{ fontWeight: 'normal', mr: 1 }} className="fechas-label">
                  Fechas
                </Typography>
                
                {/* Selector de fecha inicial (más ancho) */}
                <DatePicker
                  value={fechaInicio}
                  onChange={(newValue) => setFechaInicio(newValue)}
                  inputFormat="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { width: '150px' }, // Aumentado para mostrar fecha completa
                      className: "date-picker"
                    }
                  }}
                />
                
                <Typography variant="body2" className="date-separator">—</Typography>
                
                {/* Selector de fecha final (más ancho) */}
                <DatePicker
                  value={fechaFin}
                  onChange={(newValue) => setFechaFin(newValue)}
                  inputFormat="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { width: '150px' }, // Aumentado para mostrar fecha completa
                      className: "date-picker"
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Segundo div: Filtros (sin las fechas) */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 2, 
            borderRadius: 1,
            backgroundColor: 'white'
          }}
          className="filtros-panel"
        >
          <Grid container spacing={2}>
            {/* Filtros con ancho reducido */}
            <Grid item xs={12}>
              <Grid container spacing={2} className="filtros-container">
                <Grid item xs={12} sm={3} className="filtro-item">
                  <FormControl fullWidth size="small">
                    <InputLabel>Filtro de</InputLabel>
                    <Select
                      value={filtroDE}
                      onChange={(e) => setFiltroDE(e.target.value)}
                      label="Filtro de"
                      sx={{ minWidth: '170px' }}
                    >
                      <MenuItem value="TODOS">TODOS</MenuItem>
                      <MenuItem value="OPCION1">OPCIÓN 1</MenuItem>
                      <MenuItem value="OPCION2">OPCIÓN 2</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3} className="filtro-item">
                  <FormControl fullWidth size="small">
                    <InputLabel>Departamento</InputLabel>
                    <Select
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                      label="Departamento"
                      sx={{ minWidth: '170px' }}
                    >
                      <MenuItem value="TODOS">TODOS</MenuItem>
                      <MenuItem value="LIMA">LIMA</MenuItem>
                      <MenuItem value="AREQUIPA">AREQUIPA</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3} className="filtro-item">
                  <FormControl fullWidth size="small">
                    <InputLabel>Pedidos</InputLabel>
                    <Select
                      value={pedidosFiltro}
                      onChange={(e) => setPedidosFiltro(e.target.value)}
                      label="Pedidos"
                      sx={{ minWidth: '170px' }}
                    >
                      <MenuItem value="TODOS">TODOS</MenuItem>
                      <MenuItem value="PENDIENTES">PENDIENTES</MenuItem>
                      <MenuItem value="ENTREGADOS">ENTREGADOS</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3} className="filtro-item">
                  <FormControl fullWidth size="small">
                    <InputLabel>Transportadora</InputLabel>
                    <Select
                      value={transportadora}
                      onChange={(e) => setTransportadora(e.target.value)}
                      label="Transportadora"
                      sx={{ minWidth: '170px' }}
                    >
                      <MenuItem value="TODOS">TODOS</MenuItem>
                      <MenuItem value="OLVA">OLVA</MenuItem>
                      <MenuItem value="SHALOM">SHALOM</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de pedidos con borde sutil */}
        <TableContainer 
          sx={{ 
            backgroundColor: 'white', 
            borderRadius: 1,
            border: '1px solid rgba(224, 224, 224, 0.4)',
            boxShadow: 'none'
          }}
          className="tabla-pedidos"
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }} className="cabecera-tabla">
                <TableCell padding="checkbox" width="40px"></TableCell>
                <TableCell>Fecha entrega</TableCell>
                <TableCell align="center" width="100px">Pedidos</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidosData.map((item, index) => {
                // Extraer el primer número del total (el total principal)
                const mainTotal = item.total.split('-')[0].trim();
                // El resto son rangos
                const ranges = item.total.includes('-') ? 
                  item.total.substring(mainTotal.length).trim() : '';
                
                return (
                  <TableRow key={index} hover>
                    <TableCell padding="checkbox">
                      <IconButton 
                        size="small"
                        sx={{
                          backgroundColor: '#f0f0f0',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          '&:hover': {
                            backgroundColor: '#e0e0e0',
                          }
                        }}
                        className="expand-button"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell>{item.fecha}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={item.pedidos} 
                        size="small" 
                        sx={{
                          bgcolor: '#9e9e9e',
                          color: 'white',
                          fontWeight: 'bold',
                          minWidth: '32px'
                        }}
                        className="pedidos-chip"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography component="span" fontWeight="bold">
                        {mainTotal}
                      </Typography>
                      {ranges && (
                        <Typography component="span" color="text.secondary">
                          {ranges}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </LocalizationProvider>
  );
};

export default SeguimientoContraentrega;