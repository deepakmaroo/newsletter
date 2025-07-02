import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Mail className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">Newsletter</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/subscribe" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Subscribe
            </Link>
            <Link 
              to="/admin" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Admin
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/subscribe" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Subscribe
              </Link>
              <Link 
                to="/admin" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
