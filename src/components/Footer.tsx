
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Mail, Shield, Cookie, FileCheck } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Footer = () => {
  const { isDark } = useTheme('web-theme');
  const footerLinks = [
    { name: 'Terms of Service', path: '/terms', icon: FileCheck },
    { name: 'Privacy Policy', path: '/privacy', icon: Shield },
    { name: 'Cookies Policy', path: '/cookies', icon: Cookie },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  return (
    <footer className={`text-white ${
      isDark ? 'bg-gradient-to-r from-black to-gray-900' : 'bg-gradient-to-r from-gray-900 to-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">FormatFusion</span>
            </div>
            <p className={`text-sm leading-relaxed ${
              isDark ? 'text-gray-400' : 'text-gray-300'
            }`}>
              Convert your files effortlessly with our powerful, secure, and fast file conversion platform.
              Supporting hundreds of formats with professional-grade quality.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal & Support</h3>
            <div className="space-y-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-2 hover:text-white transition-colors duration-200 group ${
                    isDark ? 'text-gray-400' : 'text-gray-300'
                  }`}
                >
                  <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm">{link.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Features</h3>
            <ul className={`space-y-2 text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-300'
            }`}>
              <li>• Fast & Secure Conversion</li>
              <li>• 200+ File Formats</li>
              <li>• Batch Processing</li>
              <li>• Cloud Storage Integration</li>
              <li>• API Access</li>
            </ul>
          </div>
        </div>

        <div className={`border-t mt-8 pt-8 text-center ${
          isDark ? 'border-gray-800' : 'border-gray-700'
        }`}>
          <p className={`text-sm ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            © 2024 FormatFusion. All rights reserved. Built with ❤️ for seamless file conversion.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
