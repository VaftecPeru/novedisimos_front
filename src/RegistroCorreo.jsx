import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
} from '@mui/material';

function RegistroCorreo() {
  const [email, setEmail] = useState(''); 
  const navigate = useNavigate();
  const handleAccessClick = () => {
    if (email) {
      console.log('Correo ingresado:', email);
      navigate('/registro/correo/final'); 
    } else {
      console.log('El campo de correo electrónico no puede estar vacío.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: { xs: '90%', sm: 500, md: 650 },
        maxWidth: 650,
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <img
        src="../images/img.png"
        alt="Imagen de registro"
        style={{ width: '300px', marginBottom: '20px' }}
      />
      
      <Typography variant="h5" component="h2" sx={{ fontFamily: 'arial, sans-serif', fontWeight: 'normal', marginBottom: '20px', textAlign: 'center' }}>
        Confirma tu correo electrónico
      </Typography>

      <Box component="form" sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <Typography sx={{ fontFamily: 'arial, sans-serif', fontSize: '18px', marginBottom: '-10px', marginTop: '0px' }}>Dirección de correo electrónico</Typography>
        <TextField
          type="email"
          placeholder="Ingresa tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              color: '#9fa6b2',
              marginBottom: '5px',
              '& fieldset': {
                borderColor: '#ced4da',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: '#adb8ec',
                borderWidth: '1px',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#adb8ec',
                borderWidth: '1px',
              },
              '&.Mui-focused': {
                boxShadow: '0 0 0 1px rgba(71, 99, 228, 0.25)',
              },
              '&:hover': {
                boxShadow: 'none',
              },
            },
          }}
        />
        <Button
          type="button"
          onClick={handleAccessClick} 
          variant="contained"
          sx={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#4763e4',
            fontSize: '18px',
            color: 'white',
            marginTop: '0px',
            '&:hover': {
              backgroundColor: '#354db3',
            },
          }}
        >
          Acceso
        </Button>
        <Typography variant="body2" sx={{ fontFamily: 'arial, sans-serif', fontWeight: 'normal', textAlign: 'center', marginTop: '10px', fontSize: '18px' }}>
          <Link to="/" style={{ color: '#5c73db', textDecoration: 'underline' }}>Volver a la página de inicio de sesión</Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default RegistroCorreo;