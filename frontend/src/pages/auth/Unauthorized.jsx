import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
      <div className="bg-red-100 p-4 rounded-full mb-6">
        <ShieldAlert size={48} className="text-red-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-600 max-w-md mb-8">
        You do not have the required permissions to view this page. If you believe this is a mistake, please contact support.
      </p>
      <Link 
        to="/" 
        className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};