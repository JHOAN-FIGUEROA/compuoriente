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
          <button 
            className="sidebar-link submenu-toggle" 
            onClick={() => toggleSubmenu('Academico')}
          >
            Académico
          </button>
          {submenuOpen === 'Academico' && (
            <ul className="submenu">
              <li><Link to="/asistencias" className="sidebar-link">Asistencias</Link></li>
              <li><Link to="/clases" className="sidebar-link">Clases</Link></li>
              <li><Link to="/estudiantes" className="sidebar-link">Estudiantes</Link></li>
              <li><Link to="/grupos" className="sidebar-link">Grupos</Link></li>
              <li><Link to="/programas" className="sidebar-link">Programas</Link></li>
              <li><Link to="/profesores" className="sidebar-link">Profesores</Link></li>
              <li><Link to="/asignacion-estudiantes" className="sidebar-link">Asignación Estudiantes</Link></li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
