import React, { useState, useEffect } from 'react';
import { 
  getClases, 
  crearClase, 
  editarClase, 
  eliminarClase 
} from '../api';
import Select from 'react-select';
import { getProfesores, getGrupos, getSalones } from '../api';
import '../css/Institucional.css';

const Clases = () => {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    profesor_id: '',
    grupo_id: '',
    dia_semana: '',
    hora_inicio: '',
    hora_fin: '',
    salon_id: ''
  });
  const [profesoresOptions, setProfesoresOptions] = useState([]);
  const [gruposOptions, setGruposOptions] = useState([]);
  const [salonesOptions, setSalonesOptions] = useState([]);

  useEffect(() => {
    cargarClases();
    cargarProfesoresYGrupos();
    cargarSalonesActivos();
  }, [pagina]);

  const cargarSalonesActivos = async () => {
    try {
      const res = await getSalones('all');
      setSalonesOptions(
        (res.data.salones || res.data || []).map(s => ({
          value: s.id,
          label: s.nombre
        }))
      );
    } catch (err) {}
  };

  const cargarClases = async () => {
    try {
      setLoading(true);
      const response = await getClases(pagina);
      
      if (response.ok) {
        setClases(response.data.clases || response.data);
        setTotalPaginas(response.data.totalPaginas || 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarProfesoresYGrupos = async () => {
    try {
      const profRes = await getProfesores(1, 1000);
      const grupoRes = await getGrupos(1, 1000);
      setProfesoresOptions(
        (profRes.data.profesores || profRes.data || []).map(p => ({
          value: p.id,
          label: `${p.nombre} ${p.apellido} (ID: ${p.id}${p.documento ? ', Doc: ' + p.documento : ''})`
        }))
      );
      setGruposOptions(
        (grupoRes.data.grupos || grupoRes.data || []).map(g => ({
          value: g.id,
          label: `${g.nombre} (ID: ${g.id})`
        }))
      );
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!camposCompletos) {
        setError('Por favor completa todos los campos obligatorios.');
        return;
      }
      console.log('Datos enviados:', formData); // <-- Depuración
      if (editando) {
        await editarClase(editando.id, formData);
        setError(null);
        alert('Clase actualizada correctamente.');
      } else {
        await crearClase(formData);
        setError(null);
        alert('Clase creada correctamente.');
      }
      setMostrarFormulario(false);
      setEditando(null);
      resetForm();
      cargarClases();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditar = (clase) => {
    setEditando(clase);
    setFormData({
      nombre: clase.nombre || '',
      descripcion: clase.descripcion || '',
      profesor_id: clase.profesor_id || '',
      grupo_id: clase.grupo_id || '',
      dia_semana: clase.dia_semana || '',
      hora_inicio: clase.hora_inicio || '',
      hora_fin: clase.hora_fin || '',
      salon_id: clase.salon_id || clase.salon || ''
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
      try {
        await eliminarClase(id);
        cargarClases();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      profesor_id: '',
      grupo_id: '',
      dia_semana: '',
      hora_inicio: '',
      hora_fin: '',
      salon_id: ''
    });
  };

  const handleNuevo = () => {
    setEditando(null);
    resetForm();
    setMostrarFormulario(true);
  };

  const getDiaSemana = (dia) => {
    const dias = {
      '1': 'Lunes',
      '2': 'Martes', 
      '3': 'Miércoles',
      '4': 'Jueves',
      '5': 'Viernes',
      '6': 'Sábado',
      '7': 'Domingo'
    };
    return dias[dia] || dia;
  };

  // Utilidad para extraer el mensaje del backend
  function getErrorMessage(error) {
    return error?.response?.data?.message || error?.message || 'Ocurrió un error';
  }

  const camposCompletos = formData.nombre && formData.profesor_id && formData.grupo_id && formData.dia_semana && formData.hora_inicio && formData.hora_fin && formData.salon_id;

  return (
    <div className="institucional-container" style={{ paddingTop: 0, marginTop: 0 }}>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="mb-0">
                <i className="fas fa-chalkboard-teacher me-2"></i>
                Gestión de Clases
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
                    placeholder="Buscar clases..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleNuevo}>
                <i className="fas fa-plus me-2"></i>
                Nueva Clase
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
                    <p className="mt-2 text-muted">Cargando clases...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Día</th>
                          <th>Horario</th>
                          <th>Salón</th>
                          <th>Profesor ID</th>
                          <th>Grupo ID</th>
                          <th className="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clases.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-4 text-muted">
                              <i className="fas fa-inbox fa-2x mb-2"></i>
                              <p>No se encontraron clases</p>
                            </td>
                          </tr>
                        ) : (
                          clases.map((clase) => (
                            <tr key={clase.id}>
                              <td>
                                <span className="fw-bold">#{clase.id}</span>
                              </td>
                              <td>
                                <span className="fw-bold text-primary">{clase.nombre}</span>
                                {clase.descripcion && (
                                  <small className="d-block text-muted">{clase.descripcion}</small>
                                )}
                              </td>
                              <td>
                                <span className="badge bg-info">{getDiaSemana(clase.dia_semana)}</span>
                              </td>
                              <td>
                                <span className="fw-bold">
                                  {clase.hora_inicio} - {clase.hora_fin}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-secondary">{clase.salon?.nombre || '-'}</span>
                              </td>
                              <td>
                                <span className="badge bg-success">Prof. #{clase.profesor_id}</span>
                              </td>
                              <td>
                                <span className="badge bg-warning">Grupo #{clase.grupo_id}</span>
                              </td>
                              <td className="text-center">
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEditar(clase)}
                                    title="Editar"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    <i className="fas fa-pen"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleEliminar(clase.id)}
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
                    <i className="fas fa-book me-2"></i>
                    {editando ? 'Editar Clase' : 'Nueva Clase'}
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
                        <label className="form-label">Salón *</label>
                        <Select
                          options={salonesOptions}
                          value={salonesOptions.find(opt => opt.value === formData.salon_id) || null}
                          onChange={opt => setFormData({ ...formData, salon_id: opt ? opt.value : '' })}
                          placeholder="Seleccionar salón..."
                          isClearable
                          isSearchable
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Profesor *</label>
                        <Select
                          options={profesoresOptions}
                          value={profesoresOptions.find(opt => opt.value === formData.profesor_id) || null}
                          onChange={opt => setFormData({ ...formData, profesor_id: opt ? opt.value : '' })}
                          placeholder="Buscar por nombre, ID o documento..."
                          isClearable
                          isSearchable
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Grupo *</label>
                        <Select
                          options={gruposOptions}
                          value={gruposOptions.find(opt => opt.value === formData.grupo_id) || null}
                          onChange={opt => setFormData({ ...formData, grupo_id: opt ? opt.value : '' })}
                          placeholder="Buscar por nombre o ID..."
                          isClearable
                          isSearchable
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Día de la semana *</label>
                        <select
                          className="form-select"
                          value={formData.dia_semana}
                          onChange={(e) => setFormData({...formData, dia_semana: e.target.value})}
                          required
                        >
                          <option value="">Seleccionar día</option>
                          <option value="1">Lunes</option>
                          <option value="2">Martes</option>
                          <option value="3">Miércoles</option>
                          <option value="4">Jueves</option>
                          <option value="5">Viernes</option>
                          <option value="6">Sábado</option>
                          <option value="7">Domingo</option>
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Hora inicio *</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.hora_inicio}
                          onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Hora fin *</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.hora_fin}
                          onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                          required
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
                    <button type="submit" className="btn btn-primary" disabled={!camposCompletos}>
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

export default Clases; 