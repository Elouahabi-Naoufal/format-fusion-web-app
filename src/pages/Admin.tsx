
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { api } from '../lib/api';
import { 
  Settings, 
  FileText, 
  BarChart3, 
  Users, 
  Upload,
  PenTool,
  Globe,
  Database,
  LogOut
} from 'lucide-react';

const Admin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminHome = location.pathname === '/admin';

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: BarChart3,
      description: 'View analytics and statistics'
    },
    {
      name: 'Blog Posts',
      path: '/admin/blog',
      icon: FileText,
      description: 'Manage blog articles'
    },
    {
      name: 'Page Content',
      path: '/admin/content',
      icon: Globe,
      description: 'Edit website content'
    },
    {
      name: 'Files',
      path: '/admin/files',
      icon: Database,
      description: 'View uploaded files and history'
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: Users,
      description: 'User management'
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: Settings,
      description: 'System configuration'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const [stats, setStats] = useState([
    {
      title: 'Total Conversions',
      value: '0',
      change: '+0%',
      positive: true,
      icon: Upload
    },
    {
      title: 'Active Users',
      value: '0',
      change: '+0%',
      positive: true,
      icon: Users
    },
    {
      title: 'Blog Posts',
      value: '0',
      change: '+0',
      positive: true,
      icon: FileText
    },
    {
      title: 'Success Rate',
      value: '0%',
      change: '+0%',
      positive: true,
      icon: BarChart3
    }
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.getDashboardStats();
        setStats([
          {
            title: 'Total Conversions',
            value: response.totalFiles?.toString() || '0',
            change: '+12%',
            positive: true,
            icon: Upload
          },
          {
            title: 'Active Users',
            value: '2,856',
            change: '+8%',
            positive: true,
            icon: Users
          },
          {
            title: 'Blog Posts',
            value: '24',
            change: '+3',
            positive: true,
            icon: FileText
          },
          {
            title: 'Success Rate',
            value: `${response.successRate || 0}%`,
            change: '+0.2%',
            positive: true,
            icon: BarChart3
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Professional Sidebar */}
        <div className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">FormatFusion</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${
                    isActive(item.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <p className={`text-xs mt-0.5 ${
                      isActive(item.path) ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Admin;
