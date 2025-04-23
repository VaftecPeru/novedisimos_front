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

  const [provinciasAmazonas] = useState([
    { value: 'Bagua', label: 'Bagua' },
    { value: 'Bongará', label: 'Bongará' },
    { value: 'Chachapoyas', label: 'Chachapoyas' },
    { value: 'Condorcanqui', label: 'Condorcanqui' },
    { value: 'Luya', label: 'Luya' },
    { value: 'Rodríguez de Mendoza', label: 'Rodríguez de Mendoza' },
    { value: 'Utcubamba', label: 'Utcubamba' },
  ]);

  const [provinciasAncash] = useState([
    { value: 'Aija', label: 'Aija' },
    { value: 'Antonio Raymondi', label: 'Antonio Raymondi' },
    { value: 'Asunción', label: 'Asunción' },
    { value: 'Bolognesi', label: 'Bolognesi' },
    { value: 'Carhuaz', label: 'Carhuaz' },
    { value: 'Carlos Fermín Fitzcarrald', label: 'Carlos Fermín Fitzcarrald' },
    { value: 'Casma', label: 'Casma' },
    { value: 'Corongo', label: 'Corongo' },
    { value: 'Huaraz', label: 'Huaraz' },
    { value: 'Huari', label: 'Huari' },
    { value: 'Huarmey', label: 'Huarmey' },
    { value: 'Huaylas', label: 'Huaylas' },
    { value: 'Mariscal Luzuriaga', label: 'Mariscal Luzuriaga' },
    { value: 'Ocros', label: 'Ocros' },
    { value: 'Pallasca', label: 'Pallasca' },
    { value: 'Pomabamba', label: 'Pomabamba' },
    { value: 'Recuay', label: 'Recuay' },
    { value: 'Santa', label: 'Santa' },
    { value: 'Sihuas', label: 'Sihuas' },
    { value: 'Yungay', label: 'Yungay' },
  ]);

  const [provinciasApurimac] = useState([
    { value: 'Abancay', label: 'Abancay' },
    { value: 'Andahuaylas', label: 'Andahuaylas' },
    { value: 'Antabamba', label: 'Antabamba' },
    { value: 'Aymaraes', label: 'Aymaraes' },
    { value: 'Cotabambas', label: 'Cotabambas' },
    { value: 'Chincheros', label: 'Chincheros' },
    { value: 'Grau', label: 'Grau' },
  ]);

  const [provinciasArequipa] = useState([
    { value: 'Arequipa', label: 'Arequipa' },
    { value: 'Camaná', label: 'Camaná' },
    { value: 'Caravelí', label: 'Caravelí' },
    { value: 'Castilla', label: 'Castilla' },
    { value: 'Caylloma', label: 'Caylloma' },
    { value: 'Condesuyos', label: 'Condesuyos' },
    { value: 'Islay', label: 'Islay' },
    { value: 'La Unión', label: 'La Unión' },
  ]);

  const [provinciasAyacucho] = useState([
    { value: 'Cangallo', label: 'Cangallo' },
    { value: 'Huamanga', label: 'Huamanga' },
    { value: 'Huanca Sancos', label: 'Huanca Sancos' },
    { value: 'Huanta', label: 'Huanta' },
    { value: 'La Mar', label: 'La Mar' },
    { value: 'Lucanas', label: 'Lucanas' },
    { value: 'Parinacochas', label: 'Parinacochas' },
    { value: 'Páucar del Sara Sara', label: 'Páucar del Sara Sara' },
    { value: 'Sucre', label: 'Sucre' },
    { value: 'Víctor Fajardo', label: 'Víctor Fajardo' },
    { value: 'Vilcas Huamán', label: 'Vilcas Huamán' },
  ]);

  const [provinciasCajamarca] = useState([
    { value: 'Cajabamba', label: 'Cajabamba' },
    { value: 'Cajamarca', label: 'Cajamarca' },
    { value: 'Celendín', label: 'Celendín' },
    { value: 'Chota', label: 'Chota' },
    { value: 'Contumazá', label: 'Contumazá' },
    { value: 'Cutervo', label: 'Cutervo' },
    { value: 'Hualgayoc', label: 'Hualgayoc' },
    { value: 'Jaén', label: 'Jaén' },
    { value: 'San Ignacio', label: 'San Ignacio' },
    { value: 'San Marcos', label: 'San Marcos' },
    { value: 'San Miguel', label: 'San Miguel' },
    { value: 'San Pablo', label: 'San Pablo' },
    { value: 'Santa Cruz', label: 'Santa Cruz' },
  ]);

  const [provinciasCallao] = useState([
    { value: 'Callao', label: 'Callao' },
  ]);

  const [provinciasCusco] = useState([
    { value: 'Acomayo', label: 'Acomayo' },
    { value: 'Anta', label: 'Anta' },
    { value: 'Apurímac', label: 'Apurímac' },
    { value: 'Calca', label: 'Calca' },
    { value: 'Canas', label: 'Canas' },
    { value: 'Canchis', label: 'Canchis' },
    { value: 'Chumbivilcas', label: 'Chumbivilcas' },
    { value: 'Espinar', label: 'Espinar' },
    { value: 'La Convención', label: 'La Convención' },
    { value: 'Paruro', label: 'Paruro' },
    { value: 'Paucartambo', label: 'Paucartambo' },
    { value: 'Quispicanchi', label: 'Quispicanchi' },
    { value: 'Urubamba', label: 'Urubamba' }
  ]);

  const [provinciasHuancavelica] = useState([
    { value: 'Acobamba', label: 'Acobamba' },
    { value: 'Angaraes', label: 'Angaraes' },
    { value: 'Castrovirreyna', label: 'Castrovirreyna' },
    { value: 'Churcampa', label: 'Churcampa' },
    { value: 'Huancavelica', label: 'Huancavelica' },
    { value: 'Huaytará', label: 'Huaytará' },
    { value: 'Tayacaja', label: 'Tayacaja' }
  ]);

  const [provinciasHuanuco] = useState([
    { value: 'Ambo', label: 'Ambo' },
    { value: 'Dos de Mayo', label: 'Dos de Mayo' },
    { value: 'Huánuco', label: 'Huánuco' },
    { value: 'Huacaybamba', label: 'Huacaybamba' },
    { value: 'Leoncio Prado', label: 'Leoncio Prado' },
    { value: 'Marañón', label: 'Marañón' },
    { value: 'Pachitea', label: 'Pachitea' },
    { value: 'Panao', label: 'Panao' },
    { value: 'Rupa-Rupa', label: 'Rupa-Rupa' },
    { value: 'Yarowilca', label: 'Yarowilca' }
  ]);

  const [provinciasIca] = useState([
    { value: 'Ica', label: 'Ica' },
    { value: 'Chincha', label: 'Chincha' },
    { value: 'Nasca', label: 'Nasca' },
    { value: 'Palpa', label: 'Palpa' },
    { value: 'Pisco', label: 'Pisco' }
  ]);

  const [provinciasJunin] = useState([
    { value: 'Huancayo', label: 'Huancayo' },
    { value: 'Junín', label: 'Junín' },
    { value: 'Chanchamayo', label: 'Chanchamayo' },
    { value: 'Chupaca', label: 'Chupaca' },
    { value: 'Concepción', label: 'Concepción' },
    { value: 'Jauja', label: 'Jauja' },
    { value: 'Tarma', label: 'Tarma' },
    { value: 'Yauli', label: 'Yauli' },
    { value: 'Satipo', label: 'Satipo' }
  ]);

  const [provinciasLaLibertad] = useState([
    { value: 'Trujillo', label: 'Trujillo' },
    { value: 'Ascope', label: 'Ascope' },
    { value: 'Bolívar', label: 'Bolívar' },
    { value: 'Chepén', label: 'Chepén' },
    { value: 'Gran Chimú', label: 'Gran Chimú' },
    { value: 'Julcán', label: 'Julcán' },
    { value: 'Otuzco', label: 'Otuzco' },
    { value: 'Pacasmayo', label: 'Pacasmayo' },
    { value: 'Pataz', label: 'Pataz' },
    { value: 'Santiago de Chuco', label: 'Santiago de Chuco' },
    { value: 'Gran Chimú', label: 'Gran Chimú' },
    { value: 'Virú', label: 'Virú' }
  ]);

  const [provinciasLambayeque] = useState([
    { value: 'Chiclayo', label: 'Chiclayo' },
    { value: 'Chongoyape', label: 'Chongoyape' },
    { value: 'Eten', label: 'Eten' },
    { value: 'Ferreñafe', label: 'Ferreñafe' },
    { value: 'Lambayeque', label: 'Lambayeque' },
    { value: 'Lagunillas', label: 'Lagunillas' },
    { value: 'Mochumi', label: 'Mochumi' },
    { value: 'Olmos', label: 'Olmos' },
    { value: 'Pítipo', label: 'Pítipo' },
    { value: 'Reque', label: 'Reque' },
    { value: 'Túcume', label: 'Túcume' }
  ]);

  const [provinciasLima] = useState([
    { value: 'Barranca', label: 'Barranca' },
    { value: 'Cajatambo', label: 'Cajatambo' },
    { value: 'Canta', label: 'Canta' },
    { value: 'Cañete', label: 'Cañete' },
    { value: 'Huaral', label: 'Huaral' },
    { value: 'Huarochirí', label: 'Huarochirí' },
    { value: 'Huaura', label: 'Huaura' },
    { value: 'Lima', label: 'Lima' },
    { value: 'Oyón', label: 'Oyón' },
    { value: 'Yauyos', label: 'Yauyos' },
  ]);

  const [provinciasLoreto] = useState([
    { value: 'Maynas', label: 'Maynas' },
    { value: 'Alto Amazonas', label: 'Alto Amazonas' },
    { value: 'Datem del Marañón', label: 'Datem del Marañón' },
    { value: 'Loreto', label: 'Loreto' },
    { value: 'Mariscal Ramón Castilla', label: 'Mariscal Ramón Castilla' },
    { value: 'Requena', label: 'Requena' },
    { value: 'Ucayali', label: 'Ucayali' }
  ]);

  const [provinciasMadreDeDios] = useState([
    { value: 'Tambopata', label: 'Tambopata' },
    { value: 'Manu', label: 'Manu' },
    { value: 'Tahuamanu', label: 'Tahuamanu' }
  ]);

  const [provinciasMoquegua] = useState([
    { value: 'Mariscal Nieto', label: 'Mariscal Nieto' },
    { value: 'Ilo', label: 'Ilo' },
    { value: 'General Sánchez Cerro', label: 'General Sánchez Cerro' },
    { value: 'Pedro Ruiz Gallo', label: 'Pedro Ruiz Gallo' }
  ]);

  const [provinciasPasco] = useState([
    { value: 'Pasco', label: 'Pasco' },
    { value: 'Daniel Alcides Carrión', label: 'Daniel Alcides Carrión' },
    { value: 'Oxapampa', label: 'Oxapampa' }
  ]);

  const [provinciasPiura] = useState([
    { value: 'Piura', label: 'Piura' },
    { value: 'Ayabaca', label: 'Ayabaca' },
    { value: 'Huancabamba', label: 'Huancabamba' },
    { value: 'Morropón', label: 'Morropón' },
    { value: 'Paita', label: 'Paita' },
    { value: 'Sullana', label: 'Sullana' },
    { value: 'Talara', label: 'Talara' },
    { value: 'Sechura', label: 'Sechura' }
  ]);

  const [provinciasPuno] = useState([
    { value: 'Puno', label: 'Puno' },
    { value: 'Azángaro', label: 'Azángaro' },
    { value: 'Carabaya', label: 'Carabaya' },
    { value: 'Chucuito', label: 'Chucuito' },
    { value: 'Huancané', label: 'Huancané' },
    { value: 'Lampa', label: 'Lampa' },
    { value: 'Melgar', label: 'Melgar' },
    { value: 'San Antonio de Putina', label: 'San Antonio de Putina' },
    { value: 'San Román', label: 'San Román' },
    { value: 'Sandia', label: 'Sandia' },
    { value: 'Yunguyo', label: 'Yunguyo' }
  ]);

  const [provinciasSanMartin] = useState([
    { value: 'Moyobamba', label: 'Moyobamba' },
    { value: 'Bellavista', label: 'Bellavista' },
    { value: 'El Dorado', label: 'El Dorado' },
    { value: 'Huallaga', label: 'Huallaga' },
    { value: 'Lamas', label: 'Lamas' },
    { value: 'Mariscal Cáceres', label: 'Mariscal Cáceres' },
    { value: 'Picota', label: 'Picota' },
    { value: 'Rioja', label: 'Rioja' },
    { value: 'San Martín', label: 'San Martín' },
    { value: 'Tocache', label: 'Tocache' }
  ]);

  const [provinciasTacna] = useState([
    { value: 'Tacna', label: 'Tacna' },
    { value: 'Candarave', label: 'Candarave' },
    { value: 'Jorge Basadre', label: 'Jorge Basadre' },
    { value: 'Tarata', label: 'Tarata' }
  ]);

  const [provinciasTumbes] = useState([
    { value: 'Tumbes', label: 'Tumbes' },
    { value: 'Contralmirante Villar', label: 'Contralmirante Villar' },
    { value: 'Zorritos', label: 'Zorritos' }
  ]);

  const [provinciasUcayali] = useState([
    { value: 'Pucallpa', label: 'Pucallpa' },
    { value: 'Atalaya', label: 'Atalaya' },
    { value: 'Coronel Portillo', label: 'Coronel Portillo' },
    { value: 'Padre Abad', label: 'Padre Abad' },
    { value: 'Purús', label: 'Purús' }
  ]);

  const provinciasPorDepartamento = {
    Amazonas: provinciasAmazonas,
    Áncash: provinciasAncash,
    Apurímac: provinciasApurimac,
    Arequipa: provinciasArequipa,
    Ayacucho: provinciasAyacucho,
    Cajamarca: provinciasCajamarca,
    Callao: provinciasCallao,
    Cusco: provinciasCusco,
    Huancavelica: provinciasHuancavelica,
    Huánuco: provinciasHuanuco,
    Ica: provinciasIca,
    Junín: provinciasJunin,
    'La Libertad': provinciasLaLibertad,
    Lambayeque: provinciasLambayeque,
    Lima: provinciasLima,
    Loreto: provinciasLoreto,
    'Madre de Dios': provinciasMadreDeDios,
    Moquegua: provinciasMoquegua,
    Pasco: provinciasPasco,
    Piura: provinciasPiura,
    Puno: provinciasPuno,
    'San Martín': provinciasSanMartin,
    Tacna: provinciasTacna,
    Tumbes: provinciasTumbes,
    Ucayali: provinciasUcayali,
  };

  const distritosAncashData = {
    Huaraz: [
      { value: 'Huaraz', label: 'Huaraz' },
      { value: 'Independencia', label: 'Independencia' },
    ],
    Huarmey: [
      { value: 'Huarmey', label: 'Huarmey' },
      { value: 'Cochapetí', label: 'Cochapetí' },
    ],
    Casma: [
      { value: 'Casma', label: 'Casma' },
      { value: 'Yaután', label: 'Yaután' },
    ],
  };

  const distritosLimaData = {
    Lima: [
      { value: 'Ancón', label: 'Ancón' },
      { value: 'Ate', label: 'Ate' },
      { value: 'Barranco', label: 'Barranco' },
      { value: 'Breña', label: 'Breña' },
      { value: 'Carabayllo', label: 'Carabayllo' },
      { value: 'Chaclacayo', label: 'Chaclacayo' },
      { value: 'Chorrillos', label: 'Chorrillos' },
      { value: 'Cieneguilla', label: 'Cieneguilla' },
      { value: 'Comas', label: 'Comas' },
      { value: 'El Agustino', label: 'El Agustino' },
      { value: 'Independencia', label: 'Independencia' },
      { value: 'Jesús María', label: 'Jesús María' },
      { value: 'La Molina', label: 'La Molina' },
      { value: 'La Victoria', label: 'La Victoria' },
      { value: 'Lince', label: 'Lince' },
      { value: 'Los Olivos', label: 'Los Olivos' },
      { value: 'Lurigancho-Chosica', label: 'Lurigancho-Chosica' },
      { value: 'Lurín', label: 'Lurín' },
      { value: 'Magdalena del Mar', label: 'Magdalena del Mar' },
      { value: 'Pueblo Libre', label: 'Pueblo Libre' },
      { value: 'Miraflores', label: 'Miraflores' },
      { value: 'Pachacámac', label: 'Pachacámac' },
      { value: 'Pucusana', label: 'Pucusana' },
      { value: 'Puente Piedra', label: 'Puente Piedra' },
      { value: 'Rímac', label: 'Rímac' },
      { value: 'San Bartolo', label: 'San Bartolo' },
      { value: 'San Borja', label: 'San Borja' },
      { value: 'San Isidro', label: 'San Isidro' },
      { value: 'San Juan de Lurigancho', label: 'San Juan de Lurigancho' },
      { value: 'San Juan de Miraflores', label: 'San Juan de Miraflores' },
      { value: 'San Luis', label: 'San Luis' },
      { value: 'San Martín de Porres', label: 'San Martín de Porres' },
      { value: 'San Miguel', label: 'San Miguel' },
      { value: 'Santa Anita', label: 'Santa Anita' },
      { value: 'Santa María del Mar', label: 'Santa María del Mar' },
      { value: 'Santa Rosa', label: 'Santa Rosa' },
      { value: 'Santiago de Surco', label: 'Santiago de Surco' },
      { value: 'Surquillo', label: 'Surquillo' },
      { value: 'Villa El Salvador', label: 'Villa El Salvador' },
      { value: 'Villa María del Triunfo', label: 'Villa María del Triunfo' },
      { value: 'San Sebastián', label: 'San Sebastián' },
      { value: 'Santa Eulalia', label: 'Santa Eulalia' },
      { value: 'Ricardo Palma', label: 'Ricardo Palma' },
    ]
  };

  const distritosPorDepartamentoProvincia = {
    Lima: distritosLimaData,
    Áncash: distritosAncashData,
  };

  const [provinciasSeleccionadas, setProvinciasSeleccionadas] = useState([]);
  const [distritosSeleccionados, setDistritosSeleccionados] = useState([]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros({ ...filtros, [campo]: valor });
  };

  const handleFormChange = (e) => {
    setNuevoPedido({ ...nuevoPedido, [e.target.name]: e.target.value });
  
    if (e.target.name === 'departamento') {
      const departamentoSeleccionado = e.target.value;
      const provincias = provinciasPorDepartamento[departamentoSeleccionado] || [];
      setProvinciasSeleccionadas(provincias);
      setNuevoPedido(prevState => ({ ...prevState, provincia: '', distrito: '' }));
      setDistritosSeleccionados([]);
    } else if (e.target.name === 'provincia') {
      const departamentoSeleccionado = nuevoPedido.departamento;
      const provinciaSeleccionada = e.target.value;
      const distritos = distritosPorDepartamentoProvincia[departamentoSeleccionado]?.[provinciaSeleccionada] || [];
  
      setDistritosSeleccionados(distritos);
      setNuevoPedido(prevState => ({ ...prevState, distrito: '' }));
    }
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
                <MenuItem value="Amazonas">Amazonas</MenuItem>
                <MenuItem value="Áncash">Áncash</MenuItem>
                <MenuItem value="Apurímac">Apurímac</MenuItem>
                <MenuItem value="Arequipa">Arequipa</MenuItem>
                <MenuItem value="Ayacucho">Ayacucho</MenuItem>
                <MenuItem value="Cajamarca">Cajamarca</MenuItem>
                <MenuItem value="Callao">Callao</MenuItem>
                <MenuItem value="Cusco">Cusco</MenuItem>
                <MenuItem value="Huancavelica">Huancavelica</MenuItem>
                <MenuItem value="Huánuco">Huánuco</MenuItem>
                <MenuItem value="Ica">Ica</MenuItem>
                <MenuItem value="Junín">Junín</MenuItem>
                <MenuItem value="La Libertad">La Libertad</MenuItem>
                <MenuItem value="Lambayeque">Lambayeque</MenuItem>
                <MenuItem value="Lima">Lima</MenuItem>
                <MenuItem value="Loreto">Loreto</MenuItem>
                <MenuItem value="Madre de Dios">Madre de Dios</MenuItem>
                <MenuItem value="Moquegua">Moquegua</MenuItem>
                <MenuItem value="Pasco">Pasco</MenuItem>
                <MenuItem value="Piura">Piura</MenuItem>
                <MenuItem value="Puno">Puno</MenuItem>
                <MenuItem value="San Martín">San Martín</MenuItem>
                <MenuItem value="Tacna">Tacna</MenuItem>
                <MenuItem value="Tumbes">Tumbes</MenuItem>
                <MenuItem value="Ucayali">Ucayali</MenuItem>
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
                disabled={!nuevoPedido.departamento}
              >
                {provinciasSeleccionadas.map((provincia) => (
                  <MenuItem key={provincia.value} value={provincia.value}>
                    {provincia.label}
                  </MenuItem>
                ))}
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
    disabled={!nuevoPedido.provincia} 
  >
    {distritosSeleccionados.map((distrito) => (
      <MenuItem key={distrito.value} value={distrito.value}>
        {distrito.label}
      </MenuItem>
    ))}
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
