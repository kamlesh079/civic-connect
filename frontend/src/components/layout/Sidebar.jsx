import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, FileText, PlusCircle, 
  Users, Layers, CheckSquare 
} from 'lucide-react';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useContext(AuthContext);

  // Dynamic links based on role
  const getLinks = () => {
    if (!user) return [];
    if (user.role === 'Citizen') {
      return [
        { name: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
        { name: 'Report Issue', path: '/citizen/report', icon: PlusCircle },
        { name: 'My Issues', path: '/citizen/issues', icon: FileText },
      ];
    }
    if (user.role === 'Officer') {
      return [
        { name: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
        { name: 'Assigned Issues', path: '/officer/issues', icon: CheckSquare },
      ];
    }
    if (user.role === 'Admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'All Issues', path: '/admin/issues', icon: FileText },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Categories', path: '/admin/categories', icon: Layers },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <span className="text-2xl font-bold text-blue-600">CivicConnect</span>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <link.icon className="w-5 h-5 mr-3" />
              {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};