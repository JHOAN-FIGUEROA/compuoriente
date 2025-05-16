import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Sidebar.css';
import logo from '../img/LOGO 1.png'; 

function Sidebar({ visible, cerrarSesion }) {
  const [submenuOpen, setSubmenuOpen] = useState(null);

  const toggleSubmenu = (menu) => {
    setSubmenuOpen(submenuOpen === menu ? null : menu);
  };

  return (
    <div className={`sidebar ${visible ? 'visible' : 'hidden'}`}>
      <div className="sidebar-header">
        <img src={logo} alt="ClassLog Logo" className="sidebar-logo" />
      </div>

      <ul className="sidebar-list">
        <li>
          <button 
            className="sidebar-link submenu-toggle" 
            onClick={() => toggleSubmenu('dashboard')}
          >
            Dashboard
          </button>
          {submenuOpen === 'dashboard' && (
            <ul className="submenu">
              <li><Link to="/dashboard" className="sidebar-link">Dashboard</Link></li>
            </ul>
          )}
        </li>

        <li>
          <button 
            className="sidebar-link submenu-toggle" 
            onClick={() => toggleSubmenu('Configuracion')}
          >
            Configuración
          </button>
          {submenuOpen === 'Configuracion' && (
            <ul className="submenu">
              <li><Link to="/roles" className="sidebar-link">Roles</Link></li>
              <li><Link to="/usuarios" className="sidebar-link">Usuarios</Link></li>
            </ul>
          )}
        </li>

        <li>
          <button className="sidebar-btn" onClick={cerrarSesion}>Cerrar sesión</button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
