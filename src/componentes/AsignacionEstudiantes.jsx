import React, { useState, useEffect } from 'react';
import { 
  getAsignacionesEstudianteGrupo, 
  asignarEstudianteAGrupo, 
  removerEstudianteDeGrupo,
  getEstudiantes,
  getGrupos
} from '../api';
import '../css/Institucional.css';
import Select from 'react-select';
import Swal from 'sweetalert2';

// Utilidad para extraer el mensaje del backend
function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Ocurrió un error';
}

const AsignacionEstudiantes = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    estudiante_id: '',
    grupo_id: ''
  });
  const [estudiantesOptions, setEstudiantesOptions] = useState([]);
  const [gruposOptions, setGruposOptions] = useState([]);

  useEffect(() => {
    cargarAsignaciones();
    cargarEstudiantesYGrupos();
  }, []);

  const cargarAsignaciones = async () => {
    try {
      setLoading(true);
      const response = await getAsignacionesEstudianteGrupo();
      
      if (response.ok) {
        setAsignaciones(response.data.asignaciones || response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstudiantesYGrupos = async () => {
    try {
      // Traer muchos estudiantes y grupos (puedes ajustar el límite si hay muchos)
      const estRes = await getEstudiantes(1, 1000);
      const grupoRes = await getGrupos(1, 1000);
      setEstudiantesOptions(
        (estRes.data.estudiantes || estRes.data || []).map(e => ({
          value: e.id || e.documento,
          label: `${e.nombre} ${e.apellido} (${e.documento})`
        }))
      );
      setGruposOptions(
        (grupoRes.data.grupos || grupoRes.data || []).map(g => ({
          value: g.id,
          label: `${g.nombre} (ID: ${g.id})`
        }))
      );
    } catch (err) {
      // Opcional: setError('No se pudieron cargar estudiantes o grupos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await asignarEstudianteAGrupo(formData);
      setMostrarFormulario(false);
      resetForm();
      cargarAsignaciones();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEliminar = async (estudiante_id, grupo_id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción removerá el estudiante del grupo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, remover',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await removerEstudianteDeGrupo(estudiante_id, grupo_id);
        Swal.fire('Removido', 'El estudiante fue removido del grupo con éxito', 'success');
        cargarAsignaciones();
      } catch (error) {
        Swal.fire('Error', getErrorMessage(error), 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      estudiante_id: '',
      grupo_id: ''
    });
  };

  const handleNuevo = () => {
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
                <i className="fas fa-user-plus me-2"></i>
                Asignación de Estudiantes
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
                    placeholder="Buscar asignaciones..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleNuevo}>
                <i className="fas fa-plus me-2"></i>
                Nueva Asignación
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
                    <p className="mt-2 text-muted">Cargando asignaciones...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Estudiante ID</th>
                          <th>Grupo ID</th>
                          <th>Fecha de Asignación</th>
                          <th className="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {asignaciones.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-4 text-muted">
                              <i className="fas fa-inbox fa-2x mb-2"></i>
                              <p>No se encontraron asignaciones</p>
                            </td>
                          </tr>
                        ) : (
                          asignaciones.map((asignacion) => (
                            <tr key={asignacion.id}>
                              <td>
                                <span className="fw-bold">#{asignacion.id}</span>
                              </td>
                              <td>
                                <span className="badge bg-primary">Est. #{asignacion.estudiante_id}</span>
                              </td>
                              <td>
                                <span className="badge bg-success">Grupo #{asignacion.grupo_id}</span>
                              </td>
                              <td>
                                <span className="fw-bold text-primary">
                                  {asignacion.fecha_asignacion ? 
                                    new Date(asignacion.fecha_asignacion).toLocaleDateString('es-ES') : 
                                    'N/A'
                                  }
                                </span>
                              </td>
                              <td className="text-center">
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleEliminar(asignacion.estudiante_id, asignacion.grupo_id)}
                                    title="Eliminar asignación"
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

        {/* Modal Formulario */}
        {mostrarFormulario && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-user-plus me-2"></i>
                    Nueva Asignación de Estudiante a Grupo
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
                        <label className="form-label">Estudiante *</label>
                        <Select
                          options={estudiantesOptions}
                          value={estudiantesOptions.find(opt => opt.value === formData.estudiante_id) || null}
                          onChange={opt => setFormData({ ...formData, estudiante_id: opt ? opt.value : '' })}
                          placeholder="Buscar por nombre o documento..."
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
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Nota:</strong> Asegúrese de que tanto el estudiante como el grupo existan en el sistema antes de realizar la asignación.
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
                      Asignar
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

export default AsignacionEstudiantes;
