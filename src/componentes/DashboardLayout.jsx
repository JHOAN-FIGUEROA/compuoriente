import React, { useState } from 'react';
import Sidebar from './Sidebar';
import '../css/DashboardLayout.css';

function DashboardLayout({ children, cerrarSesion }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  return (
    <>
      <button className="floating-toggle-btn" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar visible={sidebarVisible} cerrarSesion={cerrarSesion} />
      <main className={`dashboard-layout ${sidebarVisible ? 'with-sidebar' : 'no-sidebar'}`}>
        {children}
      </main>
    </>
  );
}

export default DashboardLayout;
