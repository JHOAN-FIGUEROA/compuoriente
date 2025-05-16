import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';
import '../css/login.css'; // Estilos del formulario
import logo from '../img/LOGO 1.png'; // Importa tu logo

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, contraseña });
      localStorage.setItem('token', response.token);
      setToken(response.token);
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
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          required
        />
        <button type="submit">Iniciar sesión</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  </div>
);
}

export default Login;
