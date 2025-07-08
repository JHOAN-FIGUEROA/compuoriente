import React, { useEffect, useState } from 'react';
import {
  getUsuarios,
  obtenerRoles,
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
  obtenerDetalleUsuario,
  cambiarEstadoUsuario,

  
} from '../api';
import Swal from 'sweetalert2';
import { Form, Button, Modal } from 'react-bootstrap';

// Utilidad para extraer el mensaje del backend
function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Ocurrió un error';
}

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    email: '',
    estado: true,
    rol_id: '',
  });
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios(pagina);
      const usuariosData = data.data || {};
      setUsuarios(Array.isArray(usuariosData.usuarios) ? usuariosData.usuarios : []);
      setTotal(usuariosData.totalUsuarios || 0);
      setTotalPaginas(usuariosData.totalPaginas || 1);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, [pagina]);

  useEffect(() => {
    async function cargarRoles() {
      try {
        const rolesAPI = await obtenerRoles();
        const rolesValidos = (rolesAPI.data && Array.isArray(rolesAPI.data.roles)) ? rolesAPI.data.roles : [];
        setRolesDisponibles(rolesValidos);
      } catch (error) {
        console.error('Error al cargar roles:', error);
        setRolesDisponibles([]);
      }
    }
    cargarRoles();
  }, []);

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el usuario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await eliminarUsuario(id);
        Swal.fire('Eliminado', 'Usuario eliminado con éxito', 'success');
        cargarUsuarios();
      } catch (error) {
        Swal.fire('Error', getErrorMessage(error), 'error');
      }
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      await cambiarEstadoUsuario(id, !estadoActual);
      cargarUsuarios();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  // Agregar estado para el modal de detalle y el usuario a mostrar
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);

  // Función para mostrar el modal de detalle
  const handleVerDetalle = async (usuario) => {
    try {
      // Si tienes endpoint para detalle, consúltalo aquí. Si no, usa el usuario recibido.
      // const detalle = await obtenerDetalleUsuario(usuario.id);
      setUsuarioDetalle(usuario);
      setMostrarDetalle(true);
    } catch (error) {
      Swal.fire('Error', 'No se pudo obtener el detalle del usuario', 'error');
    }
  };

  const abrirModalCrear = () => {
    setUsuarioSeleccionado(null);
    setFormData({
      nombre: '',
      apellido: '',
      documento: '',
      email: '',
      contraseña: '',
      rol_id: '',
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = async (usuario) => {
    try {
      setLoadingDetalle(true);
      const detalle = await obtenerDetalleUsuario(usuario.id);

      setUsuarioSeleccionado(usuario);
      setFormData({
        nombre: detalle.data.nombre || '',
        apellido: detalle.data.apellido || '',
        documento: detalle.data.documento || '',
        email: detalle.data.email || '',
        
        rol_id: detalle.data.rol_id || detalle.data.rol?.id || '',
      });
      setMostrarModal(true);
    } catch (error) {
      console.error('Error al cargar detalle del usuario:', error);
      Swal.fire('Error', 'No se pudo cargar el detalle del usuario', 'error');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

const handleGuardar = async () => {
  try {
    if (!usuarioSeleccionado) {
      // Crear usuario: campos obligatorios
      if (!formData.nombre || !formData.apellido || !formData.documento || !formData.email || !formData.rol_id) {
        Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error');
        return;
      }
      if (!formData.contraseña) {
        Swal.fire('Error', 'La contraseña es obligatoria para crear un usuario', 'error');
        return;
      }
    }

    // Al editar, solo enviar la contraseña si el usuario la cambió
    let datosAEnviar = { ...formData };
    if (usuarioSeleccionado && !formData.contraseña) {
      delete datosAEnviar.contraseña;
    }

    if (usuarioSeleccionado) {
      await editarUsuario(usuarioSeleccionado.id, datosAEnviar);
      Swal.fire('Actualizado', 'Usuario editado correctamente', 'success');
    } else {
      await crearUsuario(formData);
      Swal.fire('Creado', 'Usuario creado correctamente', 'success');
    }

    setMostrarModal(false);
    cargarUsuarios();
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    Swal.fire('Error', getErrorMessage(error), 'error');
  }
};

  // Filtrado de usuarios en frontend si no hay endpoint de búsqueda
  const usuariosFiltrados = busqueda.trim() === '' ? usuarios : usuarios.filter(u => {
    const texto = busqueda.toLowerCase();
    return (
      (u.nombre && u.nombre.toLowerCase().includes(texto)) ||
      (u.apellido && u.apellido.toLowerCase().includes(texto)) ||
      (u.documento && u.documento.toLowerCase().includes(texto)) ||
      (u.email && u.email.toLowerCase().includes(texto))
    );
  });


  return (
    <div className="institucional-container" style={{ paddingTop: 0, marginTop: 0 }}>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Gestión de Usuarios
              </h2>
            </div>
          </div>
        </div>
        {/* Búsqueda y botón en la misma fila */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between gap-3">
              <div style={{ flex: 1, maxWidth: 500 }}>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar usuarios..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={abrirModalCrear}>
                <i className="fas fa-plus me-2"></i>
                Nuevo Usuario
              </button>
            </div>
          </div>
        </div>
        {/* Tabla */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Documento</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4 text-muted">
                            <i className="fas fa-spinner fa-spin"></i> Cargando...
                          </td>
                        </tr>
                      ) : (!usuarios || usuarios.length === 0) ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4 text-muted">
                            <i className="fas fa-inbox fa-2x mb-2"></i>
                            <p>No se encontraron usuarios</p>
                          </td>
                        </tr>
                      ) : (
                        usuariosFiltrados.map((usuario, index) => (
                          <tr key={usuario.id}>
                            <td>{(pagina - 1) * 10 + index + 1}</td>
                            <td>{usuario.documento}</td>
                            <td>{usuario.nombre}</td>
                            <td>{usuario.apellido}</td>
                            <td>
                              <span className="badge bg-info">{usuario.rol?.nombre || 'Sin rol'}</span>
                            </td>
                            <td className="text-center align-middle">
                              <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                                <div className="form-check form-switch m-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`switch-usuario-${usuario.id}`}
                                    checked={Boolean(usuario.estado)}
                                    onChange={() => handleToggleEstado(usuario.id, usuario.estado)}
                                  />
                                  <label className="form-check-label" htmlFor={`switch-usuario-${usuario.id}`}></label>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-outline-info"
                                  onClick={() => handleVerDetalle(usuario)}
                                  title="Ver Detalle"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => abrirModalEditar(usuario)}
                                  title="Editar"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                >
                                  <i className="fas fa-pen"></i>
                                </button>
                                {/* Solo mostrar eliminar si el usuario no es Administrador */}
                                {!(usuario.rol_id === 1 || usuario.rol?.id === 1) && (
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleEliminar(usuario.id)}
                                    title="Eliminar"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="row mt-4">
            <div className="col-12">
              <nav aria-label="Navegación de páginas">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPagina(p => Math.max(p - 1, 1))}
                      disabled={pagina === 1}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                  </li>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                    <li key={num} className={`page-item ${pagina === num ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setPagina(num)}
                      >
                        {num}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))}
                      disabled={pagina === totalPaginas}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
        {/* Modal Crear/Editar Usuario */}
        {mostrarModal && (
          <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="xl" centered>
            <div style={{ background: '#0a3871', color: 'white', padding: '1.2rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="d-flex align-items-center">
                <i className="fas fa-user fa-lg me-2"></i>
                <span style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.5px' }}>{usuarioSeleccionado ? 'Editar Usuario' : 'Nuevo Usuario'}</span>
              </div>
              <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
            </div>
            <Form onSubmit={e => { e.preventDefault(); handleGuardar(); }}>
              <Modal.Body style={{ paddingTop: 0 }}>
                <div className="mb-4 mt-3">
                  <h6 className="text-primary mb-3 d-flex align-items-center">
                    <i className="fas fa-id-card me-2"></i>
                    Información Básica
                  </h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" size="lg" autoComplete="off" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" size="lg" autoComplete="off" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <Form.Label>Documento</Form.Label>
                      <Form.Control type="text" name="documento" value={formData.documento} onChange={handleChange} placeholder="Documento" size="lg" autoComplete="off" required disabled={!!usuarioSeleccionado} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" size="lg" autoComplete="off" required />
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <h6 className="text-primary mb-3 d-flex align-items-center">
                    <i className="fas fa-user-shield me-2"></i>
                    Seguridad y Rol
                  </h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <Form.Label>Contraseña</Form.Label>
                      {usuarioSeleccionado ? (
                        // Si estamos editando, no mostrar el campo contraseña
                        <Form.Control type="password" value="********" disabled style={{ background: '#f1f1f1', color: '#aaa' }} />
                      ) : (
                        <Form.Control
                          type="password"
                          name="contraseña"
                          value={formData.contraseña || ''}
                          onChange={handleChange}
                          placeholder="Contraseña"
                          autoComplete="new-password"
                          size="lg"
                          required
                        />
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <Form.Label>Rol</Form.Label>
                      <Form.Select
                        name="rol_id"
                        value={formData.rol_id}
                        onChange={handleChange}
                        size="lg"
                        required
                        disabled={usuarioSeleccionado && usuarioSeleccionado.id === 10}
                      >
                        <option value="">Seleccione un rol</option>
                        {rolesDisponibles.map((rol) => (
                          <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                        ))}
                      </Form.Select>
                    </div>
                  </div>
                </div>
                {loadingDetalle && (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando datos...</p>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer style={{ borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
                <Button variant="secondary" size="lg" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="lg" type="submit">
                  Guardar
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        )}
        {/* Modal Detalle Usuario */}
        {mostrarDetalle && usuarioDetalle && (
          <Modal show={mostrarDetalle} onHide={() => setMostrarDetalle(false)} centered>
            <div style={{ background: '#0a3871', color: 'white', padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTopLeftRadius: '0.7rem', borderTopRightRadius: '0.7rem' }}>
              <div className="d-flex align-items-center gap-3">
                <i className="fas fa-user-circle fa-2x me-2"></i>
                <span style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '0.5px' }}>Detalle de Usuario</span>
              </div>
              <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarDetalle(false)}></button>
            </div>
            <Modal.Body style={{ padding: '2rem 2.5rem 1.5rem 2.5rem', background: '#f8fafc' }}>
              <div className="mb-3">
                {[
                  { label: 'ID', value: usuarioDetalle.id },
                  { label: 'Documento', value: usuarioDetalle.documento },
                  { label: 'Nombre', value: usuarioDetalle.nombre },
                  { label: 'Apellido', value: usuarioDetalle.apellido },
                  { label: 'Email', value: usuarioDetalle.email },
                  { label: 'Estado', value: usuarioDetalle.estado ? <span className="badge bg-success px-3 py-2 fs-6" style={{fontWeight:600}}>Activo</span> : <span className="badge bg-secondary px-3 py-2 fs-6" style={{fontWeight:600}}>Inactivo</span> },
                  { label: 'Rol', value: <span className="badge bg-info text-dark px-3 py-2 fs-6" style={{fontWeight:600}}>{usuarioDetalle.rol?.nombre || 'Sin rol'}</span> },
                ].map((item, idx, arr) => (
                  <div key={item.label} className="row align-items-center py-2" style={{ borderBottom: idx < arr.length - 1 ? '1px solid #e3e6ea' : 'none' }}>
                    <div className="col-4 text-end pe-3" style={{ fontWeight: 700, color: '#0a3871', fontSize: '1.08rem' }}>{item.label}:</div>
                    <div className="col-8" style={{ fontSize: '1.08rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </Modal.Body>
            <Modal.Footer style={{ justifyContent: 'center', background: '#f8fafc', borderBottomLeftRadius: '0.7rem', borderBottomRightRadius: '0.7rem' }}>
              <Button variant="secondary" size="lg" style={{ minWidth: 120, fontWeight: 600 }} onClick={() => setMostrarDetalle(false)}>
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Usuarios;
