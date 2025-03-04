import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Registro from './Registro';
import RegistroCorreo from './Registrocorreo';
import RegistroCorreoFinal from './Registrofinal'; 
import { useState } from 'react';

function App() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [eyeIcon, setEyeIcon] = useState("../images/eye-off.png");

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setEyeIcon(passwordVisible ? "../images/eye-off.png" : "../images/eye.png");
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
        <button>Acceder ➜</button>
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
      </Routes>
    </Router>
  );
}

export default MainApp;