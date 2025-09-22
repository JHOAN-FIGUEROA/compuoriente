import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import '../css/DashboardLayout.css';
import NavBar from './cerrarsesion';

function DashboardLayout({ children, cerrarSesion }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { user, role, logout } = useAuth();

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    cerrarSesion();
  };

  const nombre = user?.nombre || localStorage.getItem('nombre') || '';
  const apellido = user?.apellido || localStorage.getItem('apellido') || '';

  return (
    <>
      <button className="floating-toggle-btn" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar visible={sidebarVisible} cerrarSesion={handleLogout} />
      <div className="header-institucional">
        <div className="header-content">
          <div className="user-info" style={{ marginRight: 'auto' }}>
            <span className="saludo-usuario" style={{ fontWeight: 600, fontSize: '1.1rem', display: 'block' }}>
              {nombre ? `Hola, ${nombre} ${apellido}` : ''}
            </span>
            {role && (
              <span className="user-role" style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                Rol: {role.nombre}
              </span>
            )}
          </div>
          <NavBar cerrarSesion={handleLogout} />
        </div>
      </div>
      <main className={`dashboard-layout ${sidebarVisible ? 'with-sidebar' : 'no-sidebar'}`}
        style={{ paddingTop: '5.5rem' }} // deja espacio para el header
      >
        {children}
      </main>
    </>
  );
}

export default DashboardLayout;
