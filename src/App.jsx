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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [eyeIcon, setEyeIcon] = useState("../images/eye-off.png");
  const navigate = useNavigate();
  
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setEyeIcon(passwordVisible ? "../images/eye-off.png" : "../images/eye.png");
  };
  
  const handleLogin = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className='login-content'>
      <img src="../images/img.png" alt="Imagen de login" />
      <h2 className='login-info'>Por favor proporcione su información de conexión</h2>
      <form className='formulario'>
        <p>Correo</p>
        <input type="text" placeholder="Ingresa tu correo electrónico" />
        <p>Clave</p>
        <div style={{ position: 'relative' }}>
          <input
            type={passwordVisible ? "text" : "password"}
            style={{ paddingRight: '30px' }}
            placeholder="Ingresa tu contraseña"
          />
          <span
            className="password-toggle"
            style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', cursor: 'pointer' }}
            onClick={togglePasswordVisibility}
          >
            <img src={eyeIcon} className="icon" alt="Mostrar/Ocultar contraseña" />
          </span>
        </div>
        <h3 className='login-comentario'>¿Olvidaste tu contraseña?</h3>
        <button type="button" onClick={handleLogin}>Acceder ➜</button>
        
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