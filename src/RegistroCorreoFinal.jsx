// En RegistroCorreoFinal.jsx
// Y también en App.jsx, Registro.jsx, RegistroCorreo.jsx, etc.
// donde uses esta imagen.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function RegistroCorreoFinal() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [passwordVisible2, setPasswordVisible2] = useState(false);
  const [error, setError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState(false);

  const togglePasswordVisibility1 = () => {
    setPasswordVisible1((prev) => !prev);
  };

  const togglePasswordVisibility2 = () => {
    setPasswordVisible2((prev) => !prev);
  };

  const validateFields = () => {
    let isValid = true;

    setNewPasswordError(false);
    setConfirmNewPasswordError(false);
    setError('');

    if (!newPassword) {
      setNewPasswordError(true);
      isValid = false;
    }
    if (!confirmNewPassword) {
      setConfirmNewPasswordError(true);
      isValid = false;
    }
    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      setNewPasswordError(true);
      setConfirmNewPasswordError(true);
      setError('Las contraseñas no coinciden.');
      isValid = false;
    }

    if (!isValid) {
      setError(error || 'Por favor, completa ambos campos de contraseña.');
    }

    return isValid;
  };

  const handleModifyClick = (event) => {
    event.preventDefault();

    if (validateFields()) {
      setError('');
      console.log('Nueva contraseña:', newPassword);
      console.log('Confirmar nueva contraseña:', confirmNewPassword);
      navigate('/');
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
        src="/images/img.png" 
        alt="Imagen de registro"
        style={{ width: '300px', marginBottom: '20px' }}
      />
      
      <Typography variant="h5" component="h2" sx={{ fontFamily: 'arial, sans-serif', fontWeight: 'normal', marginBottom: '20px', textAlign: 'center' }}>
        Por favor proporcione su nueva contraseña
      </Typography>

      <Box component="form" sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {error && (
          <Typography color="error" sx={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>
            {error}
          </Typography>
        )}

        <Typography sx={{ fontFamily: 'arial, sans-serif', fontSize: '18px', marginBottom: '-10px' }}>Nueva contraseña</Typography>
        <TextField
          type={passwordVisible1 ? 'text' : 'password'}
          placeholder="Ingresa tu contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          fullWidth
          variant="outlined"
          error={newPasswordError}
          helperText={newPasswordError ? 'La nueva contraseña es requerida.' : ''}
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
                boxShadow: 'none',
              },
              '&:hover': {
                boxShadow: 'none',
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={togglePasswordVisibility1}
                  edge="end"
                  sx={{ marginRight: '-5px' }}
                >
                  {passwordVisible1 ? (
                    <VisibilityOff sx={{ fontSize: '20px' }} />
                  ) : (
                    <Visibility sx={{ fontSize: '20px' }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Typography sx={{ fontFamily: 'arial, sans-serif', fontSize: '18px', marginBottom: '-10px' }}>Confirma tu contraseña</Typography>
        <TextField
          type={passwordVisible2 ? 'text' : 'password'}
          placeholder="Ingresa tu contraseña nuevamente"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
          fullWidth
          variant="outlined"
          error={confirmNewPasswordError}
          helperText={confirmNewPasswordError ? 'La confirmación de contraseña es requerida o no coincide.' : ''}
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
                boxShadow: 'none',
              },
              '&:hover': {
                boxShadow: 'none',
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={togglePasswordVisibility2}
                  edge="end"
                  sx={{ marginRight: '-5px' }}
                >
                  {passwordVisible2 ? (
                    <VisibilityOff sx={{ fontSize: '20px' }} />
                  ) : (
                    <Visibility sx={{ fontSize: '20px' }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="button"
          onClick={handleModifyClick}
          variant="contained"
          sx={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#4763e4',
            fontSize: '18px',
            color: 'white',
            marginTop: '10px',
            '&:hover': {
              backgroundColor: '#354db3',
            },
          }}
        >
          Modificar
        </Button>
        
        <Typography variant="body2" sx={{ fontFamily: 'arial, sans-serif', fontWeight: 'normal', textAlign: 'center', marginTop: '10px', fontSize: '18px' }}>
          <Link to="/" style={{ color: '#5c73db', textDecoration: 'underline' }}>Volver a la página de inicio de sesión</Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default RegistroCorreoFinal;