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
    setEyeIcon1(passwordVisible1 ? "../images/eye-off.png" : "../images/eye.png");
  };

  const togglePasswordVisibility2 = () => {
    setPasswordVisible2(!passwordVisible2);
    setEyeIcon2(passwordVisible2 ? "../images/eye-off.png" : "../images/eye.png");
  };

  const handleClick = async () => {
    if (!email || !phone || !password || !confirmPassword || !termsAccepted) {
      setCamposCompletos(false);
      setCamposError(true);
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (password !== confirmPassword) {
      setCamposCompletos(false);
      setCamposError(true);
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await registerUser({
        email: email,
        phone: phone,
        password: password,
        password_confirmation: confirmPassword
      });

      console.log("Registro exitoso:", response.data);
      setError('');
      navigate('/registro/correo');
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Error al registrar");
    }
  };

  return (
    <div className='registro-content'>
      <img src="../images/img.png" alt="Imagen de registro" />
      <h2 className='registro-info'>Por favor proporcione su información de registro</h2>
      <form className='registro-form'>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <p>Dirección de correo electrónico</p>
        <input
          type="text"
          placeholder="Ingresa tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <p>Número de teléfono</p>
        <input
          type="text"
          placeholder="Ingresa tu número telefónico"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <p>Contraseña</p>
        <div style={{ position: 'relative' }}>
          <input
            type={passwordVisible1 ? "text" : "password"}
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="password-toggle"
            style={{ position: 'absolute', top: '50%', right: '10px', cursor: 'pointer' }}
            onClick={togglePasswordVisibility1}
          >
          </span>
        </div>

        <p>Confirma tu contraseña</p>
        <div style={{ position: 'relative' }}>
          <input
            type={passwordVisible2 ? "text" : "password"}
            placeholder="Ingresa tu contraseña nuevamente"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span
            className="password-toggle-2"
            style={{ position: 'absolute', top: '50%', right: '10px', cursor: 'pointer' }}
            onClick={togglePasswordVisibility2}
          >
          </span>
        </div>

        <label className="terms-label">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
  />
          <span>
            Acepto{" "}
            <a href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer">
              los términos y condiciones
    </a>
  </span>
</label>


        <button type="button" onClick={handleClick}>Acceder</button>
        <h3 className='registro-comentario'>
          ¿Ya tienes una cuenta? <Link to="/" className='registro-link'>Ingresar</Link>
        </h3>
      </form>
    </div>
  );
}

export default Registro;
