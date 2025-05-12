import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function InformeDashboard() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '20px',
      width: '180px', 
      '& .MuiInputBase-input': {
        padding: '8px 14px',
        fontSize: '1.1em',
      },
    },
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
            width: '98%',
            padding: '16px',
            backgroundColor: 'white',
            borderBottom: '2px solid #f2f2f2',
            borderTop: '2px solid #f2f2f2',
            height: '180px',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#434343',
              marginTop: '10px',
              marginBottom: '50px',
            }}
          >
            Reporte de Remanentes
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
          </Box>
        </div>
      </div>
    </div>
  );
}

export default InformeDashboard;