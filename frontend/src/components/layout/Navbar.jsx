import { useContext } from 'react';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-8">
      <button 
        onClick={toggleSidebar}
        className="p-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 focus:outline-none"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Spacer for mobile alignment */}
      <div className="flex-1 lg:hidden"></div>

      <div className="flex items-center space-x-4 ml-auto">
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-sm font-medium text-gray-900">{user?.name}</span>
          <span className="text-xs text-gray-500">{user?.role}</span>
        </div>
        
        <div className="p-2 bg-blue-100 rounded-full">
          <UserIcon className="w-5 h-5 text-blue-600" />
        </div>

        <button 
          onClick={logout}
          className="flex items-center p-2 text-gray-500 transition-colors rounded-md hover:bg-red-50 hover:text-red-600"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};