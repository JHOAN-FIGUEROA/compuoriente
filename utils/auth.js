import { useNavigate } from 'react-router-dom';

export function cerrarSesion(navigate) {
  localStorage.removeItem('token');
  navigate('/');
}
