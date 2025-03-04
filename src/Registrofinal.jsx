import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Imagen from '/images/img.png'; 
import eyeIcon from '/images/eye.png'; 
import eyeIconClosed from '/images/eye-off.png'; 

function RegistroCorreoFinal() {
  const navigate = useNavigate();
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [passwordVisible2, setPasswordVisible2] = useState(false);

  const togglePasswordVisibility1 = () => {
    setPasswordVisible1(!passwordVisible1);
  };

  const togglePasswordVisibility2 = () => {
    setPasswordVisible2(!passwordVisible2);
  };

  const handleClick = () => {
    navigate('/registro/correo');
  };

  return (
    <div className='final-content'>
      <img src={Imagen} alt="Imagen de registro" />
      <h2 className='final-info'>Por favor proporcione su información de conexión</h2>
      <form className='final-form'>
        <p>Nueva contraseña</p>
        <div style={{ position: 'relative' }}>
          <input
            type={passwordVisible1 ? 'text' : 'password'}
            style={{ paddingRight: '30px' }}
            placeholder="Ingresa tu contraseña"
          />
          <span
            className="password-toggle"
            style={{
              position: 'absolute',
              top: '50%',
              right: '10px',
              transform: 'translateY(-40%)',
              cursor: 'pointer',
            }}
            onClick={togglePasswordVisibility1}
          >
            <img
              src={passwordVisible1 ? eyeIcon : eyeIconClosed}
              className="icon"
              alt="Mostrar/Ocultar contraseña"
            />
          </span>
        </div>
        <p>Confirma tu contraseña</p>
        <div style={{ position: 'relative' }}>
          <input
            type={passwordVisible2 ? 'text' : 'password'}
            style={{ paddingRight: '30px' }}
            placeholder="Ingresa tu contraseña nuevamente"
          />
          <span
            className="password-toggle-2"
            style={{
              position: 'absolute',
              top: '50%',
              right: '10px',
              transform: 'translateY(-40%)',
              cursor: 'pointer',
            }}
            onClick={togglePasswordVisibility2}
          >
            <img
              src={passwordVisible2 ? eyeIcon : eyeIconClosed}
              className="icon"
              alt="Mostrar/Ocultar contraseña"
            />
          </span>
        </div>
        <button type="button" onClick={handleClick}>
          Modificar
        </button>
        <h3 className='correo-comentario'>
          <Link to="/" className='correo-link'>
            Volver a la página de inicio de sesión
          </Link>
        </h3>
      </form>
    </div>
  );
}

export default RegistroCorreoFinal;