import React from 'react';
import { Box, Button, Typography, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';

function AlmacenDashboard() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [estadoProducto, setEstadoProducto] = React.useState('TODOS');

  const datosTabla = [
    {
      tienda: 'ALMACEN-WOW',
      almacen: 'N-WOW',
      soporteAlmacen: 'S1918247574',
      contraentrega: '20 ciudades de la cobertura (24 - 72 hrs)',
    },
    
  ];

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
        <TableContainer
          component={Paper}
          sx={{
            mb: 4,
            boxShadow: 'none', 
            border: 'none',     
            flexGrow: 1,
          }}
        >
          <Table sx={{ minWidth: 750 }} size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                {['Tienda', 'Almacen', 'Soporte almacen', 'Contraentrega en', 'Editar']
                  .map(header => (
                    <TableCell
                      key={header}
                      sx={{
                        fontWeight: 'bold',
                        border: '1px solid #e0e0e0', 
                        textAlign: 'center', 
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {datosTabla.map((row, index) => (
                <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                  <TableCell
                    sx={{
                      border: '1px solid #e0e0e0', 
                      textAlign: 'center',
                    }}
                  >
                    <Typography>{row.tienda}</Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      border: '1px solid #e0e0e0', 
                      textAlign: 'center',
                      
                    }}
                  >
                    {row.almacen}
                  </TableCell>
                  <TableCell
                    sx={{
                      border: '1px solid #e0e0e0', 
                      textAlign: 'center',
                    }}
                  >
                    {row.soporteAlmacen}
                  </TableCell>
                  <TableCell
                    sx={{
                      border: '1px solid #e0e0e0', 
                      textAlign: 'center',
                    }}
                  >
                    {row.contraentrega}
                  </TableCell>
                  <TableCell
                    sx={{
                      border: '1px solid #e0e0e0', 
                      textAlign: 'center',
                    }}
                  >
                    <Button variant="text" size="small" sx={{ textTransform: 'none' }}>Editar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default AlmacenDashboard;