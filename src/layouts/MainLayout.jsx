import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const MainLayout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-teal-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">YuvaSetu</Link>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm hidden md:inline-block">
                  Welcome, {user.name}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-white text-white hover:bg-teal-700"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="border-white text-white hover:bg-teal-700">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="secondary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">YuvaSetu</h3>
              <p className="text-slate-300 text-sm">
                Connecting NGOs and Volunteers for a better tomorrow.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-700 text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} YuvaSetu. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 