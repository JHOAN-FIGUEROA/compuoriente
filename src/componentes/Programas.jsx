import React, { useState, useEffect } from 'react';
import { 
  getProgramas, 
  crearPrograma, 
  editarPrograma, 
  eliminarPrograma, 
  buscarProgramas 
} from '../api';
import '../css/Institucional.css';

// Utilidad para extraer el mensaje del backend
function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Ocurrió un error';
}

const Programas = () => {
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    duracion: '',
    modalidad: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarProgramas();
  }, [pagina, busqueda]);

  const cargarProgramas = async () => {
    try {
      setLoading(true);
      const response = busqueda 
        ? await buscarProgramas(busqueda, pagina)
        : await getProgramas(pagina);
      
      if (response.ok) {
        setProgramas(response.data.programas || response.data);
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
        await editarPrograma(editando.id, formData);
      } else {
        await crearPrograma(formData);
      }
      setMostrarFormulario(false);
      setEditando(null);
      resetForm();
      cargarProgramas();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditar = (programa) => {
    setEditando(programa);
    setFormData({
      nombre: programa.nombre || '',
      duracion: programa.duracion || '',
      modalidad: programa.modalidad || '',
      descripcion: programa.descripcion || ''
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este programa?')) {
      try {
        await eliminarPrograma(id);
        cargarProgramas();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      duracion: '',
      modalidad: '',
      descripcion: ''
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
                <i className="fas fa-graduation-cap me-2"></i>
                Gestión de Programas
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
                    placeholder="Buscar programas..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleNuevo}>
                <i className="fas fa-plus me-2"></i>
                Nuevo Programa
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
                    <p className="mt-2 text-muted">Cargando programas...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Descripción</th>
                          <th>Duración</th>
                          <th>Modalidad</th>
                          <th className="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programas.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-4 text-muted">
                              <i className="fas fa-inbox fa-2x mb-2"></i>
                              <p>No se encontraron programas</p>
                            </td>
                          </tr>
                        ) : (
                          programas.map((programa) => (
                            <tr key={programa.id}>
                              <td>
                                <span className="badge bg-secondary">{programa.id}</span>
                              </td>
                              <td>
                                <strong>{programa.nombre}</strong>
                              </td>
                              <td>
                                <span className="text-muted">
                                  {programa.descripcion ? 
                                    (programa.descripcion.length > 50 ? 
                                      programa.descripcion.substring(0, 50) + '...' : 
                                      programa.descripcion
                                    ) : 
                                    'Sin descripción'
                                  }
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-info">{programa.duracion}</span>
                              </td>
                              <td>
                                <span className="badge bg-warning">{programa.modalidad}</span>
                              </td>
                              <td className="text-center">
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEditar(programa)}
                                    title="Editar"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    <i className="fas fa-pen"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleEliminar(programa.id)}
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
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-graduation-cap me-2"></i>
                    {editando ? 'Editar Programa' : 'Nuevo Programa'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setMostrarFormulario(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Nombre del Programa *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.nombre}
                          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                          required
                          maxLength="100"
                          placeholder="Ej: Técnico en Sistemas"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Duración *</label>
                        <select
                          className="form-select"
                          value={formData.duracion}
                          onChange={(e) => setFormData({...formData, duracion: e.target.value})}
                          required
                        >
                          <option value="">Seleccionar duración...</option>
                          <option value="6 meses">6 meses</option>
                          <option value="1 año">1 año</option>
                          <option value="1.5 años">1.5 años</option>
                          <option value="2 años">2 años</option>
                          <option value="3 años">3 años</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Modalidad *</label>
                        <select
                          className="form-select"
                          value={formData.modalidad}
                          onChange={(e) => setFormData({...formData, modalidad: e.target.value})}
                          required
                        >
                          <option value="">Seleccionar modalidad...</option>
                          <option value="Presencial">Presencial</option>
                          <option value="Virtual">Virtual</option>
                          <option value="Híbrida">Híbrida</option>
                          <option value="Distancia">Distancia</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label className="form-label">Descripción</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          value={formData.descripcion}
                          onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                          placeholder="Descripción detallada del programa..."
                          maxLength="500"
                        ></textarea>
                        <div className="form-text">
                          {formData.descripcion.length}/500 caracteres
                        </div>
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

export default Programas; 