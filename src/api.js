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
  return (data && data.data && data.data.totalUsuarios) || 0;
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
  try {
    const response = await axios.post(`${API_URL}/api/rol`, {
      nombre,
      permisos_ids
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};
export const editarRol = async (id, { nombre, permisos }) => {
  try {
    const response = await axios.put(`${API_URL}/api/rol/${id}`, {
      nombre,
      permisos
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
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
  const response = await axios.get(`${API_URL}/api/permisos?all=true`);
  return response.data;  // Asegúrate que la API te devuelve { permisos: [...] }
};

// ===================== SALONES =====================
export const getSalones = async (modo = 1, limite = 5) => {
  let url;
  if (modo === 'all') {
    url = `${API_URL}/api/salon?all=true`;
  } else {
    url = `${API_URL}/api/salon?pagina=${modo}&limite=${limite}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener salones');
  return await res.json();
};

export const crearSalon = async (salonData) => {
  const res = await fetch(`${API_URL}/api/salon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(salonData),
  });
  if (!res.ok) throw new Error('Error al crear salón');
  return await res.json();
};

export const editarSalon = async (id, salonData) => {
  const res = await fetch(`${API_URL}/api/salon/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(salonData),
  });
  if (!res.ok) throw new Error('Error al editar salón');
  return await res.json();
};

export const eliminarSalon = async (id) => {
  const res = await fetch(`${API_URL}/api/salon/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar salón');
  return await res.json();
};

export const cambiarEstadoSalon = async (id) => {
  const res = await fetch(`${API_URL}/api/salon/${id}/estado`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Error al cambiar el estado del salón');
  return await res.json();
};

// ===================== ASISTENCIAS =====================
export const getAsistencias = async (pagina = 1, limite = 10) => {
  const res = await fetch(`${API_URL}/api/asistencias?pagina=${pagina}&limite=${limite}`);
  if (!res.ok) throw new Error('Error al obtener asistencias');
  return await res.json();
};

export const crearAsistencia = async (asistenciaData) => {
  const res = await fetch(`${API_URL}/api/asistencias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(asistenciaData),
  });
  if (!res.ok) throw new Error('Error al crear asistencia');
  return await res.json();
};

// Obtener asistencias por clase
export const getAsistenciasPorClase = async (claseId) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/api/asistencias/clase/${claseId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Verificar si ya existe asistencia para una clase
export const verificarAsistenciaExistente = async (claseId, fecha = null) => {
  const token = localStorage.getItem('token');
  const params = fecha ? `?fecha=${fecha}` : '';
  const response = await axios.get(`${API_URL}/api/asistencias/verificar/${claseId}${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getAsistenciaById = async (id) => {
  const res = await fetch(`${API_URL}/api/asistencias/${id}`);
  if (!res.ok) throw new Error('Error al obtener la asistencia');
  return await res.json();
};

export const editarAsistencia = async (id, asistenciaData) => {
  const res = await fetch(`${API_URL}/api/asistencias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(asistenciaData),
  });
  if (!res.ok) throw new Error('Error al editar asistencia');
  return await res.json();
};

export const eliminarAsistencia = async (id) => {
  const res = await fetch(`${API_URL}/api/asistencias/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar asistencia');
  return await res.json();
};



export const getAsistenciasPorEstudiante = async (estudiante_id) => {
  const res = await fetch(`${API_URL}/api/asistencias/estudiante/${estudiante_id}`);
  if (!res.ok) throw new Error('Error al obtener asistencias por estudiante');
  return await res.json();
};

// ===================== CLASES =====================
export const getClases = async (pagina = 1, limite = 10) => {
  const res = await fetch(`${API_URL}/api/clases?pagina=${pagina}&limite=${limite}`);
  if (!res.ok) throw new Error('Error al obtener clases');
  return await res.json();
};

export const crearClase = async (claseData) => {
  const res = await fetch(`${API_URL}/api/clases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claseData),
  });
  if (!res.ok) throw new Error('Error al crear clase');
  return await res.json();
};

export const getClaseById = async (id) => {
  const res = await fetch(`${API_URL}/api/clases/${id}`);
  if (!res.ok) throw new Error('Error al obtener la clase');
  return await res.json();
};

export const editarClase = async (id, claseData) => {
  const res = await fetch(`${API_URL}/api/clases/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claseData),
  });
  if (!res.ok) throw new Error('Error al editar clase');
  return await res.json();
};

export const eliminarClase = async (id) => {
  const res = await fetch(`${API_URL}/api/clases/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar clase');
  return await res.json();
};

export const getClasesPorGrupo = async (grupo_id) => {
  const res = await fetch(`${API_URL}/api/clases/grupo/${grupo_id}`);
  if (!res.ok) throw new Error('Error al obtener clases por grupo');
  return await res.json();
};

export const getClasesPorProfesor = async (profesor_id) => {
  const res = await fetch(`${API_URL}/api/clases/profesor/${profesor_id}`);
  if (!res.ok) throw new Error('Error al obtener clases por profesor');
  return await res.json();
};

// Obtener clases disponibles para tomar asistencia (con control de horarios y roles)
export const getClasesParaAsistencia = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/api/clases/para-asistencia`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Obtener reporte de asistencias para descarga
export const getReporteAsistencias = async (filtros = {}) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(filtros).toString();
  const response = await axios.get(`${API_URL}/api/clases/reporte-asistencias?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getClasesPorDia = async (dia_semana) => {
  const res = await fetch(`${API_URL}/api/clases/dia/${dia_semana}`);
  if (!res.ok) throw new Error('Error al obtener clases por día');
  return await res.json();
};

// ===================== ESTUDIANTES =====================
export const getEstudiantes = async (pagina = 1, limite = 10) => {
  const res = await fetch(`${API_URL}/api/estudiantes?pagina=${pagina}&limite=${limite}`);
  if (!res.ok) throw new Error('Error al obtener estudiantes');
  return await res.json();
};

export const crearEstudiante = async (estudianteData) => {
  const res = await fetch(`${API_URL}/api/estudiantes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(estudianteData),
  });
  if (!res.ok) throw new Error('Error al crear estudiante');
  return await res.json();
};

export const getEstudianteByDocumento = async (documento) => {
  const res = await fetch(`${API_URL}/api/estudiantes/${documento}`);
  if (!res.ok) throw new Error('Error al obtener el estudiante');
  return await res.json();
};

export const editarEstudiante = async (documento, estudianteData) => {
  const res = await fetch(`${API_URL}/api/estudiantes/${documento}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(estudianteData),
  });
  if (!res.ok) throw new Error('Error al editar estudiante');
  return await res.json();
};

export const eliminarEstudiante = async (documento) => {
  const res = await fetch(`${API_URL}/api/estudiantes/${documento}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar estudiante');
  return await res.json();
};

export const buscarEstudiantes = async (texto, pagina = 1, limite = 10) => {
  const res = await fetch(`${API_URL}/api/estudiantes/buscar?q=${encodeURIComponent(texto)}&pagina=${pagina}&limite=${limite}`);
  if (!res.ok) throw new Error('Error al buscar estudiantes');
  return await res.json();
};

export const getEstudiantesPorPrograma = async (programa) => {
  const res = await fetch(`${API_URL}/api/estudiantes/programa/${programa}`);
  if (!res.ok) throw new Error('Error al obtener estudiantes por programa');
  return await res.json();
};

export const getEstudiantesPorDepartamento = async (departamento) => {
  const res = await fetch(`${API_URL}/api/estudiantes/departamento/${departamento}`);
  if (!res.ok) throw new Error('Error al obtener estudiantes por departamento');
  return await res.json();
};

// ===================== GRUPOS =====================
export const getGrupos = async (pagina = 1, limite = 10) => {
  const res = await fetch(`${API_URL}/api/grupos?pagina=${pagina}&limite=${limite}`);
  if (!res.ok) throw new Error('Error al obtener grupos');
  return await res.json();
};

export const crearGrupo = async (grupoData) => {
  const res = await fetch(`${API_URL}/api/grupos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(grupoData),
  });
  if (!res.ok) throw new Error('Error al crear grupo');
  return await res.json();
};

export const getGrupoById = async (id) => {
  const res = await fetch(`${API_URL}/api/grupos/${id}`);
  if (!res.ok) throw new Error('Error al obtener el grupo');
  return await res.json();
};

export const editarGrupo = async (id, grupoData) => {
  const res = await fetch(`${API_URL}/api/grupos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(grupoData),
  });
  if (!res.ok) throw new Error('Error al editar grupo');
  return await res.json();
};

export const eliminarGrupo = async (id) => {
  const res = await fetch(`${API_URL}/api/grupos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar grupo');
  return await res.json();
};

export const getEstudiantesDeGrupo = async (id) => {
  const res = await fetch(`${API_URL}/api/grupos/${id}/estudiantes`);
  if (!res.ok) throw new Error('Error al obtener estudiantes del grupo');
  return await res.json();
};

export const getClasesDeGrupo = async (id) => {
  const res = await fetch(`${API_URL}/api/grupos/${id}/clases`);
  if (!res.ok) throw new Error('Error al obtener clases del grupo');
  return await res.json();
};

// ===================== PROFESORES =====================
export const getProfesores = async (pagina = 1, limite = 10) => {
  const res = await fetch(`${API_URL}/api/profesores?pagina=${pagina}&limite=${limite}`);
  if (!res.ok) throw new Error('Error al obtener profesores');
  return await res.json();
};

export const crearProfesor = async (profesorData) => {
  const res = await fetch(`${API_URL}/api/profesores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profesorData),
  });
  if (!res.ok) throw new Error('Error al crear profesor');
  return await res.json();
};

export const getProfesorById = async (id) => {
  const res = await fetch(`${API_URL}/api/profesores/${id}`);
  if (!res.ok) throw new Error('Error al obtener el profesor');
  return await res.json();
};

export const editarProfesor = async (id, profesorData) => {
  const res = await fetch(`${API_URL}/api/profesores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profesorData),
  });
  if (!res.ok) throw new Error('Error al editar profesor');
  return await res.json();
};

export const eliminarProfesor = async (id) => {
  const res = await fetch(`${API_URL}/api/profesores/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar profesor');
  return await res.json();
};

export const buscarProfesorPorDocumento = async (documento) => {
  const res = await fetch(`${API_URL}/api/profesores/documento/${documento}`);
  if (!res.ok) throw new Error('Error al buscar profesor por documento');
  return await res.json();
};

export const buscarProfesores = async (texto, pagina = 1, limite = 10) => {
  const res = await fetch(`${API_URL}/api/profesores/buscar?q=${encodeURIComponent(texto)}&pagina=${pagina}&limite=${limite}`);
  if (!res.ok) throw new Error('Error al buscar profesores');
  return await res.json();
};

export const getClasesDeProfesor = async (id) => {
  const res = await fetch(`${API_URL}/api/profesores/${id}/clases`);
  if (!res.ok) throw new Error('Error al obtener clases del profesor');
  return await res.json();
};

// ===================== RELACIÓN ESTUDIANTE-GRUPO =====================
export const getAsignacionesEstudianteGrupo = async () => {
  const res = await fetch(`${API_URL}/api/estudiante-grupo`);
  if (!res.ok) throw new Error('Error al obtener asignaciones');
  return await res.json();
};

export const asignarEstudianteAGrupo = async (asignacionData) => {
  const res = await fetch(`${API_URL}/api/estudiante-grupo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(asignacionData),
  });
  if (!res.ok) throw new Error('Error al asignar estudiante a grupo');
  return await res.json();
};

export const removerEstudianteDeGrupo = async (estudiante_id, grupo_id) => {
  const res = await fetch(`${API_URL}/api/estudiante-grupo/${estudiante_id}/${grupo_id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al remover estudiante del grupo');
  return await res.json();
};

export const getGruposDeEstudiante = async (estudiante_id) => {
  const res = await fetch(`${API_URL}/api/estudiante-grupo/estudiante/${estudiante_id}`);
  if (!res.ok) throw new Error('Error al obtener grupos del estudiante');
  return await res.json();
};

export const getEstudiantesDeGrupoRelacion = async (grupo_id) => {
  const res = await fetch(`${API_URL}/api/estudiante-grupo/grupo/${grupo_id}`);
  if (!res.ok) throw new Error('Error al obtener estudiantes del grupo (relación)');
  return await res.json();
};

// ===================== PROGRAMAS =====================
export const getProgramas = async (pagina = 1, limite = 10) => {
  const res = await fetch(`${API_URL}/api/programas?pagina=${pagina}&limite=${limite}`);
  if (!res.ok) throw new Error('Error al obtener programas');
  return await res.json();
};

export const crearPrograma = async (programaData) => {
  const res = await fetch(`${API_URL}/api/programas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(programaData),
  });
  if (!res.ok) throw new Error('Error al crear programa');
  return await res.json();
};

export const getProgramaById = async (id) => {
  const res = await fetch(`${API_URL}/api/programas/${id}`);
  if (!res.ok) throw new Error('Error al obtener el programa');
  return await res.json();
};

export const editarPrograma = async (id, programaData) => {
  const res = await fetch(`${API_URL}/api/programas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(programaData),
  });
  if (!res.ok) throw new Error('Error al editar programa');
  return await res.json();
};

export const eliminarPrograma = async (id) => {
  const res = await fetch(`${API_URL}/api/programas/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar programa');
  return await res.json();
};

export const buscarProgramas = async (texto, pagina = 1, limite = 10) => {
  const res = await fetch(`${API_URL}/api/programas/buscar?q=${encodeURIComponent(texto)}&pagina=${pagina}&limite=${limite}`);
  if (!res.ok) throw new Error('Error al buscar programas');
  return await res.json();
};

// ===================== FUNCIONES FALTANTES AGREGADAS =====================

// Función faltante: obtener salón por ID
export const getSalonById = async (id) => {
  const res = await fetch(`${API_URL}/api/salon/${id}`);
  if (!res.ok) throw new Error('Error al obtener el salón');
  return await res.json();
};

// Función faltante: buscar estudiantes (ruta específica)
export const buscarEstudiantesEspecifico = async (texto, pagina = 1, limite = 10) => {
  const res = await fetch(`${API_URL}/api/estudiantes/buscar?q=${encodeURIComponent(texto)}&pagina=${pagina}&limite=${limite}`);
  if (!res.ok) throw new Error('Error al buscar estudiantes');
  return await res.json();
};

// Función faltante: buscar profesores (ruta específica)
export const buscarProfesoresEspecifico = async (texto, pagina = 1, limite = 10) => {
  const res = await fetch(`${API_URL}/api/profesores/buscar?q=${encodeURIComponent(texto)}&pagina=${pagina}&limite=${limite}`);
  if (!res.ok) throw new Error('Error al buscar profesores');
  return await res.json();
};

// Función faltante: obtener profesor por documento
export const getProfesorByDocumento = async (documento) => {
  const res = await fetch(`${API_URL}/api/profesores/documento/${documento}`);
  if (!res.ok) throw new Error('Error al obtener profesor por documento');
  return await res.json();
};

// Función faltante: cambiar estado de estudiante (ruta correcta)
export const cambiarEstadoEstudianteCorregido = async (documento, estado) => {
  const res = await fetch(`${API_URL}/api/estudiantes/estado/${documento}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al cambiar el estado del estudiante');
  }
  return await res.json();
};

// Función faltante: cambiar estado de salón (usando PATCH)
export const cambiarEstadoSalonCorregido = async (id) => {
  const res = await fetch(`${API_URL}/api/salon/${id}/estado`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Error al cambiar el estado del salón');
  return await res.json();
};

// ===================== RECUPERACIÓN DE CONTRASEÑA =====================
export const solicitarRecuperacion = async (email) => {
  const res = await fetch(`${API_URL}/api/usuarios/solicitar-recuperacion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al solicitar recuperación');
  }
  return data;
};

export const restablecerContrasena = async ({ email, token, nuevaContrasena }) => {
  const res = await fetch(`${API_URL}/api/usuarios/restablecer-contrasena`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token, nuevaContrasena })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al restablecer contraseña');
  }
  return data;
};


export const cambiarEstadoEstudiante = async (documento, estado) => {
  const res = await fetch(`${API_URL}/api/estudiantes/estado/${documento}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al cambiar el estado del estudiante');
  }

  return await res.json();
};

// ===================== DASHBOARD =====================
export const getDashboardResumen = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/dashboard/resumen`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await res.json();
  if (!res.ok || json.ok === false) {
    throw new Error(json.error || json.message || 'Error al obtener el resumen del dashboard');
  }
  return json.data; // { usuariosTotales, estudiantesActivos, ... }
};

export const getAsistenciasDiarias = async (dias = 30) => {
  const token = localStorage.getItem('token');
  const url = new URL(`${API_URL}/api/dashboard/asistencias-diarias`);
  url.searchParams.set('dias', String(dias));
  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await res.json();
  if (!res.ok || json.ok === false) {
    throw new Error(json.error || json.message || 'Error al obtener asistencias diarias');
  }
  return json.data; // [ { fecha, presentes, ausentes } ]
};

export const getDashboardEstudiantesPorPrograma = async (top = 5) => {
  const token = localStorage.getItem('token');
  const url = new URL(`${API_URL}/api/dashboard/estudiantes-por-programa`);
  url.searchParams.set('top', String(top));
  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await res.json();
  if (!res.ok || json.ok === false) {
    throw new Error(json.error || json.message || 'Error al obtener estudiantes por programa');
  }
  return json.data; // [ { programa, total } ]
};
