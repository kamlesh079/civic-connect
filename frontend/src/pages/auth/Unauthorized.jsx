import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const goDashboard = () => {
    if (user?.role === 'Admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (user?.role === 'Officer') {
      navigate('/officer/dashboard', { replace: true });
    } else {
      navigate('/citizen/dashboard', { replace: true });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-red-50 p-4 rounded-full mb-6">
        <AlertTriangle className="w-12 h-12 text-red-500" />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Access Denied
      </h1>

      <p className="text-gray-600 max-w-md mb-8">
        You do not have permission to access this page.
      </p>

      <button
        onClick={goDashboard}
        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  );
};