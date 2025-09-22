import React, { useEffect, useState } from 'react';
import {
  obtenerRoles,
  buscarRoles,
  eliminarRol,
  cambiarEstadoRol,
  obtenerDetalleRol,
  crearRol,
  editarRol,
  obtenerPermisos
} from '../api';
import Swal from 'sweetalert2';
import { Form, Button, Modal, Badge } from 'react-bootstrap';
import '../css/Roles.css';

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [nombreRol, setNombreRol] = useState('');
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const cargarRoles = async () => {
    try {
      setLoading(true);
      const data = busqueda
        ? await buscarRoles(busqueda, pagina)
        : await obtenerRoles(pagina);

      const rolesData = data.data || {};
      setRoles(Array.isArray(rolesData.roles) ? rolesData.roles : []);
      setTotal(rolesData.total || 0);
      setTotalPaginas(rolesData.totalPaginas || 1);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRoles();
  }, [pagina, busqueda]);

  useEffect(() => {
    async function cargarPermisos() {
      try {
        const permisosAPI = await obtenerPermisos();
        const permisosValidos = (permisosAPI.permisos || permisosAPI)
          .filter(permiso => permiso && permiso.id);
        setPermisosDisponibles(permisosValidos);
      } catch (error) {
        console.error('Error al cargar permisos:', error);
      }
    }
    cargarPermisos();
  }, []);

  const handleBuscar = (e) => {
    e.preventDefault();
    setPagina(1);
    cargarRoles();
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el rol.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await eliminarRol(id);
        Swal.fire('Eliminado', 'Rol eliminado con éxito', 'success');
        cargarRoles();
      } catch (error) {
        Swal.fire('Error', getErrorMessage(error), 'error');
      }
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      await cambiarEstadoRol(id, !estadoActual);
      cargarRoles();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleVerDetalle = async (id) => {
    try {
      const detalle = await obtenerDetalleRol(id);
      console.log(detalle);

      Swal.fire({
        title: `Detalle del Rol: ${detalle.nombre}`,
        html: `
          <p><strong>ID:</strong> ${detalle.id}</p>
          <p><strong>Permisos:</strong></p>
          <ul>
            ${
              detalle.permisos && detalle.permisos.length > 0
                ? detalle.permisos
                    .filter(p => p !== null)
                    .map((p) => `<li>${p.nombre}</li>`)
                    .join('')
                : '<li>No hay permisos asignados</li>'
            }
          </ul>
        `,
        confirmButtonText: 'Cerrar',
      });
    } catch (error) {
      console.error('Error al obtener detalle rol:', error);
      Swal.fire('Error', 'No se pudo obtener el detalle del rol', 'error');
    }
  };

  const handleAgregarPermiso = (e) => {
    const permisoId = parseInt(e.target.value);
    console.log('Intentando agregar permiso:', permisoId);
    
    if (!permisoId || isNaN(permisoId)) {
      console.log('Permiso inválido, no se agregará');
      return;
    }
    
    setPermisosSeleccionados(prev => {
      if (prev.includes(permisoId)) {
        console.log('Permiso ya existe, no se agregará');
        return prev;
      }
      const nuevosPermisos = [...prev, permisoId];
      console.log('Nuevos permisos después de agregar:', nuevosPermisos);
      return nuevosPermisos;
    });
    e.target.value = ''; // Limpiar selección para poder elegir otro
  };

  const handleQuitarPermiso = (id) => {
    if (!id || isNaN(id)) return;
    
    setPermisosSeleccionados(prev => {
      const nuevosPermisos = prev.filter(pid => pid !== id);
      console.log('Permisos después de quitar:', nuevosPermisos);
      return nuevosPermisos;
    });
  };

  const abrirModalCrear = () => {
    setRolSeleccionado(null);
    setNombreRol('');
    setPermisosSeleccionados([]);
    setMostrarModal(true);
  };

  const abrirModalEditar = async (rol) => {
    try {
      const detalle = await obtenerDetalleRol(rol.id);
      setRolSeleccionado(rol);
      setNombreRol(detalle.data.nombre);

      // Manejo robusto de permisos
      let permisosValidos = [];
      if (Array.isArray(detalle.data.permisos)) {
        permisosValidos = detalle.data.permisos
          .map(p => (typeof p === 'object' && p !== null ? p.id : p))
          .filter(id => id !== null && id !== undefined && !isNaN(id));
      }
      setPermisosSeleccionados(permisosValidos);

      setMostrarModal(true);
    } catch (error) {
      console.error('Error al cargar detalle del rol:', error);
      Swal.fire('Error', 'No se pudo cargar el detalle del rol', 'error');
    }
  };

  const handleGuardar = async () => {
    try {
      // Validar y limpiar los permisos
      const permisosValidos = permisosSeleccionados
        .filter(id => {
          console.log('Validando permiso:', id);
          return id !== null && id !== undefined && !isNaN(id);
        })
        .map(id => {
          console.log('Convirtiendo permiso:', id);
          return Number(id);
        });
      
      console.log('Permisos finales a guardar:', permisosValidos);
      
      if (permisosValidos.length === 0) {
        Swal.fire('Error', 'Debe seleccionar al menos un permiso', 'error');
        return;
      }
      let response;
      if (rolSeleccionado) {
        // Para editar, enviamos permisos (como espera el backend)
        const datosEdicion = {
          nombre: nombreRol,
          permisos: permisosValidos
        };
        console.log('Datos completos para edición:', JSON.stringify(datosEdicion, null, 2));
        response = await editarRol(rolSeleccionado.id, datosEdicion);
      } else {
        // Para crear, enviamos permisos_ids (como espera el backend)
        const datosCreacion = {
          nombre: nombreRol,
          permisos_ids: permisosValidos
        };
        console.log('Datos completos para creación:', JSON.stringify(datosCreacion, null, 2));
        response = await crearRol(datosCreacion);
      }
      // Manejo de respuesta del backend
      if (response && response.ok === false) {
        Swal.fire('Error', response.message || 'Ocurrió un error', 'error');
        return;
      }
      Swal.fire(rolSeleccionado ? 'Actualizado' : 'Creado', rolSeleccionado ? 'Rol editado correctamente' : 'Rol creado correctamente', 'success');
      setMostrarModal(false);
      cargarRoles();
    } catch (error) {
      console.error('Error al guardar:', error);
      Swal.fire('Error', getErrorMessage(error), 'error');
    }
  };

  // Utilidad para extraer el mensaje del backend
  function getErrorMessage(error) {
    return error?.response?.data?.message || error?.message || 'Ocurrió un error';
  }

  return (
    <div className="institucional-container" style={{ paddingTop: 0, marginTop: 0 }}>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="mb-0">
                <i className="fas fa-user-shield me-2"></i>
                Gestión de Roles
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
                    placeholder="Buscar roles..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={abrirModalCrear}>
                <i className="fas fa-plus me-2"></i>
                Nuevo Rol
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
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted">
                            <i className="fas fa-spinner fa-spin"></i> Cargando...
                          </td>
                        </tr>
                      ) : (!roles || roles.length === 0) ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted">
                            <i className="fas fa-inbox fa-2x mb-2"></i>
                            <p>No se encontraron roles</p>
                          </td>
                        </tr>
                      ) : (
                        roles.map((rol) => (
                          <tr key={rol.id}>
                            <td>{rol.id}</td>
                            <td>{rol.nombre}</td>
                            <td className="text-center align-middle">
                              <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                                <div className="form-check form-switch m-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`switch-rol-${rol.id}`}
                                    checked={Boolean(rol.estado)}
                                    onChange={() => handleToggleEstado(rol.id, rol.estado)}
                                    disabled={rol.id === 1}
                                  />
                                  <label className="form-check-label" htmlFor={`switch-rol-${rol.id}`}></label>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => abrirModalEditar(rol)}
                                  title="Editar"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                >
                                  <i className="fas fa-pen"></i>
                                </button>
                                {rol.id !== 1 && (
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleEliminar(rol.id)}
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
        {/* Modal Crear/Editar Rol */}
        {mostrarModal && (
          <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="xl" centered>
            <div style={{ background: '#0a3871', color: 'white', padding: '1.2rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="d-flex align-items-center">
                <i className="fas fa-user-shield fa-lg me-2"></i>
                <span style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.5px' }}>{rolSeleccionado ? 'Editar Rol' : 'Nuevo Rol'}</span>
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
                    <div className="col-md-12 mb-3">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control type="text" value={nombreRol} onChange={e => setNombreRol(e.target.value)} placeholder="Nombre del rol" size="lg" autoComplete="off" required />
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <h6 className="text-primary mb-3 d-flex align-items-center">
                    <i className="fas fa-key me-2"></i>
                    Permisos
                  </h6>
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <Form.Label>Agregar Permiso</Form.Label>
                      <div className="d-flex align-items-center gap-2" style={{ background: '#f4f8fb', borderRadius: '0.7em', padding: '0.7em 1em' }}>
                        <span style={{ color: '#0a3871', fontSize: '1.3em', marginRight: 8 }}>
                          <i className="fas fa-key"></i>
                        </span>
                        <Form.Select onChange={handleAgregarPermiso} defaultValue="" size="lg" style={{ maxWidth: 350, flex: 1 }}>
                          <option value="" disabled>-- Seleccione un permiso --</option>
                          {permisosDisponibles.filter(permiso => !permisosSeleccionados.includes(permiso.id)).map(permiso => (
                            <option key={permiso.id} value={permiso.id}>{permiso.nombre}</option>
                          ))}
                        </Form.Select>
                      </div>
                    </div>
                    <div className="col-md-12 mb-3">
                      <Form.Label>Permisos seleccionados</Form.Label>
                      <div style={{ minHeight: 48, background: '#f4f8fb', borderRadius: '0.7em', padding: '0.7em 1em', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                        {permisosSeleccionados.length === 0 && (
                          <span className="text-muted d-flex align-items-center" style={{ fontSize: '1.05em' }}>
                            <i className="fas fa-info-circle me-2"></i> No hay permisos agregados.
                          </span>
                        )}
                        {permisosSeleccionados.map(id => {
                          const permiso = permisosDisponibles.find(p => p.id === id);
                          if (!permiso) return null;
                          return (
                            <span
                              key={id}
                              className="badge bg-primary me-2 mb-2 animate__animated animate__fadeIn"
                              style={{ cursor: 'pointer', fontSize: '1.08em', padding: '0.7em 1.2em', display: 'flex', alignItems: 'center', borderRadius: '1.5em', boxShadow: '0 2px 8px #0a38711a' }}
                              onClick={() => handleQuitarPermiso(id)}
                              title="Click para quitar permiso"
                            >
                              <i className="fas fa-shield-alt me-2"></i> {permiso.nombre} <span style={{ marginLeft: 8, fontWeight: 700, fontSize: '1.2em' }}>&times;</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                {loadingDetalle && (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando permisos...</p>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer style={{ borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
                <Button variant="secondary" size="lg" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="lg" type="submit" disabled={loadingDetalle}>
                  Guardar
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default RolesList;
