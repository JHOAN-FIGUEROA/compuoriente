// src/componentes/Dashboard.jsx
import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import '../css/Dashboard.css';

const barData = [
  { categoria: 'Enero', ventas: 150 },
  { categoria: 'Febrero', ventas: 200 },
  { categoria: 'Marzo', ventas: 300 },
  { categoria: 'Abril', ventas: 180 },
];

const pieData = [
  { id: 'Electrónica', label: 'Electrónica', value: 45 },
  { id: 'Ropa', label: 'Ropa', value: 25 },
  { id: 'Comida', label: 'Comida', value: 20 },
  { id: 'Otros', label: 'Otros', value: 10 },
];

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Estudiantes Registrados</h3>
          <div className="chart">
            <ResponsiveBar
              data={barData}
              keys={['ventas']}
              indexBy="categoria"
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              padding={0.3}
              colors={{ scheme: 'nivo' }}
              axisBottom={{
                tickRotation: -30,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Lista de Asitencias</h3>
          <div className="chart">
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
