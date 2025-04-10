import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { ROLES } from '../utils/constants';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isNgo = user?.role === ROLES.NGO;

  // Navigation links based on user role
  const navLinks = isNgo
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: '📊' },
        { to: '/positions/create', label: 'Create Position', icon: '➕' },
        { to: '/positions', label: 'My Positions', icon: '📋' },
        { to: '/applications', label: 'Applications', icon: '📬' },
        { to: '/profile', label: 'Profile', icon: '👤' },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard', icon: '📊' },
        { to: '/positions', label: 'Find Positions', icon: '🔍' },
        { to: '/applications', label: 'My Applications', icon: '📬' },
        { to: '/profile', label: 'Profile', icon: '👤' },
      ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-teal-600 text-white shadow-md z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button 
              className="mr-4 md:hidden"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/dashboard" className="text-2xl font-bold">YuvaSetu</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden md:inline-block">
              Welcome, {user?.name}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white text-white hover:bg-teal-700"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside 
          className={`bg-slate-800 text-white w-64 fixed md:static inset-y-0 left-0 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } transition-transform duration-300 ease-in-out md:translate-x-0 z-10 shadow-lg md:shadow-none`}
        >
          {/* User info */}
          <div className="p-4 border-b border-slate-700">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-slate-400 capitalize">{user?.role}</p>
          </div>
          
          {/* Navigation */}
          <nav className="p-4">
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="flex items-center py-2 px-4 rounded-md hover:bg-slate-700 transition-colors"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <span className="mr-3">{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout; 