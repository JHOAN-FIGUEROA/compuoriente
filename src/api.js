import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getUsuarios = async () => {
  const res = await fetch(`${API_URL}/api/usuarios`);
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return await res.json();
};

export const loginUser = async ({ email, contraseña }) => {
  const res = await fetch(`${API_URL}/api/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, contraseña }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error en el inicio de sesión');
  }

  return data; // { token: "..." }
};

export const obtenerRoles = async (pagina = 1, limite = 5) => {
  const response = await axios.get(`${API_URL}/api/rol`, {
    params: { pagina, limite }
  });
  return response.data;
};

export const buscarRoles = async (nombre, pagina = 1, limite = 5) => {
  const response = await axios.get(`${API_URL}/api/rol/buscar`, {
    params: { nombre, pagina, limite }
  });
  return response.data;
};
export const obtenerDetalleRol = async (id) => {
  const response = await axios.get(`${API_URL}/api/rol/${id}`);
  return response.data;
};
export const crearRol = async ({ nombre, permisos_ids }) => {
  const response = await axios.post(`${API_URL}/api/rol`, {
    nombre,
    permisos_ids
  });
  return response.data;
};
export const editarRol = async (id, { nombre, permisos }) => {
  const response = await axios.put(`${API_URL}/api/rol/${id}`, {
    nombre,
    permisos
  });
  return response.data;
};
export const eliminarRol = async (id) => {
  const response = await axios.delete(`${API_URL}/api/rol/${id}`);
  return response.data;
};
export const cambiarEstadoRol = async (id, estado) => {
  const response = await axios.put(`${API_URL}/api/rol/${id}/estado`, {
    estado
  });
  return response.data;
};

export const obtenerPermisos = async () => {
  const response = await axios.get(`${API_URL}/api/permisos`);
  return response.data;  // Asegúrate que la API te devuelve { permisos: [...] }
};



