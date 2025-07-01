
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
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
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-600">Manage your file conversion platform</p>
          </div>

          <div className="flex space-x-8">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-fit">
              <nav className="space-y-2">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>
              
              {/* Logout Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
