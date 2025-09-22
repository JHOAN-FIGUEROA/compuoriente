import React, { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import '../css/Dashboard.css';
import { getDashboardResumen, getAsistenciasDiarias, getDashboardEstudiantesPorPrograma } from '../api';

const Dashboard = () => {
  const [resumen, setResumen] = useState(null);
  const [loadingResumen, setLoadingResumen] = useState(true);
  const [errorResumen, setErrorResumen] = useState('');

  const [serieAsistencias, setSerieAsistencias] = useState([]);
  const [loadingAsistencias, setLoadingAsistencias] = useState(true);
  const [errorAsistencias, setErrorAsistencias] = useState('');

  const [programasData, setProgramasData] = useState([]);
  const [loadingProgramas, setLoadingProgramas] = useState(true);
  const [errorProgramas, setErrorProgramas] = useState('');

  useEffect(() => {
    // Resumen
    const fetchResumen = async () => {
      setLoadingResumen(true);
      setErrorResumen('');
      try {
        const data = await getDashboardResumen();
        setResumen(data);
      } catch (err) {
        setErrorResumen(err.message || 'Error cargando el resumen');
      } finally {
        setLoadingResumen(false);
      }
    };

    // Serie de asistencias (requiere permiso acceso_asistencias)
    const fetchAsistencias = async () => {
      setLoadingAsistencias(true);
      setErrorAsistencias('');
      try {
        const data = await getAsistenciasDiarias(14); // últimas 2 semanas
        setSerieAsistencias(data);
      } catch (err) {
        setErrorAsistencias(err.message || 'Error cargando asistencias');
      } finally {
        setLoadingAsistencias(false);
      }
    };

    // Estudiantes por programa (requiere permiso acceso_estudiantes)
    const fetchProgramas = async () => {
      setLoadingProgramas(true);
      setErrorProgramas('');
      try {
        const data = await getDashboardEstudiantesPorPrograma(6);
        setProgramasData(Array.isArray(data) ? data : []);
      } catch (err) {
        setErrorProgramas(err.message || 'Error cargando estudiantes por programa');
      } finally {
        setLoadingProgramas(false);
      }
    };

    fetchResumen();
    fetchAsistencias();
    fetchProgramas();
  }, []);

  // Datos para Nivo Bar (asistencias)
  const barAsistenciasData = Array.isArray(serieAsistencias)
    ? serieAsistencias.map(d => ({
        fecha: d.fecha,
        presentes: d.presentes,
        ausentes: d.ausentes
      }))
    : [];

  // Datos para Nivo Pie (programas)
  const pieProgramasData = Array.isArray(programasData)
    ? programasData.map(p => ({ id: p.programa, label: p.programa, value: p.total }))
    : [];

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <div className="page-subtitle">Resumen general de la operación</div>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Usuarios</div>
          <div className="kpi-value">
            {loadingResumen ? '...' : (resumen?.usuariosTotales ?? '-')}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Estudiantes activos</div>
          <div className="kpi-value">
            {loadingResumen ? '...' : (resumen?.estudiantesActivos ?? '-')}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Profesores</div>
          <div className="kpi-value">
            {loadingResumen ? '...' : (resumen?.profesoresTotales ?? '-')}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Grupos</div>
          <div className="kpi-value">
            {loadingResumen ? '...' : (resumen?.gruposTotales ?? '-')}
          </div>
        </div>
      </div>

      {/* Mensaje error resumen */}
      {errorResumen && (
        <div className="alert alert-danger mt-3">{errorResumen}</div>
      )}

      <div className="dashboard-charts">
        {/* Gráfica de asistencias */}
        <div className="chart-card">
          <div className="card-header">
            <h3 className="card-title">Asistencias (últimos días)</h3>
          </div>
          {loadingAsistencias ? (
            <div className="chart-loading">Cargando...</div>
          ) : errorAsistencias ? (
            <div className="chart-error">{errorAsistencias}</div>
          ) : barAsistenciasData.length === 0 ? (
            <div className="chart-empty">Sin datos</div>
          ) : (
            <div className="card-body">
              <div className="chart" style={{ height: 320 }}>
                <ResponsiveBar
                  data={barAsistenciasData}
                  keys={['presentes', 'ausentes']}
                  indexBy="fecha"
                  margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                  padding={0.25}
                  colors={["#2ca58d", "#e76f51"]}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  axisBottom={{ tickRotation: -30 }}
                  groupMode="stacked"
                  tooltip={({ id, value, indexValue }) => (
                    <strong>{indexValue} - {id}: {value}</strong>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Gráfica estudiantes por programa */}
        <div className="chart-card">
          <div className="card-header">
            <h3 className="card-title">Estudiantes por programa (Top)</h3>
          </div>
          {loadingProgramas ? (
            <div className="chart-loading">Cargando...</div>
          ) : errorProgramas ? (
            <div className="chart-error">{errorProgramas}</div>
          ) : pieProgramasData.length === 0 ? (
            <div className="chart-empty">Sin datos</div>
          ) : (
            <div className="card-body">
              <div className="chart" style={{ height: 320 }}>
                <ResponsivePie
                  data={pieProgramasData}
                  margin={{ top: 20, right: 20, bottom: 50, left: 20 }}
                  innerRadius={0.5}
                  padAngle={1}
                  colors={{ scheme: 'paired' }}
                  enableArcLabels={false}
                  enableRadialLabels={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resumen de asistencias del día */}
      <div className="kpi-grid" style={{ marginTop: '1rem' }}>
        <div className="kpi-card">
          <div className="kpi-title">Presentes hoy</div>
          <div className="kpi-value">
            {loadingResumen ? '...' : (resumen?.asistenciasHoy?.presentes ?? '-')}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Ausentes hoy</div>
          <div className="kpi-value">
            {loadingResumen ? '...' : (resumen?.asistenciasHoy?.ausentes ?? '-')}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Total registros hoy</div>
          <div className="kpi-value">
            {loadingResumen ? '...' : (resumen?.asistenciasHoy?.total ?? '-')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
