import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Registro from './Registro';
import RegistroCorreo from './RegistroCorreo';
import RegistroCorreoFinal from './Registrofinal';
import Dashboard from './Dashboard';
import Categorias from './Categorias';
import Almacen from './Almacen';
import Devolucion from './Devolucion';
import Reparto from './Reparto';
import Seguimiento from './Seguimiento';
import Calendario from './Calendario';
import { useState } from 'react';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [eyeIcon, setEyeIcon] = useState("../images/eye-off.png");
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');

  // Valores de prueba (opcional, recuerda eliminarlos en producción)
  const testEmail = 'prueba@ejemplo.com';
  const testPassword = 'claveprueba';

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setEyeIcon(passwordVisible ? "../images/eye-off.png" : "../images/eye.png");
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    // **Elimina o comenta esta sección de prueba en producción**
    if (email === testEmail && password === testPassword) {
      console.log('Inicio de sesión de prueba exitoso');
      localStorage.setItem('authToken-test', 'token-de-prueba');
      navigate('/dashboard/ordenDePedido');
      return;
    }

    try {
      const response = await fetch('TU_URL_DE_LA_API_LARAVEL/api/login', { // **URL REAL DE LA API**
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
        // Autenticación exitosa
        console.log('Login exitoso:', data);
        // Asumiendo que la API devuelve un token en el campo 'token'
        localStorage.setItem('authToken', data.token);
        // Redirigir al dashboard
        navigate('/dashboard/ordenDePedido');
      } else {
        // Error en la autenticación
        console.error('Error de login:', data);
        setLoginError(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      // Error de conexión o cualquier otro error en la petición
      console.error('Error de conexión:', error);
      setLoginError('Error al ingresar al servidor');
    }
  };

  return (
    <div className='login-content'>
      <img src="../images/img.png" alt="Imagen de login" />
      <h2 className='login-info'>Por favor proporcione su información de conexión</h2>
      <form className='formulario' onSubmit={handleLogin}>
        <p>Correo</p>
        <input
          type="text"
          placeholder="Ingresa tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p>Clave</p>
        <div style={{ position: 'relative' }}>
          <input
            type={passwordVisible ? "text" : "password"}
            style={{ paddingRight: '30px' }}
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="password-toggle"
            style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', cursor: 'pointer' }}
            onClick={togglePasswordVisibility}
          >
            <img src={eyeIcon} className="icon" alt="Mostrar/Ocultar contraseña" />
          </span>
        </div>
        {loginError && <p className="error-message" style={{ color: 'red' }}>{loginError}</p>}
        <h3 className='login-comentario'>¿Olvidaste tu contraseña?</h3>
        <button type="submit">Acceder ➜</button>

        <h3 className='login-comentario'>¿No tienes una cuenta? <Link to="/registro" className='registro-link'>Crear cuenta</Link></h3>
      </form>
    </div>
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
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/almacen" element={<Almacen />} />
        <Route path="/devolucion" element={<Devolucion />} />
        <Route path="/reparto" element={<Reparto />} />
        <Route path="/seguimiento" element={<Seguimiento />} />
        <Route path="/calendario" element={<Calendario />} />
      </Routes>
    </Router>
  );
}

export default MainApp;