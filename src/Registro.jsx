import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Registro() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [eyeIcon1, setEyeIcon1] = useState("../images/eye-off.png");
  const [passwordVisible2, setPasswordVisible2] = useState(false);
  const [eyeIcon2, setEyeIcon2] = useState("../images/eye-off.png");
  const [error, setError] = useState('');
  const [camposCompletos, setCamposCompletos] = useState(true);
  const [camposError, setCamposError] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility1 = () => {
    setPasswordVisible1(!passwordVisible1);
    if (camposError) {
      if (eyeIcon1 === "../images/eye-off-error.png") {
        setEyeIcon1("../images/eye-error.png");
      } else {
        setEyeIcon1("../images/eye-off-error.png");
      }
    } else {
      setEyeIcon1(passwordVisible1 ? "../images/eye-off.png" : "../images/eye.png");
    }
  };

  const togglePasswordVisibility2 = () => {
    setPasswordVisible2(!passwordVisible2);
    if (camposError) {
      if (eyeIcon2 === "../images/eye-off-error.png") {
        setEyeIcon2("../images/eye-error.png");
      } else {
        setEyeIcon2("../images/eye-off-error.png");
      }
    } else {
      setEyeIcon2(passwordVisible2 ? "../images/eye-off.png" : "../images/eye.png");
    }
  };

  const handleClick = () => {
    if (!email || !phone || !password || !confirmPassword || !termsAccepted) {
      setCamposCompletos(false);
      setCamposError(true);
      setEyeIcon1("../images/eye-off-error.png"); 
      setEyeIcon2("../images/eye-off-error.png"); 
      return;
    }

    if (password !== confirmPassword) {
      setCamposCompletos(false);
      setCamposError(true);
      setEyeIcon1("../images/eye-off-error.png"); 
      setEyeIcon2("../images/eye-off-error.png"); 
      return;
    }

    setError('');
    setCamposCompletos(true);
    setCamposError(false);
    setEyeIcon1("../images/eye-off.png");
    setEyeIcon2("../images/eye-off.png");
    navigate('/registro/correo');
  };

  return (
    <div
      className='registro-content'>
      <img
        src="../images/img.png"
        alt="Imagen de registro"
      />
      <h2 className='registro-info'>
        Por favor proporcione su información de registro
      </h2>
      <form className='registro-form'>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <p style={{ color: camposError ? '#991b1b' : 'inherit' }}>Dirección de correo electrónico</p>
        <input
          type="text"
          placeholder="Ingresa tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ borderColor: camposCompletos ? 'initial' : 'red' }}
          className={camposError ? 'placeholder-error' : ''} // Agregar clase condicional
        />
        <p style={{ color: camposError ? '#991b1b' : 'inherit' }}>Numero de teléfono</p>
        <input
          type="text"
          placeholder="Ingresa tu número telefónico"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ borderColor: camposCompletos ? 'initial' : 'red' }}
          className={camposError ? 'placeholder-error' : ''} // Agregar clase condicional
        />
        <p style={{ color: camposError ? '#991b1b' : 'inherit' }}>Contraseña</p>
        <div style={{ position: 'relative' }}>
          <input
            type={passwordVisible1 ? "text" : "password"}
            style={{ paddingRight: '30px', borderColor: camposCompletos ? 'initial' : 'red' }}
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={camposError ? 'placeholder-error' : ''} // Agregar clase condicional
          />
          <span
            className="password-toggle"
            style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', cursor: 'pointer' }}
            onClick={togglePasswordVisibility1}
          >
            <img src={eyeIcon1} className="icon" alt="Mostrar/Ocultar contraseña" />
          </span>
        </div>
        <p style={{ color: camposError ? '#991b1b' : 'inherit' }}>Confirma tu contraseña</p>
        <div style={{ position: 'relative' }}>
          <input
            type={passwordVisible2 ? "text" : "password"}
            style={{ paddingRight: '30px', borderColor: camposCompletos ? 'initial' : 'red' }}
            placeholder="Ingresa tu contraseña nuevamente"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={camposError ? 'placeholder-error' : ''} // Agregar clase condicional
          />
          <span
            className="password-toggle-2"
            style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', cursor: 'pointer' }}
            onClick={togglePasswordVisibility2}
          >
            <img src={eyeIcon2} className="icon" alt="Mostrar/Ocultar contraseña" />
          </span>
          <label className="terminos-container">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <p className="terminos">
              Acepto <a href="/terminos-y-condiciones" className="terminos-link">los términos y condiciones de uso</a>
            </p>
          </label>
        </div>
        <button type="button" onClick={handleClick}>Acceder</button>
        <h3 className='registro-comentario'>
          ¿Ya tienes una cuenta? <Link to="/" className='registro-link'>Ingresar </Link>
        </h3>
      </form>
    </div>
  );
}

export default Registro;