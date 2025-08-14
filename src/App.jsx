import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Registro from './Registro';
import RegistroCorreo from './RegistroCorreo';
import RegistroCorreoFinal from './Registrofinal';
import Dashboard from './Dashboard';
import { useState } from 'react';

function App() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [eyeIcon, setEyeIcon] = useState("../images/eye-off.png");

  const [email, setEmail] = useState('');        // 👈 estados añadidos
  const [password, setPassword] = useState('');  // 👈
  const [error, setError] = useState('');        // 👈
  const [loading, setLoading] = useState(false); // 👈

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setEyeIcon(passwordVisible ? "../images/eye-off.png" : "../images/eye.png");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // validación rápida front
    if (!email.trim() || !password) {
      setError('Por favor completa correo y contraseña.');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // intenta leer mensaje del backend si existe
        const maybeJson = await response.json().catch(() => null);
        const msg = maybeJson?.message || "Credenciales inválidas";
        throw new Error(msg);
      }

      const data = await response.json();

      // guarda token/usuario si vienen
      if (data.token) localStorage.setItem("authToken", data.token);
      if (data.user) localStorage.setItem("currentUser", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Error en el login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-content'>
      <img src="../images/img.png" alt="Imagen de login" />
      <h2 className='login-info'>Por favor proporcione su información de conexión</h2>

      {/* muestra error si existe */}
      {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}

      <form className='formulario' onSubmit={handleLogin}>
        <p>Correo</p>
        <input
          type="email"
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
            aria-label="Mostrar/Ocultar contraseña"
          >
            <img src={eyeIcon} className="icon" alt="Mostrar/Ocultar contraseña" />
          </span>
        </div>

        <h3 className='login-comentario'>¿Olvidaste tu contraseña?</h3>

        <button type="submit" disabled={loading}>
          {loading ? 'Accediendo…' : 'Acceder ➜'}
        </button>

        <h3 className='login-comentario'>
          ¿No tienes una cuenta? <Link to="/registro" className='registro-link'>Crear cuenta</Link>
        </h3>
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
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default MainApp;
