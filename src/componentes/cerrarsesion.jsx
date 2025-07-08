import React from 'react';
import { useNavigate } from 'react-router-dom';

function NavBar({ cerrarSesion }) {
  const handleCerrarSesion = () => {
    cerrarSesion();
  };
  return (
    <button
      className="btn d-flex align-items-center"
      style={{ fontWeight: 600, fontSize: '1.1rem', gap: '0.5rem', background: '#ff5c5c', color: '#fff', border: 'none' }}
      onClick={handleCerrarSesion}
    >
      <i className="fas fa-sign-out-alt"></i>
      Cerrar sesión
    </button>
  );
}

export default NavBar;
