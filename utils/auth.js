import { useNavigate } from 'react-router-dom';

export function cerrarSesion(navigate) {
  localStorage.removeItem('token');
  localStorage.removeItem('nombre');
  localStorage.removeItem('apellido');
  navigate('/');
}
