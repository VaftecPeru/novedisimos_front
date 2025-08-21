import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';

const ProtectedRoute = ({ children }) => {
  const { usuario } = useUser();
  const location = useLocation();

  if (!usuario) {
    console.log('Usuario no autenticado, redirigiendo al login desde:', location.pathname);
    
    localStorage.setItem('redirectAfterLogin', location.pathname);
    
    return <Navigate to="/" replace />;
  }

  console.log('Usuario autenticado:', usuario);
  return children;
};

export default ProtectedRoute;