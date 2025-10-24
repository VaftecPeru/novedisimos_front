// src/RoleProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { usuario, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Cargando...
      </div>
    );
  }

  // Si no está autenticado
  if (!usuario) {
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/" replace />;
  }

  // Si el rol NO está permitido
  if (!allowedRoles.includes(usuario.rol)) {
    console.log(`❌ Rol '${usuario.rol}' no tiene acceso a esta ruta`);
    
    // Redirigir a dashboard por defecto del rol
    const defaultRoutes = {
      'Administrador': '/dashboard/ordenDePedido',
      'Vendedor': '/dashboard/ordenDePedido',
      'Almacen': '/dashboard/almacenes',
      'Delivery': '/dashboard/motorizados'
    };
    
    const redirectTo = defaultRoutes[usuario.rol] || '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleProtectedRoute;