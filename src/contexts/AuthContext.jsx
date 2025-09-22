import React, { createContext, useContext, useState, useEffect } from 'react';
import { obtenerDetalleUsuario } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Decodificar el token para obtener el ID del usuario
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.id || payload.userId;
          
          if (userId) {
            const response = await obtenerDetalleUsuario(userId, token);
            if (response.ok) {
              const userData = response.data;
              setUser(userData);
              setRole(userData.rol);
              setPermissions(userData.rol?.permisos_asociados || []);
            }
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          // Si hay error, limpiar el token inválido
          localStorage.removeItem('token');
          localStorage.removeItem('nombre');
          localStorage.removeItem('apellido');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('nombre', userData.nombre);
    localStorage.setItem('apellido', userData.apellido);
    setUser(userData);
    setRole(userData.rol);
    setPermissions(userData.rol?.permisos_asociados || []);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('apellido');
    setUser(null);
    setRole(null);
    setPermissions([]);
  };

  const hasPermission = (permissionName) => {
    return permissions.some(permission => permission.nombre === permissionName);
  };

  const hasRole = (roleName) => {
    return role?.nombre === roleName;
  };

  const hasAnyRole = (roleNames) => {
    return roleNames.includes(role?.nombre);
  };

  const value = {
    user,
    role,
    permissions,
    loading,
    login,
    logout,
    hasPermission,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;