import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 


function Registro() {
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [eyeIcon1, setEyeIcon1] = useState("../images/eye-off.png");

  const [passwordVisible2, setPasswordVisible2] = useState(false);
  const [eyeIcon2, setEyeIcon2] = useState("../images/eye-off.png");

  const navigate = useNavigate();

  const togglePasswordVisibility1 = () => {
    setPasswordVisible1(!passwordVisible1);
    setEyeIcon1(passwordVisible1 ? "../images/eye-off.png" : "../images/eye.png");
  };

  const togglePasswordVisibility2 = () => {
    setPasswordVisible2(!passwordVisible2);
    setEyeIcon2(passwordVisible2 ? "../images/eye-off.png" : "../images/eye.png");
  };

  const handleClick = () => {
    navigate('/registro/correo');
  };

  return (
    <div className='registro-content'>
      <img src="../images/img.png" alt="Imagen de registro" />
      <h2 className='registro-info'>Por favor proporcione su información de registro</h2>
      <form className='registro-form'>
        <p>Dirección de correo electrónico</p>
        <input type="text" placeholder="Ingresa tu correo electrónico" />
        <p>Numero de teléfono</p>
        <input type="text" placeholder="Ingresa tu número telefónico" />
        <p>Contraseña</p>
        <div style={{ position: 'relative' }}>
          <input
            type={passwordVisible1 ? "text" : "password"}
            style={{ paddingRight: '30px' }}
            placeholder="Ingresa tu contraseña"
          />
          <span
            className="password-toggle"
            style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', cursor: 'pointer' }}
            onClick={togglePasswordVisibility1}
          >
            <img src={eyeIcon1} className="icon" alt="Mostrar/Ocultar contraseña" />
          </span>
        </div>
        <p>Confirma tu contraseña</p>
        <div style={{ position: 'relative' }}>
          <input
            type={passwordVisible2 ? "text" : "password"}
            style={{ paddingRight: '30px' }}
            placeholder="Ingresa tu contraseña nuevamente"
          />
          <span
            className="password-toggle-2"
            style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', cursor: 'pointer' }}
            onClick={togglePasswordVisibility2}
          >
            <img src={eyeIcon2} className="icon" alt="Mostrar/Ocultar contraseña" />
          </span>
          <label className="terminos-container">
            <input type="checkbox" />
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