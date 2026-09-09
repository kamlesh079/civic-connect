import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Spinner } from '../../components/ui/Spinner';
import { Mail, Lock } from 'lucide-react';

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle role-based redirect after successful login
  useEffect(() => {
  if (!user) return;

  const from = location.state?.from?.pathname;

  const citizenRoutes = ['/citizen'];
  const officerRoutes = ['/officer'];
  const adminRoutes = ['/admin'];

  const canAccessFrom =
    (user.role === 'Citizen' &&
      citizenRoutes.some((route) => from?.startsWith(route))) ||
    (user.role === 'Officer' &&
      officerRoutes.some((route) => from?.startsWith(route))) ||
    (user.role === 'Admin' &&
      (adminRoutes.some((route) => from?.startsWith(route)) ||
        citizenRoutes.some((route) => from?.startsWith(route)) ||
        officerRoutes.some((route) => from?.startsWith(route))));

  if (from && canAccessFrom) {
    navigate(from, { replace: true });
    return;
  }

  if (user.role === 'Admin') {
    navigate('/admin/dashboard', { replace: true });
  } else if (user.role === 'Officer') {
    navigate('/officer/dashboard', { replace: true });
  } else {
    navigate('/citizen/dashboard', { replace: true });
  }
}, [user, navigate, location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">CivicConnect</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                required
                className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                required
                className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? <Spinner size={20} className="text-white" /> : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};