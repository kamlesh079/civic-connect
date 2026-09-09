import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Spinner } from '../ui/Spinner';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div className="h-screen flex"><Spinner size={40} className="m-auto" /></div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};