import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner, Alert } from 'react-bootstrap';

const ProtectedRoute = ({ 
  children, 
  requiredPermission = null, 
  requiredRole = null, 
  requiredRoles = null,
  fallbackPath = '/dashboard'
}) => {
  const { user, loading, hasPermission, hasRole, hasAnyRole, isAuthenticated } = useAuth();

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Verificar permisos específicos
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">
          <Alert.Heading>Acceso Denegado</Alert.Heading>
          <p>No tienes permisos para acceder a esta sección.</p>
          <p>Permiso requerido: <strong>{requiredPermission}</strong></p>
        </Alert>
      </div>
    );
  }

  // Verificar rol específico
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">
          <Alert.Heading>Acceso Denegado</Alert.Heading>
          <p>No tienes el rol necesario para acceder a esta sección.</p>
          <p>Rol requerido: <strong>{requiredRole}</strong></p>
        </Alert>
      </div>
    );
  }

  // Verificar múltiples roles
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">
          <Alert.Heading>Acceso Denegado</Alert.Heading>
          <p>No tienes ninguno de los roles necesarios para acceder a esta sección.</p>
          <p>Roles requeridos: <strong>{requiredRoles.join(', ')}</strong></p>
        </Alert>
      </div>
    );
  }

  // Si pasa todas las verificaciones, mostrar el contenido
  return children;
};

export default ProtectedRoute;