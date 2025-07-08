import React, { useState, useEffect } from 'react';
import { getClasesPorProfesor, getEstudiantesDeGrupo, crearAsistencia } from '../api';
import '../css/Institucional.css';

// Simulación de obtención de ID de profesor (ajusta según tu auth real)
const getProfesorId = () => {
  // Por ejemplo, desde localStorage o contexto de usuario autenticado
  return localStorage.getItem('profesor_id') || 1; // Cambia esto por tu lógica real
};

// Utilidad para extraer el mensaje del backend
function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Ocurrió un error';
}

const Asistencias = () => {
  const [clases, setClases] = useState([]);
  const [loadingClases, setLoadingClases] = useState(true);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencia, setAsistencia] = useState({});
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarClases = async () => {
      setLoadingClases(true);
      try {
        const profesorId = getProfesorId();
        const res = await getClasesPorProfesor(profesorId);
        setClases(res.data.clases || res.data);
      } catch (err) {
        setError('Error al cargar clases');
      } finally {
        setLoadingClases(false);
      }
    };
    cargarClases();
  }, []);

  const seleccionarClase = async (clase) => {
    setClaseSeleccionada(clase);
    setLoadingEstudiantes(true);
    setMensaje(null);
    setError(null);
    try {
      const res = await getEstudiantesDeGrupo(clase.grupo_id);
      setEstudiantes(res.data.estudiantes || res.data);
      // Por defecto todos presentes
      const asistenciaInicial = {};
      (res.data.estudiantes || res.data).forEach(est => {
        asistenciaInicial[est.id] = true;
      });
      setAsistencia(asistenciaInicial);
    } catch (err) {
      setError('Error al cargar estudiantes');
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  const cambiarEstado = (id) => {
    setAsistencia(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const guardarAsistencia = async () => {
    setGuardando(true);
    setMensaje(null);
    setError(null);
    try {
      const fecha = new Date().toISOString().slice(0, 10);
      for (const estudiante of estudiantes) {
        await crearAsistencia({
          clase_id: claseSeleccionada.id,
          estudiante_id: estudiante.id,
          fecha,
          presente: !!asistencia[estudiante.id]
        });
      }
      setMensaje('¡Asistencia guardada exitosamente!');
    } catch (err) {
      setError('Error al guardar la asistencia');
    } finally {
      setGuardando(false);
    }
  };

  // Vista de selección de clase
  if (!claseSeleccionada) {
    return (
      <div className="institucional-container">
        <h2>Tomar Asistencia</h2>
        {loadingClases ? (
          <div className="loading-state"><div className="spinner-border text-primary" /></div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="row">
            {clases.length === 0 ? (
              <div className="empty-state">No tienes clases asignadas.</div>
            ) : (
              clases.map(clase => (
                <div className="col-md-6 col-lg-4 mb-4" key={clase.id}>
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">{clase.nombre}</h5>
                      <p className="card-text mb-1"><b>Grupo:</b> {clase.grupo_id}</p>
                      <p className="card-text mb-1"><b>Horario:</b> {clase.hora_inicio} - {clase.hora_fin}</p>
                      <button className="btn btn-primary mt-2" onClick={() => seleccionarClase(clase)}>
                        Tomar asistencia
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // Vista de toma de asistencia
  return (
    <div className="institucional-container">
      <h2>Asistencia - {claseSeleccionada.nombre}</h2>
      <button className="btn btn-secondary mb-3" onClick={() => setClaseSeleccionada(null)}>
        ← Volver a clases
      </button>
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {loadingEstudiantes ? (
        <div className="loading-state"><div className="spinner-border text-primary" /></div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); guardarAsistencia(); }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Documento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map(est => (
                  <tr key={est.id}>
                    <td>{est.nombre} {est.apellido}</td>
                    <td>{est.documento}</td>
                    <td>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: asistencia[est.id] ? 'green' : 'red', fontWeight: 'bold' }}>
                          {asistencia[est.id] ? 'Presente' : 'Ausente'}
                        </span>
                        <input
                          type="checkbox"
                          checked={!!asistencia[est.id]}
                          onChange={() => cambiarEstado(est.id)}
                          style={{ width: 32, height: 32, accentColor: asistencia[est.id] ? '#28a745' : '#dc3545' }}
                        />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="submit" className="btn btn-primary btn-lg mt-3" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar asistencia'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Asistencias; 