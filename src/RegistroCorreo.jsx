import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 

function RegistroCorreo() {

  const handleClick = () => {
    navigate('/registro/correo');
  };

  return (
    <div className='correo-content'>
      <img src="../images/img.png" alt="Imagen de registro" />
      <form className='correo-form'>
      <p>Dirección de correo electrónico</p>
      <input type="text" placeholder="Ingresa tu correo electrónico" />
      <button type="button" onClick={handleClick}>Acceso</button>
      <h3 className='correo-comentario'>
          <Link to="/" className='correo-link'>Volver a la página de inicio de sesión</Link>
        </h3>
      </form>
    </div>
  );
}

export default RegistroCorreo;