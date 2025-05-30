import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function Registro() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [passwordVisible2, setPasswordVisible2] = useState(false);
  const [error, setError] = useState(''); 
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility1 = () => {
    setPasswordVisible1((prev) => !prev);
  };

  const togglePasswordVisibility2 = () => {
    setPasswordVisible2((prev) => !prev);
  };

  const validateFields = () => {
    let isValid = true;

    // Reiniciar errores
    setEmailError(false);
    setPhoneError(false);
    setPasswordError(false);
    setConfirmPasswordError(false);
    setTermsError(false);
    setError('');

    if (!email) {
      setEmailError(true);
      isValid = false;
    }
    if (!phone) {
      setPhoneError(true);
      isValid = false;
    }
    if (!password) {
      setPasswordError(true);
      isValid = false;
    }
    if (!confirmPassword) {
      setConfirmPasswordError(true);
      isValid = false;
    }
    if (!termsAccepted) {
      setTermsError(true);
      isValid = false;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError(true);
      setConfirmPasswordError(true);
      setError('Las contraseñas no coinciden.');
      isValid = false;
    }

    if (!isValid) {
      setError(error || 'Por favor, completa todos los campos requeridos y acepta los términos.');
    }

    return isValid;
  };

  const handleClick = (event) => {
    event.preventDefault(); 

    if (validateFields()) {
      setError('');
      navigate('/registro/correo');
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
        Por favor proporcione su información de registro
      </Typography>
      <Box component="form" sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {error && (
          <Typography color="error" sx={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>
            {error}
          </Typography>
        )}

        <Typography sx={{ fontFamily: 'arial, sans-serif', fontSize: '18px', marginBottom: '-10px' }}>Dirección de correo electrónico</Typography>
        <TextField
          type="email"
          placeholder="Ingresa tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          variant="outlined"
          error={emailError} 
          helperText={emailError ? 'El correo electrónico es requerido.' : ''} 
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
        />

        <Typography sx={{ fontFamily: 'arial, sans-serif', fontSize: '18px', marginBottom: '-10px' }}>Numero de teléfono</Typography>
        <TextField
          type="tel" 
          placeholder="Ingresa tu número telefónico"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          fullWidth
          variant="outlined"
          error={phoneError}
          helperText={phoneError ? 'El número de teléfono es requerido.' : ''}
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
        />

        <Typography sx={{ fontFamily: 'arial, sans-serif', fontSize: '18px', marginBottom: '-10px' }}>Contraseña</Typography>
        <TextField
          type={passwordVisible1 ? 'text' : 'password'}
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          variant="outlined"
          error={passwordError}
          helperText={passwordError ? 'La contraseña es requerida.' : ''}
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
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          variant="outlined"
          error={confirmPasswordError}
          helperText={confirmPasswordError ? 'La confirmación de contraseña es requerida o no coincide.' : ''}
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

        <FormControlLabel
          control={
            <Checkbox
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              sx={{ color: termsError ? 'red' : 'primary', marginRight:'2px', marginTop:'-10px' }} 
            />
          }
          label={
            <Typography sx={{ fontFamily: 'arial, sans-serif', fontSize: '16px', whiteSpace: 'nowrap', color: termsError ? '#991b1b' : 'inherit' }}>
              Acepto <Link to="/terminos-y-condiciones" style={{ color: '#4763e4', textDecoration: 'underline' }}>los términos y condiciones de uso</Link>
            </Typography>
          }
          sx={{
            marginTop: '5px',
            marginBottom: '0px',
            alignItems: 'flex-start', 
            '& .MuiFormControlLabel-label': {
              marginTop: '5px', 
            }
          }}
        />

        <Button
          type="button"
          onClick={handleClick}
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
          Acceder
        </Button>

        <Typography variant="body2" sx={{ fontFamily: 'arial, sans-serif', fontWeight: 'normal', textAlign: 'center', marginTop: '10px', fontSize: '18px' }}>
          ¿Ya tienes una cuenta? <Link to="/" style={{ color: '#5c73db', textDecoration: 'underline' }}>Ingresar</Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default Registro;