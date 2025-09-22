import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../css/Sidebar.css';
import logo from '../img/LOGO 1.png'; 

function Sidebar({ visible, cerrarSesion }) {
  const [submenuOpen, setSubmenuOpen] = useState(null);
  const { hasPermission, user, role } = useAuth();

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
            <i className="fas fa-tachometer-alt me-2"></i>
            Dashboard
          </button>
          {submenuOpen === 'dashboard' && (
            <ul className="submenu">
              <li><Link to="/dashboard" className="sidebar-link"><i className="fas fa-home me-2"></i>Dashboard</Link></li>
            </ul>
          )}
        </li>

        {(hasPermission('acceso_roles') || hasPermission('acceso_usuarios')) && (
          <li>
            <button 
              className="sidebar-link submenu-toggle" 
              onClick={() => toggleSubmenu('Configuracion')}
            >
              <i className="fas fa-cogs me-2"></i>
              Configuración
            </button>
            {submenuOpen === 'Configuracion' && (
              <ul className="submenu">
                {hasPermission('acceso_roles') && (
                  <li><Link to="/roles" className="sidebar-link"><i className="fas fa-user-shield me-2"></i>Roles</Link></li>
                )}
                {hasPermission('acceso_usuarios') && (
                  <li><Link to="/usuarios" className="sidebar-link"><i className="fas fa-users me-2"></i>Usuarios</Link></li>
                )}
              </ul>
            )}
          </li>
        )}

        {(hasPermission('acceso_asistencias') || hasPermission('acceso_clases') || hasPermission('acceso_estudiantes') || hasPermission('acceso_grupos')) && (
          <li>
            <button 
              className="sidebar-link submenu-toggle" 
              onClick={() => toggleSubmenu('Academico')}
            >
              <i className="fas fa-graduation-cap me-2"></i>
              Académico
            </button>
            {submenuOpen === 'Academico' && (
              <ul className="submenu">
                {hasPermission('acceso_asistencias') && (
                  <li><Link to="/asistencias" className="sidebar-link"><i className="fas fa-clipboard-list me-2"></i>Asistencias</Link></li>
                )}
                {hasPermission('acceso_clases') && (
                  <li><Link to="/clases" className="sidebar-link"><i className="fas fa-chalkboard-teacher me-2"></i>Clases</Link></li>
                )}
                {hasPermission('acceso_estudiantes') && (
                  <li><Link to="/estudiantes" className="sidebar-link"><i className="fas fa-user-graduate me-2"></i>Estudiantes</Link></li>
                )}
                {hasPermission('acceso_grupos') && (
                  <li><Link to="/grupos" className="sidebar-link"><i className="fas fa-users-cog me-2"></i>Grupos</Link></li>
                )}
              </ul>
            )}
          </li>
        )}
        {(hasPermission('acceso_programas') || hasPermission('acceso_profesores') || hasPermission('acceso_estudiante_grupo') || hasPermission('acceso_salones')) && (
          <li>
            <button 
              className="sidebar-link submenu-toggle" 
              onClick={() => toggleSubmenu('Gestion')}
            >
              <i className="fas fa-layer-group me-2"></i>
              Gestión
            </button>
            {submenuOpen === 'Gestion' && (
              <ul className="submenu">
                {hasPermission('acceso_programas') && (
                  <li><Link to="/programas" className="sidebar-link"><i className="fas fa-book me-2"></i>Programas</Link></li>
                )}
                {hasPermission('acceso_profesores') && (
                  <li><Link to="/profesores" className="sidebar-link"><i className="fas fa-chalkboard me-2"></i>Profesores</Link></li>
                )}
                {hasPermission('acceso_estudiante_grupo') && (
                  <li><Link to="/asignacion-estudiantes" className="sidebar-link"><i className="fas fa-user-plus me-2"></i>Asignación Estudiantes</Link></li>
                )}
                {hasPermission('acceso_salones') && (
                  <li><Link to="/salones" className="sidebar-link"><i className="fas fa-door-open me-2"></i>Salones</Link></li>
                )}
              </ul>
            )}
          </li>
        )}
      </ul>
    </div>
  );
}

export default Sidebar;
