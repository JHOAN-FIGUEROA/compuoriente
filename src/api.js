import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getUsuarios = async (pagina = 1) => {
  const res = await fetch(`${API_URL}/api/usuarios?pagina=${pagina}`);
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
export const getUsuarioById = async (id) => {
  const res = await fetch(`${API_URL}/api/usuarios/${id}`);
  if (!res.ok) throw new Error('Error al obtener el usuario');
  return await res.json();
};

export const editarUsuario = async (id, usuarioData) => {
  const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuarioData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al editar el usuario');
  }

  return await res.json();
};
export const eliminarUsuario = async (id) => {
  const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al eliminar el usuario');
  }

  return await res.json();
};
export const cambiarEstadoUsuario = async (id, estado) => {
  const res = await fetch(`${API_URL}/api/usuarios/estado/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al cambiar el estado del usuario');
  }

  return await res.json();
};
export const crearUsuario = async ({ nombre, apellido, documento, email, contraseña, rol_id }) => {
  const response = await axios.post(`${API_URL}/api/usuarios`, {
    nombre,
    apellido,
    documento,
    email,
    contraseña,
    rol_id
  });
  return response.data;
};

export async function obtenerDetalleUsuario(id, token) {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // si usas JWT para autenticación
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener detalle de usuario');
    }

    const usuario = await response.json();
    return usuario;
  } catch (error) {
    console.error('Error en obtenerDetalleUsuario:', error.message);
    throw error;
  }
};
export const obtenerCantidadUsuarios = async () => {
  const res = await fetch(`${API_URL}/api/usuarios/contador`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al obtener la cantidad de usuarios');
  }
  const data = await res.json();
  return data.totalUsuarios;  // ajustado al campo correcto
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
  const response = await axios.put(`${API_URL}/api/rol/cambiar-estado/${id}`, {
    estado
  });
  return response.data;
};

export const obtenerPermisos = async () => {
  const response = await axios.get(`${API_URL}/api/permisos`);
  return response.data;  // Asegúrate que la API te devuelve { permisos: [...] }
};



