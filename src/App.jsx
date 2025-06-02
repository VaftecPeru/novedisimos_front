import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Registro from './Registro';
import RegistroCorreo from './RegistroCorreo';
import RegistroCorreoFinal from './RegistroCorreoFinal';
import Dashboard from './Dashboard';
import { useState } from 'react';

import { Box, TextField, Button, Typography, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');

  const testEmail = 'prueba@ejemplo.com';
  const testPassword = 'claveprueba';

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (email === testEmail && password === testPassword) {
      console.log('Inicio de sesión de prueba exitoso');
      localStorage.setItem('authToken-test', 'token-de-prueba');
      navigate('/dashboard/ordenDePedido');
      return;
    }

    try {
      const response = await fetch('TU_URL_DE_LA_API_LARAVEL/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login exitoso:', data);
        localStorage.setItem('authToken', data.token);
        navigate('/dashboard/ordenDePedido');
      } else {
        console.error('Error de login:', data);
        setLoginError(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setLoginError('Error al ingresar al servidor');
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
        alt="Imagen de login"
        style={{ marginBottom: '20px' }} 
      />
      <Typography variant="h5" component="h2" sx={{ fontFamily: 'arial, sans-serif', fontWeight: 'normal', marginBottom: '20px', textAlign: 'center' }}>
        Por favor proporcione su información de conexión
      </Typography>
      <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <Typography sx={{ fontFamily: 'arial, sans-serif', fontSize: '18px', marginBottom: '-10px' }}>Correo</Typography>
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
                boxShadow: 'none', 
              },
              '&:hover': {
                boxShadow: 'none', 
              },
            },
          }}
        />
        <Typography sx={{ fontFamily: 'arial, sans-serif', fontSize: '18px', marginBottom: '-10px' }}>Clave</Typography>
        <TextField
          type={passwordVisible ? 'text' : 'password'}
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              color: '#9fa6b2',
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
                  onClick={togglePasswordVisibility}
                  edge="end"
                  sx={{ marginRight: '-5px' }} 
                >
                  {passwordVisible ? (
                    <VisibilityOff sx={{ fontSize: '20px' }} /> 
                  ) : (
                    <Visibility sx={{ fontSize: '20px' }} /> 
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {loginError && (
          <Typography color="error" sx={{ color: 'red', textAlign: 'center' }}>
            {loginError}
          </Typography>
        )}
        <Typography variant="body2" sx={{ fontFamily: 'arial, sans-serif', fontWeight: 'normal', textAlign: 'center', marginTop: '5px', fontSize: '18px' }}>
          ¿Olvidaste tu contraseña?
        </Typography>
        <Button
          type="submit"
          variant="contained"
          sx={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#4763e4',
            fontSize: '18px',
            color: 'white',
            '&:hover': {
              backgroundColor: '#354db3',
            },
          }}
        >
          Acceder ➜
        </Button>
        <Typography variant="body2" sx={{ fontFamily: 'arial, sans-serif', fontWeight: 'normal', textAlign: 'center', marginTop: '10px', fontSize: '18px' }}>
          ¿No tienes una cuenta? <Link to="/registro" className="registro-link" style={{ color: '#5c73db', textDecoration: 'underline' }}>Crear cuenta</Link>
        </Typography>
      </Box>
    </Box>
  );
}

function MainApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/registro/correo" element={<RegistroCorreo />} />
        <Route path="/registro/correo/final" element={<RegistroCorreoFinal />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default MainApp;