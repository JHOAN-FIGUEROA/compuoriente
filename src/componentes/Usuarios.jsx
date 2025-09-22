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
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
    tipo_documento: '',
    documento: '',
    nombre: '',
    apellido: '',
    email: '',
    estado: true,
    rol_id: '',
  });
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Estados para ver/ocultar contraseña y confirmar
  const [verPass, setVerPass] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);
  const [confirmPass, setConfirmPass] = useState('');

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
      tipo_documento: '',
      documento: '',
      nombre: '',
      apellido: '',
      email: '',
      contraseña: '',
      rol_id: '',
    });
    setConfirmPass(''); // Resetear confirmación de contraseña al crear
    setVerPass(false);
    setVerConfirm(false);
    setMostrarModal(true);
  };

  const abrirModalEditar = async (usuario) => {
    try {
      setLoadingDetalle(true);
      const detalle = await obtenerDetalleUsuario(usuario.id);

      setUsuarioSeleccionado(usuario);
      setFormData({
        tipo_documento: detalle.data.tipo_documento || '',
        documento: detalle.data.documento || '',
        nombre: detalle.data.nombre || '',
        apellido: detalle.data.apellido || '',
        email: detalle.data.email || '',
        rol_id: detalle.data.rol_id || detalle.data.rol?.id || '',
        // Eliminar campo contraseña al editar
      });
      setConfirmPass(''); // Resetear confirmación de contraseña al editar
      setVerPass(false);
      setVerConfirm(false);
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
      // Validar tipo de documento explícitamente
      if (!formData.tipo_documento) {
        Swal.fire('Error', 'Debes seleccionar el tipo de documento', 'error');
        return;
      }
      if (!formData.documento || !formData.nombre || !formData.email || !formData.rol_id) {
        Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error');
        return;
      }
      if (!formData.contraseña) {
        Swal.fire('Error', 'La contraseña es obligatoria para crear un usuario', 'error');
        return;
      }
      if (!confirmPass) {
        Swal.fire('Error', 'La confirmación de contraseña es obligatoria', 'error');
        return;
      }
      if (!passValida) {
        Swal.fire('Error', 'La contraseña no cumple con los requisitos de seguridad.', 'error');
        return;
      }
      if (!coinciden) {
        Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
        return;
      }
    }

    // Al editar, NO enviar la contraseña
    let datosAEnviar = { ...formData };
    if (usuarioSeleccionado) {
      delete datosAEnviar.contraseña;
    }

    // Imprimir los datos que se van a enviar
    console.log('Datos a enviar:', datosAEnviar);

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

  // Validaciones en tiempo real
  const docValido = /^[0-9]{7,10}$/.test(formData.documento);
  const passValida = (formData.contraseña || '').length >= 8 && /[A-Z]/.test(formData.contraseña || '') && /[a-z]/.test(formData.contraseña || '') && /[0-9]/.test(formData.contraseña || '') && /[^A-Za-z0-9]/.test(formData.contraseña || '');
  const coinciden = (formData.contraseña || '') === confirmPass && (formData.contraseña || '').length > 0;
  // Validación de email
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const nombreValido = formData.nombre.length <= 25;
  const apellidoValido = formData.apellido.length <= 25;

  // Mapeo para mostrar el nombre completo del tipo de documento
  const tipoDocumentoNombre = {
    CC: 'Cédula de ciudadanía',
    TI: 'Tarjeta de identidad',
    CE: 'Cédula de extranjería',
    Pasaporte: 'Pasaporte',
  };


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
                      <Form.Label>Tipo de documento</Form.Label>
                      <Form.Select
                        name="tipo_documento"
                        value={formData.tipo_documento}
                        onChange={handleChange}
                        size="lg"
                        required
                      >
                        <option value="" disabled>Seleccione</option>
                        <option value="CC">Cédula de ciudadanía</option>
                        <option value="TI">Tarjeta de identidad</option>
                        <option value="CE">Cédula de extranjería</option>
                        <option value="Pasaporte">Pasaporte</option>
                      </Form.Select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <Form.Label>Documento</Form.Label>
                      <Form.Control type="text" name="documento" value={formData.documento} onChange={handleChange} placeholder="Documento" size="lg" autoComplete="off" required isInvalid={formData.documento && !docValido} />
                      {formData.documento && !docValido && (
                        <div className="text-danger mt-1" style={{ fontSize: '0.95em' }}>
                          El documento debe tener entre 7 y 10 dígitos numéricos.
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" size="lg" autoComplete="off" required isInvalid={!nombreValido} maxLength={25} />
                      {formData.nombre && !nombreValido && (
                        <div className="text-danger mt-1" style={{ fontSize: '0.95em' }}>
                          El nombre no puede tener más de 25 caracteres.
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" size="lg" autoComplete="off" required isInvalid={!apellidoValido} maxLength={25} />
                      {formData.apellido && !apellidoValido && (
                        <div className="text-danger mt-1" style={{ fontSize: '0.95em' }}>
                          El apellido no puede tener más de 25 caracteres.
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" size="lg" autoComplete="off" required isInvalid={formData.email && !emailValido} />
                      {formData.email && !emailValido && (
                        <div className="text-danger mt-1" style={{ fontSize: '0.95em' }}>
                          Ingresa un correo electrónico válido.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <h6 className="text-primary mb-3 d-flex align-items-center">
                    <i className="fas fa-user-shield me-2"></i>
                    Seguridad y Rol
                  </h6>
                  <div className="row">
                    {/* Solo mostrar campos de contraseña al crear */}
                    {!usuarioSeleccionado && (
                      <>
                        <div className="col-md-6 mb-3">
                          <Form.Label>Contraseña</Form.Label>
                          <div style={{ position: 'relative' }}>
                            <Form.Control
                              type={verPass ? 'text' : 'password'}
                              name="contraseña"
                              value={formData.contraseña || ''}
                              onChange={handleChange}
                              placeholder="Contraseña"
                              autoComplete="new-password"
                              size="lg"
                              required
                              isInvalid={formData.contraseña && !passValida}
                              style={{ paddingRight: '2.5rem' }}
                            />
                            <span
                              onClick={() => setVerPass(v => !v)}
                              style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#0a3871', fontSize: '1.15rem', zIndex: 2 }}
                              title={verPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                            >
                              {verPass ? <FaEyeSlash /> : <FaEye />}
                            </span>
                          </div>
                          {formData.contraseña && !passValida && (
                            <div className="text-danger mt-1" style={{ fontSize: '0.95em' }}>
                              La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y un carácter especial.
                            </div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <Form.Label>Confirmar contraseña</Form.Label>
                          <div style={{ position: 'relative' }}>
                            <Form.Control
                              type={verPass ? 'text' : 'password'}
                              value={confirmPass}
                              onChange={e => setConfirmPass(e.target.value)}
                              placeholder="Confirmar contraseña"
                              size="lg"
                              isInvalid={confirmPass && !coinciden}
                              style={{ paddingRight: '2.5rem' }}
                            />
                            <span
                              onClick={() => setVerPass(v => !v)}
                              style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#0a3871', fontSize: '1.15rem', zIndex: 2 }}
                              title={verPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                            >
                              {verPass ? <FaEyeSlash /> : <FaEye />}
                            </span>
                          </div>
                          {confirmPass && !coinciden && (
                            <div className="text-danger mt-1" style={{ fontSize: '0.95em' }}>
                              Las contraseñas no coinciden.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    {/* Campo de rol siempre visible */}
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
                <Button variant="primary" size="lg" type="submit" disabled={!docValido || !emailValido || !nombreValido || !apellidoValido || (!usuarioSeleccionado && (formData.contraseña && (!passValida || !coinciden)))}>
                  Guardar
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        )}
        {/* Modal Detalle Usuario */}
        {mostrarDetalle && usuarioDetalle && (
          <Modal show={mostrarDetalle} onHide={() => setMostrarDetalle(false)} centered>
            <div style={{ background: '#0a3871', color: 'white', padding: '2.2rem 2.5rem 1.2rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 24px #0a387133' }}>
              <i className="fas fa-user-circle fa-3x mb-2"></i>
              <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '0.5px', textAlign: 'center' }}>{usuarioDetalle.nombre} {usuarioDetalle.apellido}</div>
              <div style={{ fontWeight: 400, fontSize: '1.1rem', opacity: 0.85, marginBottom: '-0.5rem' }}>Detalle de Usuario</div>
              <button type="button" className="btn-close btn-close-white position-absolute end-0 mt-2 me-2" style={{ filter: 'brightness(0.9)' }} onClick={() => setMostrarDetalle(false)}></button>
            </div>
            <Modal.Body style={{ padding: '2rem 2.5rem 1.5rem 2.5rem', background: '#f8fafc', animation: 'fadeInDown 0.5s' }}>
              <div className="mb-3">
                {[
                  { label: 'ID', value: usuarioDetalle.id, icon: 'fas fa-id-badge' },
                  { label: 'Tipo de documento', value: tipoDocumentoNombre[usuarioDetalle.tipo_documento] || usuarioDetalle.tipo_documento, icon: 'fas fa-id-card' },
                  { label: 'Documento', value: usuarioDetalle.documento, icon: 'fas fa-address-card' },
                  { label: 'Nombre', value: usuarioDetalle.nombre, icon: 'fas fa-user' },
                  { label: 'Apellido', value: usuarioDetalle.apellido, icon: 'fas fa-user' },
                  { label: 'Email', value: usuarioDetalle.email, icon: 'fas fa-envelope' },
                  { label: 'Estado', value: usuarioDetalle.estado ? <span className="badge bg-success px-3 py-2 fs-6" style={{fontWeight:600}}>Activo</span> : <span className="badge bg-secondary px-3 py-2 fs-6" style={{fontWeight:600}}>Inactivo</span>, icon: 'fas fa-toggle-on' },
                  { label: 'Rol', value: <span className="badge bg-info text-dark px-3 py-2 fs-6" style={{fontWeight:600}}>{usuarioDetalle.rol?.nombre || 'Sin rol'}</span>, icon: 'fas fa-user-shield' },
                ].map((item, idx, arr) => (
                  <div key={item.label} className="row align-items-center py-2" style={{ borderBottom: idx < arr.length - 1 ? '1px solid #e3e6ea' : 'none' }}>
                    <div className="col-1 text-center" style={{ color: '#0a3871', fontSize: '1.2em' }}><i className={item.icon}></i></div>
                    <div className="col-3 text-end pe-3" style={{ fontWeight: 700, color: '#0a3871', fontSize: '1.08rem' }}>{item.label}:</div>
                    <div className="col-8" style={{ fontSize: '1.08rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </Modal.Body>
            <Modal.Footer style={{ justifyContent: 'center', background: '#f8fafc', borderBottomLeftRadius: '0.9rem', borderBottomRightRadius: '0.9rem' }}>
              <Button variant="secondary" size="lg" style={{ minWidth: 140, fontWeight: 600, fontSize: '1.15em' }} onClick={() => setMostrarDetalle(false)}>
                <i className="fas fa-times me-2"></i>Cerrar
              </Button>
            </Modal.Footer>
            <style>{`@keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: none; } }`}</style>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Usuarios;
