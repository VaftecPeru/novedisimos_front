import React, { useState } from 'react';
import { 
  Box, Button, TextField, InputAdornment, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, FormControl, Select, MenuItem,
  IconButton, Typography, Chip, Drawer, Divider, Radio, RadioGroup, FormControlLabel
} from '@mui/material';
import { Search, WhatsApp, FilterList, MusicNote, Instagram, Close, Add, Save } from '@mui/icons-material';
import './PedidosDashboard.css';

const EstadoChip = ({ estado, estadoAdicional }) => {
  const colorMap = {
    'IN-WOW': '#3884f7',
    'ADMITIDO': '#10b981',
    'POR DERIVAR': '#f59e0b',
    'FINAL DE ENTREGA': '#8b5cf6',
    'default': '#4763e4'
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Chip 
        label={estado} 
        sx={{ bgcolor: '#4763e4', color: 'white', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }} 
      />
      {estadoAdicional && (
        <Chip 
          label={estadoAdicional} 
          sx={{ bgcolor: colorMap[estadoAdicional] || colorMap.default, color: 'white', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }} 
        />
      )}
    </Box>
  );
};

const FechaItem = ({ label, fecha }) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <Typography variant="caption" sx={{ color: '#6b7280' }}>{label}:</Typography>
    <Typography variant="caption">{fecha}</Typography>
  </Box>
);

