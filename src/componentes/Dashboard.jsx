import React, { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import '../css/Dashboard.css';
import { obtenerCantidadUsuarios } from '../api'; // ajusta ruta si es necesario

const barDataInicial = [
  { categoria: 'Usuarios Registrados', ventas: 0 },
];

const pieData = [
  { id: 'Electrónica', label: 'Electrónica', value: 45 },
  { id: 'Ropa', label: 'Ropa', value: 25 },
  { id: 'Comida', label: 'Comida', value: 20 },
  { id: 'Otros', label: 'Otros', value: 10 },
];

const Dashboard = () => {
  const [barData, setBarData] = useState(barDataInicial);

  useEffect(() => {
    const fetchCantidadUsuarios = async () => {
      try {
        const cantidad = await obtenerCantidadUsuarios();
        setBarData([{ categoria: 'Usuarios Registrados', ventas: cantidad }]);
      } catch (error) {
        console.error('Error al cargar cantidad de usuarios:', error);
      }
    };
    fetchCantidadUsuarios();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Usuarios Registrados</h3>
          <div className="chart" style={{ height: 300 }}>
            <ResponsiveBar
              data={barData}
              keys={['ventas']}
              indexBy="categoria"
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              padding={0.3}
              colors={{ scheme: 'nivo' }}
              axisBottom={{
                tickRotation: 0,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              animate={true}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Lista de Asistencias</h3>
          <div className="chart" style={{ height: 300 }}>
            <ResponsivePie
              data={pieData}
              margin={{ top: 20, right: 20, bottom: 50, left: 20 }}
              innerRadius={0.5}
              padAngle={1}
              colors={{ scheme: 'paired' }}
              enableArcLabels={false}
              enableRadialLabels={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
