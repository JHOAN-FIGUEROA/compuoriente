import React, { useState, useEffect } from 'react';
import { 
  getEstudiantes, 
  crearEstudiante, 
  editarEstudiante, 
  eliminarEstudiante, 
  buscarEstudiantes
} from '../api';
import { useProgramas } from '../hooks/useProgramas';
import '../css/Institucional.css';

// Utilidad para extraer el mensaje del backend
function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Ocurrió un error';
}

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    numerofolio: '',
    tipo_documento: '',
    documento: '',
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    departamento: '',
    Municipio: '',
    direccion: '',
    programa: '',
    telefono: '',
    horario_programa: '',
    eps: '',
    observaciones: '',
    rh: ''
  });
  const { programas } = useProgramas();

  useEffect(() => {
    cargarEstudiantes();
  }, [pagina, busqueda]);



  const cargarEstudiantes = async () => {
    try {
      setLoading(true);
      const response = busqueda 
        ? await buscarEstudiantes(busqueda, pagina)
        : await getEstudiantes(pagina);
      
      if (response.ok) {
        setEstudiantes(response.data.estudiantes || response.data);
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
        await editarEstudiante(editando.documento, formData);
      } else {
        await crearEstudiante(formData);
      }
      setMostrarFormulario(false);
      setEditando(null);
      resetForm();
      cargarEstudiantes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditar = (estudiante) => {
    setEditando(estudiante);
    setFormData({
      numerofolio: estudiante.numerofolio || '',
      tipo_documento: estudiante.tipo_documento || '',
      documento: estudiante.documento || '',
      nombre: estudiante.nombre || '',
      apellido: estudiante.apellido || '',
      fecha_nacimiento: estudiante.fecha_nacimiento || '',
      departamento: estudiante.departamento || '',
      Municipio: estudiante.Municipio || '',
      direccion: estudiante.direccion || '',
      programa: estudiante.programa || '',
      telefono: estudiante.telefono || '',
      horario_programa: estudiante.horario_programa || '',
      eps: estudiante.eps || '',
      observaciones: estudiante.observaciones || '',
      rh: estudiante.rh || ''
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (documento) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este estudiante?')) {
      try {
        await eliminarEstudiante(documento);
        cargarEstudiantes();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      numerofolio: '',
      tipo_documento: '',
      documento: '',
      nombre: '',
      apellido: '',
      fecha_nacimiento: '',
      departamento: '',
      Municipio: '',
      direccion: '',
      programa: '',
      telefono: '',
      horario_programa: '',
      eps: '',
      observaciones: '',
      rh: ''
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
                <i className="fas fa-user-graduate me-2"></i>
                Gestión de Estudiantes
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
                    placeholder="Buscar estudiantes..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleNuevo}>
                <i className="fas fa-plus me-2"></i>
                Nuevo Estudiante
              </button>
            </div>
          </div>
        </div>

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="row mb-3">
            <div className="col-12">
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError(null)}></button>
              </div>
            </div>
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
                    <p className="mt-2 text-muted">Cargando estudiantes...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Folio</th>
                          <th>Documento</th>
                          <th>Nombre Completo</th>
                          <th>Programa</th>
                          <th>Departamento</th>
                          <th>Teléfono</th>
                          <th>RH</th>
                          <th className="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estudiantes.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-4 text-muted">
                              <i className="fas fa-inbox fa-2x mb-2"></i>
                              <p>No se encontraron estudiantes</p>
                            </td>
                          </tr>
                        ) : (
                          estudiantes.map((estudiante) => (
                            <tr key={estudiante.documento}>
                              <td>
                                <span className="badge bg-secondary">{estudiante.numerofolio}</span>
                              </td>
                              <td>
                                <div>
                                  <small className="text-muted">{estudiante.tipo_documento}</small><br/>
                                  <span className="fw-bold">{estudiante.documento}</span>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <strong>{estudiante.nombre} {estudiante.apellido}</strong><br/>
                                  <small className="text-muted">
                                    {estudiante.fecha_nacimiento && new Date(estudiante.fecha_nacimiento).toLocaleDateString()}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-info">{estudiante.programa}</span>
                              </td>
                              <td>
                                <div>
                                  <strong>{estudiante.departamento}</strong><br/>
                                  <small className="text-muted">{estudiante.Municipio}</small>
                                </div>
                              </td>
                              <td>{estudiante.telefono}</td>
                              <td>
                                <span className="badge bg-danger">{estudiante.rh}</span>
                              </td>
                              <td className="text-center">
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEditar(estudiante)}
                                    title="Editar"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    <i className="fas fa-pen"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleEliminar(estudiante.documento)}
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
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-user-graduate me-2"></i>
                    {editando ? 'Editar Estudiante' : 'Nuevo Estudiante'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setMostrarFormulario(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {/* Información Básica */}
                    <h6 className="text-primary mb-3">
                      <i className="fas fa-user me-2"></i>
                      Información Básica
                    </h6>
                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <label className="form-label">Número de Folio *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.numerofolio}
                          onChange={(e) => setFormData({...formData, numerofolio: e.target.value})}
                          required
                          maxLength="20"
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <label className="form-label">Tipo de Documento *</label>
                        <select
                          className="form-select"
                          value={formData.tipo_documento}
                          onChange={(e) => setFormData({...formData, tipo_documento: e.target.value})}
                          required
                        >
                          <option value="">Seleccionar...</option>
                          <option value="CC">Cédula de Ciudadanía</option>
                          <option value="TI">Tarjeta de Identidad</option>
                          <option value="CE">Cédula de Extranjería</option>
                          <option value="PP">Pasaporte</option>
                        </select>
                      </div>
                      <div className="col-md-3 mb-3">
                        <label className="form-label">Número de Documento *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.documento}
                          onChange={(e) => setFormData({...formData, documento: e.target.value})}
                          required
                          maxLength="20"
                          disabled={editando}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <label className="form-label">RH *</label>
                        <select
                          className="form-select"
                          value={formData.rh}
                          onChange={(e) => setFormData({...formData, rh: e.target.value})}
                          required
                        >
                          <option value="">Seleccionar...</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Nombre *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.nombre}
                          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                          required
                          maxLength="100"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Apellido *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.apellido}
                          onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Fecha de Nacimiento</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.fecha_nacimiento}
                          onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Teléfono *</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.telefono}
                          onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                          required
                          maxLength="20"
                        />
                      </div>
                    </div>

                    {/* Información Académica */}
                    <h6 className="text-primary mb-3 mt-4">
                      <i className="fas fa-graduation-cap me-2"></i>
                      Información Académica
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Programa *</label>
                        <select
                          className="form-select"
                          value={formData.programa}
                          onChange={(e) => setFormData({...formData, programa: e.target.value})}
                          required
                        >
                          <option value="">Seleccionar programa...</option>
                          {programas.map((programa) => (
                            <option key={programa.id} value={programa.nombre}>
                              {programa.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Horario del Programa *</label>
                        <select
                          className="form-select"
                          value={formData.horario_programa}
                          onChange={(e) => setFormData({...formData, horario_programa: e.target.value})}
                          required
                        >
                          <option value="">Seleccionar horario...</option>
                          <option value="Diurno">Diurno</option>
                          <option value="Nocturno">Nocturno</option>
                          <option value="Fines de Semana">Fines de Semana</option>
                          <option value="Virtual">Virtual</option>
                        </select>
                      </div>
                    </div>

                    {/* Información de Ubicación */}
                    <h6 className="text-primary mb-3 mt-4">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      Información de Ubicación
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Departamento *</label>
                        <select
                          className="form-select"
                          value={formData.departamento}
                          onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                          required
                        >
                          <option value="">Seleccionar departamento...</option>
                          <option value="Antioquia">Antioquia</option>
                          <option value="Atlántico">Atlántico</option>
                          <option value="Bolívar">Bolívar</option>
                          <option value="Boyacá">Boyacá</option>
                          <option value="Caldas">Caldas</option>
                          <option value="Caquetá">Caquetá</option>
                          <option value="Cauca">Cauca</option>
                          <option value="Cesar">Cesar</option>
                          <option value="Chocó">Chocó</option>
                          <option value="Córdoba">Córdoba</option>
                          <option value="Cundinamarca">Cundinamarca</option>
                          <option value="Guajira">Guajira</option>
                          <option value="Huila">Huila</option>
                          <option value="Magdalena">Magdalena</option>
                          <option value="Meta">Meta</option>
                          <option value="Nariño">Nariño</option>
                          <option value="Norte de Santander">Norte de Santander</option>
                          <option value="Quindío">Quindío</option>
                          <option value="Risaralda">Risaralda</option>
                          <option value="Santander">Santander</option>
                          <option value="Sucre">Sucre</option>
                          <option value="Tolima">Tolima</option>
                          <option value="Valle del Cauca">Valle del Cauca</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Municipio *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.Municipio}
                          onChange={(e) => setFormData({...formData, Municipio: e.target.value})}
                          required
                          maxLength="50"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label className="form-label">Dirección *</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={formData.direccion}
                          onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                          required
                          placeholder="Ingrese la dirección completa"
                        ></textarea>
                      </div>
                    </div>

                    {/* Información Adicional */}
                    <h6 className="text-primary mb-3 mt-4">
                      <i className="fas fa-info-circle me-2"></i>
                      Información Adicional
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">EPS</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.eps}
                          onChange={(e) => setFormData({...formData, eps: e.target.value})}
                          maxLength="100"
                          placeholder="Nombre de la EPS"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Observaciones</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={formData.observaciones}
                          onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                          placeholder="Observaciones adicionales"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setMostrarFormulario(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save me-2"></i>
                      {editando ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Estudiantes; 