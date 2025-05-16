import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cerrarSesion } from '../utils/auth';

function NavBar() {
  const navigate = useNavigate();

  return (
    <nav>
      <button onClick={() => cerrarSesion(navigate)}>Cerrar sesión</button>
    </nav>
  );
}

export default NavBar;
