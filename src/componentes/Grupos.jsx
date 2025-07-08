import React, { useState, useEffect } from 'react';
import { 
  getGrupos, 
  crearGrupo, 
  editarGrupo, 
  eliminarGrupo
} from '../api';
import { useProgramas } from '../hooks/useProgramas';
import '../css/Institucional.css';

// Utilidad para extraer el mensaje del backend
function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Ocurrió un error';
}

const Grupos = () => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    capacidad: '',
    programa_id: '',
    semestre: ''
  });
  const { programas } = useProgramas();

  useEffect(() => {
    cargarGrupos();
  }, [pagina]);



  const cargarGrupos = async () => {
    try {
      setLoading(true);
      const response = await getGrupos(pagina);
      
      if (response.ok) {
        setGrupos(response.data.grupos || response.data);
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
        await editarGrupo(editando.id, formData);
      } else {
        await crearGrupo(formData);
      }
      setMostrarFormulario(false);
      setEditando(null);
      resetForm();
      cargarGrupos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditar = (grupo) => {
    setEditando(grupo);
    setFormData({
      nombre: grupo.nombre || '',
      descripcion: grupo.descripcion || '',
      capacidad: grupo.capacidad || '',
      programa_id: grupo.programa_id || '',
      semestre: grupo.semestre || ''
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este grupo?')) {
      try {
        await eliminarGrupo(id);
        cargarGrupos();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      capacidad: '',
      programa_id: '',
      semestre: ''
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
                <i className="fas fa-users-class me-2"></i>
                Gestión de Grupos
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
                    placeholder="Buscar grupos..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={abrirModalCrear}>
                <i className="fas fa-plus me-2"></i>
                Nuevo Grupo
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
                    <p className="mt-2 text-muted">Cargando grupos...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Descripción</th>
                          <th>Capacidad</th>
                          <th>Programa</th>
                          <th>Semestre</th>
                          <th className="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grupos.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-4 text-muted">
                              <i className="fas fa-inbox fa-2x mb-2"></i>
                              <p>No se encontraron grupos</p>
                            </td>
                          </tr>
                        ) : (
                          grupos.map((grupo) => (
                            <tr key={grupo.id}>
                              <td>
                                <span className="fw-bold">#{grupo.id}</span>
                              </td>
                              <td>
                                <span className="fw-bold text-primary">{grupo.nombre}</span>
                              </td>
                              <td>{grupo.descripcion}</td>
                              <td>
                                <span className="badge bg-info">{grupo.capacidad} estudiantes</span>
                              </td>
                              <td>
                                <span className="badge bg-success">
                                  {grupo.programa?.nombre || grupo.programa || 'Sin programa'}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-warning">Semestre {grupo.semestre}</span>
                              </td>
                              <td className="text-center">
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEditar(grupo)}
                                    title="Editar"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    <i className="fas fa-pen"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleEliminar(grupo.id)}
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
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-users me-2"></i>
                    {editando ? 'Editar Grupo' : 'Nuevo Grupo'}
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
                        <label className="form-label">Nombre *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.nombre}
                          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Capacidad *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.capacidad}
                          onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                          required
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Programa *</label>
                        <select
                          className="form-select"
                          value={formData.programa_id}
                          onChange={(e) => setFormData({...formData, programa_id: e.target.value})}
                          required
                        >
                          <option value="">Seleccionar programa...</option>
                          {programas.map((programa) => (
                            <option key={programa.id} value={programa.id}>
                              {programa.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Semestre</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.semestre}
                          onChange={(e) => setFormData({...formData, semestre: e.target.value})}
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label className="form-label">Descripción</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={formData.descripcion}
                          onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                        />
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

export default Grupos; 