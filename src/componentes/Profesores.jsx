import React, { useState, useEffect } from 'react';
import { 
  getProfesores, 
  crearProfesor, 
  editarProfesor, 
  eliminarProfesor, 
  buscarProfesores 
} from '../api';
import '../css/Institucional.css';
import { Modal, Button, Form } from 'react-bootstrap';

// Utilidad para extraer el mensaje del backend
function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Ocurrió un error';
}

const Profesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    email: '',
    especialidad: '',
    departamento: '',
    telefono: '',
    direccion: ''
  });

  useEffect(() => {
    cargarProfesores();
  }, [pagina, busqueda]);

  const cargarProfesores = async () => {
    try {
      setLoading(true);
      const response = busqueda 
        ? await buscarProfesores(busqueda, pagina)
        : await getProfesores(pagina);
      
      if (response.ok) {
        setProfesores(response.data.profesores || response.data);
        setTotalPaginas(response.data.totalPaginas || 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await editarProfesor(editando.id, formData);
      } else {
        await crearProfesor(formData);
      }
      setMostrarFormulario(false);
      setEditando(null);
      resetForm();
      cargarProfesores();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditar = (profesor) => {
    setEditando(profesor);
    setFormData({
      nombre: profesor.nombre || '',
      apellido: profesor.apellido || '',
      documento: profesor.documento || '',
      email: profesor.email || '',
      especialidad: profesor.especialidad || '',
      departamento: profesor.departamento || '',
      telefono: profesor.telefono || '',
      direccion: profesor.direccion || ''
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este profesor?')) {
      try {
        await eliminarProfesor(id);
        cargarProfesores();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      documento: '',
      email: '',
      especialidad: '',
      departamento: '',
      telefono: '',
      direccion: ''
    });
  };

  const handleNuevo = () => {
    setEditando(null);
    resetForm();
    setMostrarFormulario(true);
  };

  return (
    <div className="institucional-container" style={{ paddingTop: 0, marginTop: 0 }}>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="mb-0">
                <i className="fas fa-chalkboard me-2"></i>
                Gestión de Profesores
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
                    placeholder="Buscar profesores..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleNuevo}>
                <i className="fas fa-plus me-2"></i>
                Nuevo Profesor
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        {/* Tabla */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2 text-muted">Cargando profesores...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Documento</th>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Especialidad</th>
                          <th>Departamento</th>
                          <th>Teléfono</th>
                          <th className="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profesores.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-4 text-muted">
                              <i className="fas fa-inbox fa-2x mb-2"></i>
                              <p>No se encontraron profesores</p>
                            </td>
                          </tr>
                        ) : (
                          profesores.map((profesor) => (
                            <tr key={profesor.id}>
                              <td>
                                <span className="fw-bold">{profesor.documento}</span>
                              </td>
                              <td>
                                {profesor.nombre} {profesor.apellido}
                              </td>
                              <td>
                                <a href={`mailto:${profesor.email}`} className="text-decoration-none">
                                  {profesor.email}
                                </a>
                              </td>
                              <td>
                                <span className="badge bg-success">{profesor.especialidad}</span>
                              </td>
                              <td>{profesor.departamento}</td>
                              <td>{profesor.telefono}</td>
                              <td className="text-center">
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEditar(profesor)}
                                    title="Editar"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    <i className="fas fa-pen"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleEliminar(profesor.documento)}
                                    title="Eliminar"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
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
                      onClick={() => setPagina(pagina - 1)}
                      disabled={pagina === 1}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                  </li>
                  {[...Array(totalPaginas)].map((_, index) => (
                    <li key={index} className={`page-item ${pagina === index + 1 ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setPagina(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setPagina(pagina + 1)}
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

        {/* Modal Formulario */}
        {mostrarFormulario && (
          <Modal show={mostrarFormulario} onHide={() => setMostrarFormulario(false)} size="lg" centered>
            <div style={{ background: '#023e8a', color: 'white', padding: '1.2rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="d-flex align-items-center">
                <i className="fas fa-chalkboard-teacher fa-lg me-2"></i>
                <span style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.5px' }}>{editando ? 'Editar Profesor' : 'Nuevo Profesor'}</span>
              </div>
              <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarFormulario(false)}></button>
            </div>
            <Form onSubmit={handleSubmit}>
              <Modal.Body style={{ paddingTop: 0 }}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <Form.Label>Nombre *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.nombre}
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      autoComplete="off"
                      size="lg"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <Form.Label>Apellido *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.apellido}
                      onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                      required
                      autoComplete="off"
                      size="lg"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <Form.Label>Documento *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.documento}
                      onChange={e => setFormData({ ...formData, documento: e.target.value })}
                      required
                      autoComplete="off"
                      size="lg"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                      autoComplete="off"
                      size="lg"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <Form.Label>Especialidad</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.especialidad}
                      onChange={e => setFormData({ ...formData, especialidad: e.target.value })}
                      autoComplete="off"
                      size="lg"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <Form.Label>Departamento</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.departamento}
                      onChange={e => setFormData({ ...formData, departamento: e.target.value })}
                      autoComplete="off"
                      size="lg"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.telefono}
                      onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                      autoComplete="off"
                      size="lg"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.direccion}
                      onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                      autoComplete="off"
                      size="lg"
                    />
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer style={{ borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
                <Button variant="secondary" size="lg" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="lg" type="submit">
                  <i className="fas fa-save me-2"></i>
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

export default Profesores; 