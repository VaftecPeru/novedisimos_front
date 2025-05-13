import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function InformeDashboard() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false); 

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '20px',
      width: '170px',
      '& .MuiInputBase-input': {
        padding: '8px 16px',
        fontSize: '1.1em',
      },
    },
  };

  const informeSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    width: '100%',
    padding: '16px',
    backgroundColor: 'white',
    borderBottom: '2px solid #f2f2f2',
    height: '175px',
    marginTop: '10px',
  };

  return (
    <div
      className="top-left-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        backgroundColor: 'white',
        flexGrow: 1,
        width: '100%',
      }}
    >
      <div
        className="informe dashboard"
        style={{
          display: 'flex',
          flexDirection: 'column', 
          flexGrow: 1,
          width: '100%',
          height: 'auto',
          marginTop: '10px',
          backgroundColor: 'white',
        }}
      >
        <div
          className="informe section"
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            width: '100%',
            padding: '16px',
            backgroundColor: 'white',
            borderBottom: '2px solid #f2f2f2',
            borderTop: '2px solid #f2f2f2',
            height: '175px',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#434343',
              marginLeft: '0px',
              marginBottom: '45px',
              marginTop: '15px',
            }}
          >
            Reporte de remanentes
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                color: '#434343',
              }}
            >
              Seleccionar fechas
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Desde"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: textFieldStyle,
                  },
                }}
              />
              <Box sx={{ mx: 1 }}>-</Box>
              <DatePicker
                label="Hasta"
                value={endDate}
                onChange={(newValue) => {
                  setEndDate(newValue);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: textFieldStyle,
                  },
                }}
              />
            </LocalizationProvider>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#4763e4',
                color: 'white',
                borderRadius: '20px',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                  borderColor: '#435ca7',
                },
                padding: '4px 14px',
                marginLeft: '10px',
              }}
              onClick={() => setDrawerOpen(true)}
              disableTypography
            >
              Descargar Reporte
            </Button>
          </Box>
        </div>
        <div className="informe section" style={informeSectionStyle}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#434343',
              marginLeft: '0px',
              marginBottom: '45px', 
              marginTop: '10px',
            }}
          >
            Reporte de despacho 
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                color: '#434343',
              }}
            >
              Transportadora
            </Typography>
            <TextField
              select
              defaultValue="TODOS"
              size="small"
              sx={{
                width: '120px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRadius: '20px',
                },
              }}
            >
              <option value="TODOS">TODOS</option>
            </TextField>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                color: '#434343',
                marginLeft: '15px',
              }}
            >
              Filtrar por
            </Typography>
            <input type="radio" id="fechaDespacho" name="filtroFecha" value="fechaDespacho" />
            <label htmlFor="fechaDespacho" style={{ marginRight: '10px' }}>Fecha despacho</label>
            <input type="radio" id="fechaEntrega" name="filtroFecha" value="fechaEntrega" />
            <label htmlFor="fechaEntrega" style={{ marginRight: '20px' }}>Fecha entrega</label>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                color: '#434343',
              }}
            >
              Seleccionar fechas
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Desde"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: textFieldStyle,
                  },
                }}
              />
              <Box sx={{ mx: 1 }}>-</Box>
              <DatePicker
                label="Hasta"
                value={endDate}
                onChange={(newValue) => {
                  setEndDate(newValue);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: textFieldStyle,
                  },
                }}
              />
            </LocalizationProvider>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#4763e4',
                color: 'white',
                borderRadius: '20px',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                  borderColor: '#435ca7',
                },
                padding: '4px 14px',
                marginLeft: '10px',
              }}
              onClick={() => setDrawerOpen(true)}
              disableTypography
            >
              Descargar Reporte
            </Button>
          </Box>
        </div>
        <div className="informe section" style={informeSectionStyle}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#434343',
              marginLeft: '0px',
              marginBottom: '45px',
              marginTop: '10px',
            }}
          >
            Reporte de movimientos
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                color: '#434343',
              }}
            >
              Seleccionar fechas
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Desde"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: textFieldStyle,
                  },
                }}
              />
              <Box sx={{ mx: 1 }}>-</Box>
              <DatePicker
                label="Hasta"
                value={endDate}
                onChange={(newValue) => {
                  setEndDate(newValue);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: textFieldStyle,
                  },
                }}
              />
            </LocalizationProvider>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#4763e4',
                color: 'white',
                borderRadius: '20px',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                  borderColor: '#435ca7',
                },
                padding: '4px 14px',
                marginLeft: '10px',
              }}
              onClick={() => setDrawerOpen(true)}
              disableTypography
            >
              Descargar Reporte
            </Button>
          </Box>
        </div>
        <div className="informe section" style={informeSectionStyle}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#434343',
              marginLeft: '0px',
              marginBottom: '45px', 
              marginTop: '10px',
            }}
          >
            Reporte de ventas de mis productos
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                color: '#434343',
              }}
            >
              Transportadora
            </Typography>
            <TextField
              select
              defaultValue="TODOS"
              size="small"
              sx={{
                width: '120px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRadius: '20px',
                },
              }}
            >
              <option value="TODOS">TODOS</option>
            </TextField>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                color: '#434343',
                marginLeft: '15px',
              }}
            >
              Filtrar fecha entrega
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Desde"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: textFieldStyle,
                  },
                }}
              />
              <Box sx={{ mx: 1 }}>-</Box>
              <DatePicker
                label="Hasta"
                value={endDate}
                onChange={(newValue) => {
                  setEndDate(newValue);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: textFieldStyle,
                  },
                }}
              />
            </LocalizationProvider>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                color: '#434343',
                marginLeft: '10px',
              }}
            >
              Ecommerce
            </Typography>
            <TextField
              select
              defaultValue=" "
              size="small"
              sx={{
                width: '180px', 
                borderRadius: '20px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRadius: '20px',
                  width: '180px',
                },
                '& .MuiSelect-select': {
                  paddingRight: '32px', 
                  textAlign: 'left', 
                },
                '& .MuiSelect-icon': {
                  right: '8px', 
                  position: 'absolute', 
                  pointerEvents: 'none', 
                },
              }}
            >
              <option value="ALICLICK">ALICLICK</option>
            </TextField>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#4763e4',
                color: 'white',
                borderRadius: '20px',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                  borderColor: '#435ca7',
                },
                padding: '4px 14px',
                marginLeft: '10px',
              }}
              onClick={() => setDrawerOpen(true)}
              disableTypography
            >
              Descargar Reporte
            </Button>
            </Box>
        </div>
        <div className="informe section" style={informeSectionStyle}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#434343',
              marginLeft: '0px',
              marginBottom: '45px',
              marginTop: '10px',
            }}
          >
            Reporte de stock actual
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#4763e4',
                color: 'white',
                borderRadius: '20px',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                  borderColor: '#435ca7',
                },
                padding: '4px 14px',
                marginLeft: '0px',
              }}
              onClick={() => setDrawerOpen(true)}
              disableTypography
            >
              Descargar Reporte
            </Button>
          </Box>
        </div>
      </div>
    </div>
  );
}

export default InformeDashboard;