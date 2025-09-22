import React, { useState, useEffect } from 'react';
import { getClasesParaAsistencia, getEstudiantesDeGrupo, crearAsistencia, getAsistenciasPorClase, /* getReporteAsistencias, */ verificarAsistenciaExistente, getAsistenciaById } from '../api';
import { useAuth } from '../contexts/AuthContext';
import '../css/Institucional.css';

// Utilidad para extraer el mensaje del backend
function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Ocurrió un error';
}

const Asistencias = () => {
  // Hook de autenticación
  const { user, role } = useAuth();
  
  // Estados principales
  const [clases, setClases] = useState([]);
  const [loadingClases, setLoadingClases] = useState(true);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [asistencia, setAsistencia] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [asistenciaExistente, setAsistenciaExistente] = useState(null);
  const [modoVisualizacion, setModoVisualizacion] = useState(false);
  
  // Estados para la nueva funcionalidad
  const [vistaActual, setVistaActual] = useState('tabla'); // 'tabla', 'tomar-asistencia', 'ver-asistencias'
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroProfesor, setFiltroProfesor] = useState('');
  const [asistenciasExistentes, setAsistenciasExistentes] = useState([]);
  const [loadingAsistencias, setLoadingAsistencias] = useState(false);
  
  // Estado para detalle
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleError, setDetalleError] = useState(null);
  const [detalle, setDetalle] = useState(null);
  
  const clasesPorPagina = 10;

  useEffect(() => {
    const cargarClases = async () => {
      setLoadingClases(true);
      try {
        const res = await getClasesParaAsistencia();
        setClases(res.data || res);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingClases(false);
      }
    };
    cargarClases();
  }, []);

  // Filtrar clases según los filtros aplicados
  const clasesFiltradas = clases.filter(clase => {
    const cumpleFiltroGrupo = !filtroGrupo || 
      (clase.grupo?.nombre && clase.grupo.nombre.toLowerCase().includes(filtroGrupo.toLowerCase()));
    const cumpleFiltroProfesor = role?.nombre !== 'Administrador' || !filtroProfesor || 
      (clase.profesor?.nombre && 
       `${clase.profesor.nombre} ${clase.profesor.apellido}`.toLowerCase().includes(filtroProfesor.toLowerCase()));
    return cumpleFiltroGrupo && cumpleFiltroProfesor;
  });

  // Calcular paginación
  const totalPaginas = Math.ceil(clasesFiltradas.length / clasesPorPagina);
  const indiceInicio = (paginaActual - 1) * clasesPorPagina;
  const indiceFin = indiceInicio + clasesPorPagina;
  const clasesPaginadas = clasesFiltradas.slice(indiceInicio, indiceFin);

  // Función para cambiar página
  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroGrupo('');
    if (role?.nombre === 'Administrador') {
      setFiltroProfesor('');
    }
    setPaginaActual(1);
  };

  // NUEVO: abrir modal de detalle
  const abrirDetalleAsistencia = async (asistenciaItem) => {
    setDetalleVisible(true);
    setDetalleLoading(true);
    setDetalleError(null);
    setDetalle(null);
    try {
      const data = await getAsistenciaById(asistenciaItem.id);
      setDetalle(data.data || data);
    } catch (e) {
      setDetalleError(getErrorMessage(e));
    } finally {
      setDetalleLoading(false);
    }
  };

  const cerrarDetalle = () => {
    setDetalleVisible(false);
    setDetalle(null);
    setDetalleError(null);
  };

  // Función para descargar reporte de asistencias por clase específica
  const descargarReporteClase = async (clase) => {
    try {
      setError(null);
      
      // Filtros específicos para la clase seleccionada
      const filtrosReporte = {
        clase_id: clase.id
      };
      
      const reporteData = await getReporteAsistencias(filtrosReporte);
      
      if (!reporteData.data || reporteData.data.length === 0) {
        setError(`No hay datos de asistencias para la clase "${clase.nombre}"`);
        return;
      }
      
      // Formatear datos para Excel/CSV
      const datosReporte = reporteData.data.map(asistencia => ({
        Fecha: new Date(asistencia.fecha).toLocaleDateString('es-ES'),
        Clase: asistencia.clase,
        Grupo: asistencia.grupo,
        Profesor: asistencia.profesor,
        Salon: asistencia.salon,
        Estudiante: asistencia.estudiante,
        Documento: asistencia.documento,
        Estado: asistencia.estado,
        Horario: asistencia.hora_clase,
        Dia: asistencia.dia_semana
      }));
      
      // Crear CSV
      const headers = Object.keys(datosReporte[0]);
      const csvContent = [
        headers.join(','),
        ...datosReporte.map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n');
      
      // Agregar BOM para caracteres especiales
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { 
        type: 'text/csv;charset=utf-8' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${clase.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setMensaje(`Reporte de "${clase.nombre}" descargado exitosamente (${datosReporte.length} registros)`);
      setTimeout(() => setMensaje(null), 3000);
      
    } catch (err) {
      console.error('Error al descargar reporte:', err);
      setError(`Error al generar el reporte de la clase "${clase.nombre}"`);
    }
  };

  // Función para descargar reporte general (todas las clases)
  const descargarReporteGeneral = async () => {
    try {
      setError(null);
      
      // Obtener datos de asistencias reales
      const filtrosReporte = {};
      if (filtroGrupo) {
        // Buscar grupo_id por nombre (simplificado)
        const grupoEncontrado = clases.find(clase => 
          clase.grupo?.nombre?.toLowerCase().includes(filtroGrupo.toLowerCase())
        );
        if (grupoEncontrado) {
          filtrosReporte.grupo_id = grupoEncontrado.grupo_id;
        }
      }
      
      const reporteData = await getReporteAsistencias(filtrosReporte);
      
      if (!reporteData.data || reporteData.data.length === 0) {
        setError('No hay datos de asistencias para generar el reporte');
        return;
      }
      
      // Formatear datos para Excel/CSV
      const datosReporte = reporteData.data.map(asistencia => ({
        Fecha: new Date(asistencia.fecha).toLocaleDateString('es-ES'),
        Clase: asistencia.clase,
        Grupo: asistencia.grupo,
        Profesor: asistencia.profesor,
        Salon: asistencia.salon,
        Estudiante: asistencia.estudiante,
        Documento: asistencia.documento,
        Estado: asistencia.estado,
        Horario: asistencia.hora_clase,
        Dia: asistencia.dia_semana
      }));
      
      // Crear CSV
      const headers = Object.keys(datosReporte[0]);
      const csvContent = [
        headers.join(','),
        ...datosReporte.map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n');
      
      // Agregar BOM para caracteres especiales
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { 
        type: 'text/csv;charset=utf-8' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_asistencias_general_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setMensaje(`Reporte general descargado exitosamente (${datosReporte.length} registros)`);
      setTimeout(() => setMensaje(null), 3000);
      
    } catch (err) {
      console.error('Error al descargar reporte:', err);
      setError('Error al generar el reporte de asistencias');
    }
  };

  // Función para ver asistencias de una clase
  const verAsistencias = async (clase) => {
    setClaseSeleccionada(clase);
    setVistaActual('ver-asistencias');
    setLoadingAsistencias(true);
    try {
      const res = await getAsistenciasPorClase(clase.id);
      setAsistenciasExistentes(res.data || res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAsistencias(false);
    }
  };

  // Función para iniciar toma de asistencia
  const iniciarTomarAsistencia = async (clase) => {
    setClaseSeleccionada(clase);
    setVistaActual('tomar-asistencia');
    setLoadingEstudiantes(true);
    setMensaje(null);
    setError(null);
    setAsistenciaExistente(null);
    setModoVisualizacion(false);
    
    try {
      // Verificar si ya existe asistencia para hoy
      const fechaHoy = new Date().toISOString().slice(0, 10);
      const verificacion = await verificarAsistenciaExistente(clase.id, fechaHoy);
      
      if (verificacion.data.existe_asistencia) {
        // Ya existe asistencia, mostrar en modo visualización
        setAsistenciaExistente(verificacion.data);
        setModoVisualizacion(true);
        
        // Cargar estudiantes y su estado de asistencia
        const res = await getEstudiantesDeGrupo(clase.grupo_id);
        setEstudiantes(res.data.estudiantes || res.data);
        
        // Inicializar con los estados existentes
        const asistenciaInicial = {};
        verificacion.data.estudiantes.forEach(est => {
          asistenciaInicial[est.documento] = est.presente ? 'presente' : 'ausente';
        });
        
        // Agregar estudiantes que no tienen asistencia registrada
        (res.data.estudiantes || res.data).forEach(estudiante => {
          if (!asistenciaInicial.hasOwnProperty(estudiante.documento)) {
            asistenciaInicial[estudiante.documento] = 'presente';
          }
        });
        
        setAsistencia(asistenciaInicial);
      } else {
        // No existe asistencia, modo normal de tomar asistencia
        const res = await getEstudiantesDeGrupo(clase.grupo_id);
        setEstudiantes(res.data.estudiantes || res.data);
        
        // Inicializar asistencia como todos presentes
        const asistenciaInicial = {};
        (res.data.estudiantes || res.data).forEach(estudiante => {
          asistenciaInicial[estudiante.documento] = 'presente';
        });
        setAsistencia(asistenciaInicial);
      }
    } catch (err) {
      console.error('Error al iniciar toma de asistencia:', err);
      setError('Error al cargar los datos de asistencia');
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  // Función para volver a la tabla principal
  const volverATabla = () => {
    setVistaActual('tabla');
    setClaseSeleccionada(null);
    setEstudiantes([]);
    setAsistencia({});
    setAsistenciaExistente(null);
    setModoVisualizacion(false);
    setMensaje(null);
    setError(null);
  };

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
    console.log('Iniciando guardado de asistencia...');
    console.log('Estudiantes:', estudiantes);
    console.log('Estado de asistencia:', asistencia);
    console.log('Clase seleccionada:', claseSeleccionada);
    
    setGuardando(true);
    setMensaje(null);
    setError(null);
    
    try {
      const fecha = new Date().toISOString().slice(0, 10);
      console.log('Fecha:', fecha);
      
      if (!estudiantes || estudiantes.length === 0) {
        throw new Error('No hay estudiantes para guardar asistencia');
      }
      
      for (const estudiante of estudiantes) {
        const estadoAsistencia = asistencia[estudiante.documento] === 'presente';
        console.log(`Guardando asistencia para ${estudiante.nombre}: ${estadoAsistencia}`);
        
        await crearAsistencia({
          clase_id: claseSeleccionada.id,
          estudiante_id: estudiante.documento,
          fecha,
          presente: estadoAsistencia
        });
      }
      
      setMensaje('¡Asistencia guardada exitosamente!');
      console.log('Asistencia guardada exitosamente');
      
    } catch (err) {
      console.error('Error al guardar asistencia:', err);
      setError(`Error al guardar la asistencia: ${err.response?.data?.message || err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // Renderizar vista de tabla principal
  const renderVistaTabla = () => (
    <div className="institucional-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
         <h2>Gestión de Asistencias</h2>
         <button className="btn btn-success" onClick={descargarReporteGeneral}>
           <i className="fas fa-download me-2"></i>Reporte General
         </button>
       </div>

      {/* Filtros */}
       <div className="card mb-4">
         <div className="card-body">
           <div className="row">
             <div className={role?.nombre === 'Administrador' ? 'col-md-4' : 'col-md-6'}>
               <label className="form-label">Filtrar por Grupo:</label>
               <input
                 type="text"
                 className="form-control"
                 placeholder="Nombre del grupo..."
                 value={filtroGrupo}
                 onChange={(e) => setFiltroGrupo(e.target.value)}
               />
             </div>
             {role?.nombre === 'Administrador' && (
               <div className="col-md-4">
                 <label className="form-label">Filtrar por Profesor:</label>
                 <input
                   type="text"
                   className="form-control"
                   placeholder="Nombre del profesor..."
                   value={filtroProfesor}
                   onChange={(e) => setFiltroProfesor(e.target.value)}
                 />
               </div>
             )}
             <div className={role?.nombre === 'Administrador' ? 'col-md-4' : 'col-md-6'} style={{display: 'flex', alignItems: 'end'}}>
               <button className="btn btn-outline-secondary" onClick={limpiarFiltros}>
                 <i className="fas fa-times me-2"></i>Limpiar Filtros
               </button>
             </div>
           </div>
         </div>
       </div>

      {mensaje && (
         <div className="alert alert-success alert-dismissible fade show" role="alert">
           {mensaje}
           <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
         </div>
       )}
       
       {loadingClases ? (
         <div className="text-center py-5">
           <div className="spinner-border text-primary" role="status">
             <span className="visually-hidden">Cargando...</span>
           </div>
         </div>
       ) : error ? (
         <div className="alert alert-danger">{error}</div>
       ) : (
        <>
          {/* Información de resultados */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted">
              Mostrando {indiceInicio + 1}-{Math.min(indiceFin, clasesFiltradas.length)} de {clasesFiltradas.length} clases
            </span>
            <span className="text-muted">
              Página {paginaActual} de {totalPaginas}
            </span>
          </div>

          {/* Tabla de clases */}
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Clase</th>
                  <th>Grupo</th>
                  <th>Profesor</th>
                  <th>Horario</th>
                  <th>Día</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clasesPaginadas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div className="text-muted">
                        <i className="fas fa-search fa-2x mb-3"></i>
                        <p>No se encontraron clases con los filtros aplicados</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clasesPaginadas.map(clase => (
                    <tr key={clase.id}>
                      <td>
                        <strong>{clase.nombre}</strong>
                        {clase.ventana_inicio && clase.ventana_fin && (
                          <small className="d-block text-muted">
                            Ventana: {clase.ventana_inicio} - {clase.ventana_fin}
                          </small>
                        )}
                      </td>
                      <td>{clase.grupo?.nombre || 'N/A'}</td>
                      <td>{clase.profesor?.nombre} {clase.profesor?.apellido}</td>
                      <td>{clase.hora_inicio} - {clase.hora_fin}</td>
                      <td>{clase.dia_semana}</td>
                      <td>
                        {clase.puede_tomar_asistencia ? (
                          <span className="badge bg-success">
                            <i className="fas fa-check me-1"></i>Disponible
                          </span>
                        ) : (
                          <span className="badge bg-warning">
                            <i className="fas fa-clock me-1"></i>Fuera de horario
                          </span>
                        )}
                      </td>
                      <td>
                         <div className="btn-group" role="group">
                           {clase.puede_tomar_asistencia ? (
                             <button
                               className="btn btn-primary btn-sm"
                               onClick={() => iniciarTomarAsistencia(clase)}
                               title="Tomar asistencia"
                             >
                               <i className="fas fa-clipboard-check"></i>
                             </button>
                           ) : (
                             <button
                               className="btn btn-outline-primary btn-sm"
                               onClick={() => verAsistencias(clase)}
                               title="Ver asistencias"
                             >
                               <i className="fas fa-eye"></i>
                             </button>
                           )}
                           <button
                             className="btn btn-success btn-sm ms-1"
                             onClick={() => descargarReporteClase(clase)}
                             title="Descargar reporte de esta clase"
                           >
                             <i className="fas fa-download"></i>
                           </button>
                         </div>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <nav aria-label="Paginación de clases">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => cambiarPagina(paginaActual - 1)}>
                    <i className="fas fa-chevron-left"></i>
                  </button>
                </li>
                {[...Array(totalPaginas)].map((_, index) => {
                  const numeroPagina = index + 1;
                  return (
                    <li key={numeroPagina} className={`page-item ${paginaActual === numeroPagina ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => cambiarPagina(numeroPagina)}>
                        {numeroPagina}
                      </button>
                    </li>
                  );
                })}
                <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => cambiarPagina(paginaActual + 1)}>
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );

  // Renderizar vista de tomar asistencia
  const renderTomarAsistencia = () => (
    <div className="institucional-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Tomar Asistencia</h2>
          <h5 className="text-muted">{claseSeleccionada?.nombre}</h5>
          <p className="mb-0">
            <strong>Grupo:</strong> {claseSeleccionada?.grupo?.nombre} | 
            <strong> Horario:</strong> {claseSeleccionada?.hora_inicio} - {claseSeleccionada?.hora_fin}
          </p>
        </div>
        <button className="btn btn-outline-secondary" onClick={volverATabla}>
          <i className="fas fa-arrow-left me-2"></i>Volver
        </button>
      </div>

      {loadingEstudiantes ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visualmente-hidden">Cargando estudiantes...</span>
          </div>
        </div>
      ) : (
        <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {modoVisualizacion ? 'Ver Asistencia' : 'Tomar Asistencia'}
            {asistenciaExistente && (
              <span className="badge bg-info ms-2">
                Ya registrada - {asistenciaExistente.presentes} presentes, {asistenciaExistente.ausentes} ausentes
              </span>
            )}
          </h5>
        </div>
        <div className="card-body">
          <h6 className="card-title">Lista de Estudiantes</h6>
            {estudiantes.length === 0 ? (
              <div className="alert alert-info">No hay estudiantes en este grupo</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Documento</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantes.map(estudiante => (
                       <tr key={estudiante.documento}>
                         <td>{estudiante.nombre} {estudiante.apellido}</td>
                         <td>{estudiante.documento}</td>
                         <td>
                           <div className="btn-group" role="group">
                             <input
                               type="radio"
                               className="btn-check"
                               name={`asistencia-${estudiante.documento}`}
                               id={`presente-${estudiante.documento}`}
                               checked={asistencia[estudiante.documento] === 'presente'}
                               onChange={() => setAsistencia(prev => ({...prev, [estudiante.documento]: 'presente'}))}
                             />
                             <label className="btn btn-outline-success btn-sm" htmlFor={`presente-${estudiante.documento}`}>
                               Presente
                             </label>
                             
                             <input
                               type="radio"
                               className="btn-check"
                               name={`asistencia-${estudiante.documento}`}
                               id={`ausente-${estudiante.documento}`}
                               checked={asistencia[estudiante.documento] === 'ausente'}
                               onChange={() => setAsistencia(prev => ({...prev, [estudiante.documento]: 'ausente'}))}
                             />
                             <label className="btn btn-outline-danger btn-sm" htmlFor={`ausente-${estudiante.documento}`}>
                               Ausente
                             </label>
                           </div>
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {estudiantes.length > 0 && (
              <div className="mt-3">
                {modoVisualizacion ? (
                  // Modo visualización - solo mostrar opciones según el rol
                  <>
                    {role?.nombre === 'Administrador' && (
                      <button
                        className="btn btn-warning me-2"
                        onClick={() => {
                          setModoVisualizacion(false);
                          setAsistenciaExistente(null);
                        }}
                      >
                        <i className="fas fa-edit me-2"></i>
                        Editar Asistencia
                      </button>
                    )}
                    <button className="btn btn-secondary" onClick={volverATabla}>
                      Volver
                    </button>
                  </>
                ) : (
                  // Modo tomar/editar asistencia
                  <>
                    <button 
                      className="btn btn-primary me-2" 
                      onClick={guardarAsistencia}
                      disabled={guardando}
                    >
                      {guardando ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
                      ) : (
                        <><i className="fas fa-save me-2"></i>{asistenciaExistente ? 'Actualizar Asistencia' : 'Guardar Asistencia'}</>
                      )}
                    </button>
                    <button className="btn btn-outline-secondary" onClick={volverATabla}>
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Renderizar vista de asistencias existentes
  const renderVerAsistencias = () => (
    <div className="institucional-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Asistencias Registradas</h2>
          <h5 className="text-muted">{claseSeleccionada?.nombre}</h5>
          <p className="mb-0">
            <strong>Grupo:</strong> {claseSeleccionada?.grupo?.nombre} | 
            <strong> Horario:</strong> {claseSeleccionada?.hora_inicio} - {claseSeleccionada?.hora_fin}
          </p>
        </div>
        <button className="btn btn-outline-secondary" onClick={volverATabla}>
          <i className="fas fa-arrow-left me-2"></i>Volver
        </button>
      </div>

      {loadingAsistencias ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando asistencias...</span>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <h6 className="card-title">Historial de Asistencias</h6>
            {asistenciasExistentes.length === 0 ? (
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                No hay asistencias registradas para esta clase
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Estudiante</th>
                      <th>Estado</th>
                      <th>Registrado por</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistenciasExistentes.map((asistencia, index) => (
                      <tr key={index}>
                        <td>{new Date(asistencia.fecha).toLocaleDateString()}</td>
                        <td>{asistencia.estudiante?.nombre} {asistencia.estudiante?.apellido}</td>
                        <td>
                          <span className={`badge ${asistencia.estado === 'presente' ? 'bg-success' : 'bg-danger'}`}>
                            {asistencia.estado === 'presente' ? 'Presente' : 'Ausente'}
                          </span>
                        </td>
                        <td>{asistencia.registrado_por || 'Sistema'}</td>
                        <td>
                          <button className="btn btn-outline-primary btn-sm" onClick={() => abrirDetalleAsistencia(asistencia)}>
                            <i className="fas fa-eye me-1"></i>
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {detalleVisible && (
        <div className="app-modal-backdrop" role="dialog" aria-modal="true">
          <div className="app-modal">
            <header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Detalle de asistencia</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={cerrarDetalle}>
                <i className="fas fa-times"></i>
              </button>
            </header>
            <div className="content">
              {detalleLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando detalle...</span>
                  </div>
                </div>
              ) : detalleError ? (
                <div className="alert alert-danger">{detalleError}</div>
              ) : detalle ? (
                <div className="row g-3">
                  <div className="col-12">
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>Fecha: </strong>{new Date(detalle.fecha).toLocaleDateString('es-ES')}
                      </div>
                      <div>
                        <strong>Estado: </strong>
                        <span className={`badge ${detalle.presente || detalle.estado === 'presente' ? 'bg-success' : 'bg-danger'}`}>
                          {detalle.presente || detalle.estado === 'presente' ? 'Presente' : 'Ausente'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted">Estudiante</h6>
                    <p className="mb-1"><strong>Nombre:</strong> {detalle.estudiante?.nombre} {detalle.estudiante?.apellido}</p>
                    <p className="mb-0"><strong>Documento:</strong> {detalle.estudiante?.documento}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted">Clase</h6>
                    <p className="mb-1"><strong>Nombre:</strong> {detalle.clase?.nombre}</p>
                    <p className="mb-1"><strong>Grupo:</strong> {detalle.clase?.grupo?.nombre || detalle.grupo?.nombre}</p>
                    <p className="mb-0"><strong>Salón:</strong> {detalle.clase?.salon?.nombre || detalle.salon?.nombre || 'N/A'}</p>
                  </div>
                  <div className="col-md-12">
                    <h6 className="text-muted">Profesor</h6>
                    <p className="mb-0">{detalle.clase?.profesor?.nombre} {detalle.clase?.profesor?.apellido}</p>
                  </div>
                </div>
              ) : (
                <div className="text-muted">No hay información para mostrar</div>
              )}
            </div>
            <footer>
              <button className="btn btn-secondary" onClick={cerrarDetalle}>Cerrar</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );

  // Renderizar vista según el estado actual
  if (vistaActual === 'tomar-asistencia') {
    return renderTomarAsistencia();
  }
  
  if (vistaActual === 'ver-asistencias') {
    return renderVerAsistencias();
  }
  
  return renderVistaTabla();
};

export default Asistencias;