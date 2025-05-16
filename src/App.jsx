// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Usuarios from './componentes/Usuarios';
import Login from './componentes/Login';
import RutaProtegida from './RutaProtegida';
import DashboardLayout from './componentes/DashboardLayout';
import Dashboard from './componentes/Dashboard';
import Roles from './componentes/Roles';
import 'bootstrap/dist/css/bootstrap.min.css';



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

       

        <Route path="*" element={<div>Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
