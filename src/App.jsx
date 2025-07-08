// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Usuarios from './componentes/Usuarios';
import Login from './componentes/Login';
import RutaProtegida from './RutaProtegida';
import DashboardLayout from './componentes/DashboardLayout';
import Dashboard from './componentes/Dashboard';
import Roles from './componentes/Roles';
import Asistencias from './componentes/Asistencias';
import Clases from './componentes/Clases';
import Estudiantes from './componentes/Estudiantes';
import Grupos from './componentes/Grupos';
import Profesores from './componentes/Profesores';
import AsignacionEstudiantes from './componentes/AsignacionEstudiantes';
import Programas from './componentes/Programas';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            !token ? (
              <Login setToken={setToken} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        /> <Route
          path="/dashboard"
          element={
            <RutaProtegida>
              <DashboardLayout cerrarSesion={cerrarSesion}>
                <Dashboard />
              </DashboardLayout>
            </RutaProtegida>
          }
        />

        <Route
          path="/usuarios"
          element={
            <RutaProtegida>
              <DashboardLayout cerrarSesion={cerrarSesion}>
                <Usuarios />
              </DashboardLayout>
            </RutaProtegida>
          }
        />
        <Route
          path="/roles"
          element={
            <RutaProtegida>
              <DashboardLayout cerrarSesion={cerrarSesion}>
                <Roles/>
              </DashboardLayout>
            </RutaProtegida>
          }
        />
        <Route
          path="/asistencias"
          element={
            <RutaProtegida>
              <DashboardLayout cerrarSesion={cerrarSesion}>
                <Asistencias />
              </DashboardLayout>
            </RutaProtegida>
          }
        />
        <Route
          path="/clases"
          element={
            <RutaProtegida>
              <DashboardLayout cerrarSesion={cerrarSesion}>
                <Clases />
              </DashboardLayout>
            </RutaProtegida>
          }
        />
        <Route
          path="/estudiantes"
          element={
            <RutaProtegida>
              <DashboardLayout cerrarSesion={cerrarSesion}>
                <Estudiantes />
              </DashboardLayout>
            </RutaProtegida>
          }
        />
        <Route
          path="/grupos"
          element={
            <RutaProtegida>
              <DashboardLayout cerrarSesion={cerrarSesion}>
                <Grupos />
              </DashboardLayout>
            </RutaProtegida>
          }
        />
        <Route
          path="/profesores"
          element={
            <RutaProtegida>
              <DashboardLayout cerrarSesion={cerrarSesion}>
                <Profesores />
              </DashboardLayout>
            </RutaProtegida>
          }
        />
        <Route
          path="/asignacion-estudiantes"
          element={
            <RutaProtegida>
              <DashboardLayout cerrarSesion={cerrarSesion}>
                <AsignacionEstudiantes />
              </DashboardLayout>
            </RutaProtegida>
          }
        />
        <Route
          path="/programas"
          element={
            <RutaProtegida>
              <DashboardLayout cerrarSesion={cerrarSesion}>
                <Programas />
              </DashboardLayout>
            </RutaProtegida>
          }
        />

       

        <Route path="*" element={<div>Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