function PedidosDashboard() {
  const [filtros, setFiltros] = useState({
    estado: 'CONFIRMADO',
    estadoEntrega: '',
    almacen: 'TODOS',
    fechaInicio: '2023-03-12',
    fechaFin: '2023-03-27',
    searchTerm: ''
  });
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const estadoInicial = {
    numeroOrden: '',
    canal: 'Shopify',
    nota: '',
    
    cliente: '',
    telefono: '',
    
    departamento: '',
    provincia: '',
    distrito: '',
    direccion: '',
    referencia: '',
    gps: '',
    
    productos: [],
    estado: 'CONFIRMADO',
    estadoAdicional: 'IN-WOW',
    medioPago: '',
    total: '',
    notaAdicional: ''
  };
  
  const [nuevoPedido, setNuevoPedido] = useState(estadoInicial);
  const [nuevoProducto, setNuevoProducto] = useState({ descripcion: '', cantidad: 1, precio: '' });

  const [pedidos] = useState([
    {
      id: 'NOW004351',
      cliente: 'Denisse Peña Obregon Erika',
      ubicacion: 'Jr piñac mz.u lt 3-3 - Lurigancho - Ate',
      estado: 'CONFIRMADO',
      estadoAdicional: 'IN-WOW',
      importes: {
        total: 'S/ 121.00',
        detalles: [
          { descripcion: '1 KIT DE 12 BOLSIGATOS PARA UÑAS', valor: '' },
          { descripcion: '2 CAJA DE 10 PARCHES DESINTOXICANTES', valor: '' },
          { descripcion: '1 PRODUCTO SORPRESA DE REGALO', valor: '' }
        ]
      },
      fechas: {
        registro: '27/03/2023',
        despacho: '27/03/2023',
        entrega: '28/03/2023'
      }
    }
  ]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros({ ...filtros, [campo]: valor });
  };

  const handleFormChange = (e) => {
    setNuevoPedido({ ...nuevoPedido, [e.target.name]: e.target.value });
  };
  
  const handleProductoChange = (e) => {
    setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.value });
  };

  const agregarProducto = () => {
    if (nuevoProducto.descripcion && nuevoProducto.precio) {
      setNuevoPedido({
        ...nuevoPedido,
        productos: [...nuevoPedido.productos, {
          descripcion: `${nuevoProducto.cantidad} ${nuevoProducto.descripcion}`,
          valor: `S/ ${nuevoProducto.precio}`
        }]
      });
      setNuevoProducto({ descripcion: '', cantidad: 1, precio: '' });
    }
  };

  const guardarPedido = () => {
    setDrawerOpen(false);
    setNuevoPedido(estadoInicial);
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    const { estado, estadoEntrega, searchTerm } = filtros;
    if (estado && pedido.estado !== estado) return false;
    if (estadoEntrega && pedido.estadoAdicional !== estadoEntrega) return false;
    if (searchTerm && !pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !pedido.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <Box sx={{ p: 3, bgcolor: '#f9fafb', minHeight: '100vh', width: '100%', boxSizing: 'border-box', overflowX: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Pedidos</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {[MusicNote, Instagram, WhatsApp].map((Icon, idx) => (
            <IconButton key={idx} color="primary"><Icon /></IconButton>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          sx={{ bgcolor: '#4f46e5', borderRadius: '20px', '&:hover': { bgcolor: '#4338ca' } }}
          onClick={() => setDrawerOpen(true)}
          startIcon={<Add />}
        >
          Nuevo Pedido
        </Button>

        <TextField
          placeholder="Buscar..."
          variant="outlined"
          size="small"
          value={filtros.searchTerm}
          onChange={(e) => handleFiltroChange('searchTerm', e.target.value)}
          sx={{ minWidth: 250, bgcolor: 'white' }} 
          InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }}
        />

        <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
          <Select
            value={filtros.estado}
            onChange={(e) => handleFiltroChange('estado', e.target.value)}
            sx={{ height: 40 }}
          >
            {['CONFIRMADO', 'PENDIENTE', 'CANCELADO'].map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
          <Select
            value={filtros.estadoEntrega}
            onChange={(e) => handleFiltroChange('estadoEntrega', e.target.value)}
            renderValue={selected => selected || "Selecciona estados"}
            sx={{ height: 40 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {['IN-WOW', 'ADMITIDO', 'POR DERIVAR', 'FINAL DE ENTREGA'].map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
          <Select
            value={filtros.almacen}
            onChange={(e) => handleFiltroChange('almacen', e.target.value)}
            sx={{ height: 40 }}
          >
            {['TODOS', 'LIMA', 'PROVINCIA'].map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>Filtrar por:</Typography>
          <FormControl size="small" sx={{ minWidth: 180, bgcolor: 'white' }}>
            <Select value="fecha" sx={{ height: 40 }}>
              <MenuItem value="fecha">Fecha Actualización</MenuItem>
              <MenuItem value="creacion">Fecha Creación</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {['fechaInicio', 'fechaFin'].map(campo => (
            <TextField
              key={campo}
              type="date"
              size="small"
              value={filtros[campo]}
              onChange={(e) => handleFiltroChange(campo, e.target.value)}
              sx={{ width: 160, bgcolor: 'white' }}
            />
          ))}
        </Box>

        <Button 
          variant="outlined"
          startIcon={<FilterList />}
          sx={{ bgcolor: 'white', borderColor: '#4763e4', color: '#4763e4' }}
        >
          Más filtros
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f3f4f6' }}>
              {['Order', 'Actions', 'Delivery', 'Trazabilidad', 'Importes', 'Pagos', 'Products', 'Nota', 'Cliente', 'Ubicación', 'Fechas']
                .map(header => <TableCell key={header} sx={{ fontWeight: 'bold' }}>{header}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidosFiltrados.map((pedido) => (
              <TableRow key={pedido.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                <TableCell>{pedido.id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" sx={{ color: '#10b981' }}><WhatsApp fontSize="small" /></IconButton>
                    <IconButton size="small" sx={{ color: '#6b7280' }}><Search fontSize="small" /></IconButton>
                  </Box>
                </TableCell>
                <TableCell><EstadoChip estado={pedido.estado} estadoAdicional={pedido.estadoAdicional} /></TableCell>
                <TableCell><IconButton size="small" sx={{ color: '#f59e0b' }}><FilterList fontSize="small" /></IconButton></TableCell>
                <TableCell>
                  <Box>{pedido.importes.total}
                    <Box sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                      {pedido.importes.detalles.map((detalle, idx) => (
                        <Typography key={idx} variant="caption" display="block">{detalle.descripcion}</Typography>
                      ))}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  {pedido.importes.detalles.map((detalle, idx) => (
                    <Typography key={idx} variant="caption" display="block">{detalle.descripcion}</Typography>
                  ))}
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell sx={{ maxWidth: 150 }}><Typography noWrap>{pedido.cliente}</Typography></TableCell>
                <TableCell sx={{ maxWidth: 200 }}><Typography variant="body2" noWrap>{pedido.ubicacion}</Typography></TableCell>
                <TableCell>
                  <Box sx={{ fontSize: '0.75rem' }}>
                    <FechaItem label="R" fecha={pedido.fechas.registro} />
                    <FechaItem label="D" fecha={pedido.fechas.despacho} />
                    <FechaItem label="E" fecha={pedido.fechas.entrega} />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: '500px', boxSizing: 'border-box', padding: 3 } }}
      >
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Nuevo Pedido</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}><Close /></IconButton>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">Nueva Orden</Typography>
            
            <TextField
              label="Nota"
              name="nota"
              value={nuevoPedido.nota}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={3}
              size="small"
            />
            
            <FormControl fullWidth size="small">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography component="span" color="error" sx={{ minWidth: '8px' }}>*</Typography>
                <Typography variant="body2">Canal:</Typography>
              </Box>
              <Select
                name="canal"
                value={nuevoPedido.canal}
                onChange={handleFormChange}
              >
                <MenuItem value="Shopify">Shopify</MenuItem>
                <MenuItem value="Instagram">Instagram</MenuItem>
                <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                <MenuItem value="Facebook">Facebook</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Cliente</Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="span" color="error" sx={{ minWidth: '8px' }}>*</Typography>
              <Typography variant="body2">Nombres y Apellidos:</Typography>
            </Box>
            <TextField
              name="cliente"
              value={nuevoPedido.cliente}
              onChange={handleFormChange}
              fullWidth
              size="small"
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="span" color="error" sx={{ minWidth: '8px' }}>*</Typography>
              <Typography variant="body2">Móvil:</Typography>
            </Box>
            <TextField
              name="telefono"
              value={nuevoPedido.telefono}
              onChange={handleFormChange}
              fullWidth
              size="small"
            />
            
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Entrega</Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="span" color="error" sx={{ minWidth: '8px' }}>*</Typography>
              <Typography variant="body2">Departamento:</Typography>
            </Box>
            <FormControl fullWidth size="small">
              <Select
                name="departamento"
                value={nuevoPedido.departamento}
                onChange={handleFormChange}
              >
                <MenuItem value="Lima">Lima</MenuItem>
                <MenuItem value="Arequipa">Arequipa</MenuItem>
                <MenuItem value="Cusco">Cusco</MenuItem>
                <MenuItem value="Trujillo">Trujillo</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="span" color="error" sx={{ minWidth: '8px' }}>*</Typography>
              <Typography variant="body2">Provincia:</Typography>
            </Box>
            <FormControl fullWidth size="small">
              <Select
                name="provincia"
                value={nuevoPedido.provincia}
                onChange={handleFormChange}
              >
                <MenuItem value="Lima">Lima</MenuItem>
                <MenuItem value="Callao">Callao</MenuItem>
                <MenuItem value="Cañete">Cañete</MenuItem>
                <MenuItem value="Huaral">Huaral</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="span" color="error" sx={{ minWidth: '8px' }}>*</Typography>
              <Typography variant="body2">Distrito:</Typography>
            </Box>
            <FormControl fullWidth size="small">
              <Select
                name="distrito"
                value={nuevoPedido.distrito}
                onChange={handleFormChange}
              >
                <MenuItem value="San Isidro">San Isidro</MenuItem>
                <MenuItem value="Miraflores">Miraflores</MenuItem>
                <MenuItem value="San Borja">San Borja</MenuItem>
                <MenuItem value="Surco">Surco</MenuItem>
                <MenuItem value="La Molina">La Molina</MenuItem>
                <MenuItem value="Ate">Ate</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="span" color="error" sx={{ minWidth: '8px' }}>*</Typography>
              <Typography variant="body2">Dirección:</Typography>
            </Box>
            <TextField
              name="direccion"
              value={nuevoPedido.direccion}
              onChange={handleFormChange}
              fullWidth
              size="small"
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="span" color="error" sx={{ minWidth: '8px' }}>*</Typography>
              <Typography variant="body2">Referencia:</Typography>
            </Box>
            <TextField
              name="referencia"
              value={nuevoPedido.referencia}
              onChange={handleFormChange}
              fullWidth
              size="small"
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="span" color="error" sx={{ minWidth: '8px' }}>*</Typography>
              <Typography variant="body2">GPS:</Typography>
            </Box>
            <TextField
              name="gps"
              value={nuevoPedido.gps}
              onChange={handleFormChange}
              fullWidth
              size="small"
              placeholder="Latitud,Longitud"
            />
            
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Estado del Pedido</Typography>
            
            <FormControl component="fieldset">
              <RadioGroup row name="estado" value={nuevoPedido.estado} onChange={handleFormChange}>
                {['CONFIRMADO', 'PENDIENTE', 'CANCELADO'].map(opt => (
                  <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
                ))}
              </RadioGroup>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <Select
                name="estadoAdicional"
                value={nuevoPedido.estadoAdicional}
                onChange={handleFormChange}
              >
                {['IN-WOW', 'ADMITIDO', 'POR DERIVAR', 'FINAL DE ENTREGA'].map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Productos</Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Cantidad"
                name="cantidad"
                type="number"
                value={nuevoProducto.cantidad}
                onChange={handleProductoChange}
                size="small"
                sx={{ width: '100px' }}
              />
              <TextField
                label="Descripción"
                name="descripcion"
                value={nuevoProducto.descripcion}
                onChange={handleProductoChange}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Precio"
                name="precio"
                type="number"
                value={nuevoProducto.precio}
                onChange={handleProductoChange}
                size="small"
                sx={{ width: '100px' }}
                InputProps={{ startAdornment: <InputAdornment position="start">S/</InputAdornment> }}
              />
              <Button 
                variant="contained" 
                onClick={agregarProducto}
                sx={{ width: '40px', minWidth: '40px', height: '40px', p: 0 }}
              >
                <Add />
              </Button>
            </Box>
            
            {nuevoPedido.productos.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Productos añadidos:</Typography>
                
                {nuevoPedido.productos.map((producto, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2">{producto.descripcion}</Typography>
                    <Typography variant="body2">{producto.valor}</Typography>
                  </Box>
                ))}
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <TextField
                    label="Total"
                    name="total"
                    value={nuevoPedido.total}
                    onChange={handleFormChange}
                    size="small"
                    sx={{ width: '100px' }}
                    InputProps={{ startAdornment: <InputAdornment position="start">S/</InputAdornment> }}
                  />
                </Box>
              </Paper>
            )}
            
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Nota Adicional</Typography>
            <TextField
              label="Nota adicional"
              name="notaAdicional"
              value={nuevoPedido.notaAdicional}
              onChange={handleFormChange}
              multiline
              rows={3}
              fullWidth
            />
            
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Medio de Pago</Typography>
            <FormControl component="fieldset">
              <RadioGroup row name="medioPago" value={nuevoPedido.medioPago} onChange={handleFormChange}>
                {['EFECTIVO', 'TRANSFERENCIA', 'YAPE', 'PLIN'].map(opt => (
                  <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
                ))}
              </RadioGroup>
            </FormControl>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={() => setDrawerOpen(false)}>Cancelar</Button>
              <Button 
                variant="contained" 
                onClick={guardarPedido}
                startIcon={<Save />}
                sx={{ bgcolor: '#4f46e5' }}
              >
                Guardar Pedido
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}

export default PedidosDashboard;
