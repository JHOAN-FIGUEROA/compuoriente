import React, { useState } from 'react';
import Sidebar from './Sidebar';
import '../css/DashboardLayout.css';
import NavBar from './cerrarsesion';

function DashboardLayout({ children, cerrarSesion }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  const nombre = localStorage.getItem('nombre') || '';
  const apellido = localStorage.getItem('apellido') || '';

  return (
    <>
      <button className="floating-toggle-btn" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar visible={sidebarVisible} cerrarSesion={cerrarSesion} />
      <div className="header-institucional">
        <div className="header-content">
          <span className="saludo-usuario" style={{ fontWeight: 600, fontSize: '1.1rem', marginRight: 'auto' }}>
            {nombre ? `Hola, ${nombre} ${apellido}` : ''}
          </span>
          <NavBar cerrarSesion={cerrarSesion} />
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
