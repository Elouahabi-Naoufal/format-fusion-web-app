
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileText, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Header = () => {
  const { isDark, toggleTheme } = useTheme('web-theme');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
  ];

  return (
    <header className={`backdrop-blur-md border-b sticky top-0 z-50 ${
      isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg group-hover:scale-105 transition-transform duration-200">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className={`text-xl font-bold ${
              isDark ? 'text-white' : 'bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'
            }`}>
              FormatFusion
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? isDark
                      ? 'bg-purple-900/50 text-purple-300'
                      : 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700'
                    : isDark
                      ? 'text-gray-300 hover:text-purple-400 hover:bg-gray-800'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md transition-colors duration-200 ${
                isDark ? 'text-gray-300 hover:text-purple-400 hover:bg-gray-800' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden py-4 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? isDark
                        ? 'bg-purple-900/50 text-purple-300'
                        : 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700'
                      : isDark
                        ? 'text-gray-300 hover:text-purple-400 hover:bg-gray-800'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-2 border-t border-gray-200 mt-2">
                <button
                  onClick={toggleTheme}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md w-full transition-colors ${
                    isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
