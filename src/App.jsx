// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Usuarios from './componentes/Usuarios';
import Login from './componentes/Login';
import RutaProtegida from './RutaProtegida';
import ProtectedRoute from './componentes/ProtectedRoute';
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
import Salones from './componentes/Salones';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthProvider>
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
              <ProtectedRoute requiredPermission="acceso_usuarios">
                <DashboardLayout cerrarSesion={cerrarSesion}>
                  <Usuarios />
                </DashboardLayout>
              </ProtectedRoute>
            </RutaProtegida>
          }
        />
        <Route
          path="/roles"
          element={
            <RutaProtegida>
              <ProtectedRoute requiredPermission="acceso_roles">
                <DashboardLayout cerrarSesion={cerrarSesion}>
                  <Roles />
                </DashboardLayout>
              </ProtectedRoute>
            </RutaProtegida>
          }
        />
        <Route
          path="/asistencias"
          element={
            <RutaProtegida>
              <ProtectedRoute requiredPermission="acceso_asistencias">
                <DashboardLayout cerrarSesion={cerrarSesion}>
                  <Asistencias />
                </DashboardLayout>
              </ProtectedRoute>
            </RutaProtegida>
          }
        />
        <Route
          path="/clases"
          element={
            <RutaProtegida>
              <ProtectedRoute requiredPermission="acceso_clases">
                <DashboardLayout cerrarSesion={cerrarSesion}>
                  <Clases />
                </DashboardLayout>
              </ProtectedRoute>
            </RutaProtegida>
          }
        />
        <Route
          path="/estudiantes"
          element={
            <RutaProtegida>
              <ProtectedRoute requiredPermission="acceso_estudiantes">
                <DashboardLayout cerrarSesion={cerrarSesion}>
                  <Estudiantes />
                </DashboardLayout>
              </ProtectedRoute>
            </RutaProtegida>
          }
        />
        <Route
          path="/grupos"
          element={
            <RutaProtegida>
              <ProtectedRoute requiredPermission="acceso_grupos">
                <DashboardLayout cerrarSesion={cerrarSesion}>
                  <Grupos />
                </DashboardLayout>
              </ProtectedRoute>
            </RutaProtegida>
          }
        />
        <Route
          path="/profesores"
          element={
            <RutaProtegida>
              <ProtectedRoute requiredPermission="acceso_profesores">
                <DashboardLayout cerrarSesion={cerrarSesion}>
                  <Profesores />
                </DashboardLayout>
              </ProtectedRoute>
            </RutaProtegida>
          }
        />
        <Route
          path="/asignacion-estudiantes"
          element={
            <RutaProtegida>
              <ProtectedRoute requiredPermission="acceso_estudiante_grupo">
                <DashboardLayout cerrarSesion={cerrarSesion}>
                  <AsignacionEstudiantes />
                </DashboardLayout>
              </ProtectedRoute>
            </RutaProtegida>
          }
        />
        <Route
          path="/programas"
          element={
            <RutaProtegida>
              <ProtectedRoute requiredPermission="acceso_programas">
                <DashboardLayout cerrarSesion={cerrarSesion}>
                  <Programas />
                </DashboardLayout>
              </ProtectedRoute>
            </RutaProtegida>
          }
        />
        <Route
          path="/salones"
          element={
            <RutaProtegida>
              <ProtectedRoute requiredPermission="acceso_salones">
                <DashboardLayout cerrarSesion={cerrarSesion}>
                  <Salones />
                </DashboardLayout>
              </ProtectedRoute>
            </RutaProtegida>
          }
        />

       

        <Route path="*" element={<div>Página no encontrada</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
