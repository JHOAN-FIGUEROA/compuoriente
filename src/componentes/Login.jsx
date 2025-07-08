import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';
import '../css/login.css'; // Estilos del formulario
import logo from '../img/LOGO 1.png'; // Importa tu logo
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// Utilidad para extraer el mensaje del backend
function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Ocurrió un error';
}

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, contraseña });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('nombre', response.data.nombre);
      localStorage.setItem('apellido', response.data.apellido);
      setToken(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
  <div className="login-wrapper"> {/* NUEVO CONTENEDOR */}
    <div className="login-container">
      <img src={logo} alt="Logo" className="login-logo" />
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type={verPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
            style={{ paddingRight: '2.5rem' }}
          />
          <span
            onClick={() => setVerPassword(v => !v)}
            style={{
              position: 'absolute',
              right: '0.8rem',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: '#00b4d8',
              fontSize: '1.2rem',
              zIndex: 2
            }}
            title={verPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            {verPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button type="submit">Iniciar sesión</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  </div>
);
}

export default Login;
