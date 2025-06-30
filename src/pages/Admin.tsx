
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  Settings, 
  FileText, 
  BarChart3, 
  Users, 
  Upload,
  PenTool,
  Globe,
  Database
} from 'lucide-react';

const Admin = () => {
  const location = useLocation();
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

  // Mock stats data
  const stats = [
    {
      title: 'Total Conversions',
      value: '12,345',
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
      value: '98.5%',
      change: '+0.2%',
      positive: true,
      icon: BarChart3
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-600">Manage your file conversion platform</p>
          </div>

          {isAdminHome ? (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                        <stat.icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <span className={`text-sm font-medium ${
                        stat.positive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-gray-600 text-sm">{stat.title}</p>
                  </div>
                ))}
              </div>

              {/* Admin Menu Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.slice(1).map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="group bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                        <item.icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    {
                      action: 'New blog post published',
                      details: '"Complete Guide to PDF Conversion"',
                      time: '2 hours ago',
                      type: 'blog'
                    },
                    {
                      action: 'File conversion completed',
                      details: 'document.pdf → document.docx',
                      time: '3 hours ago',
                      type: 'conversion'
                    },
                    {
                      action: 'User registered',
                      details: 'sarah.johnson@email.com',
                      time: '5 hours ago',
                      type: 'user'
                    },
                    {
                      action: 'System maintenance',
                      details: 'Server optimization completed',
                      time: '1 day ago',
                      type: 'system'
                    }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'blog' ? 'bg-blue-500' :
                        activity.type === 'conversion' ? 'bg-green-500' :
                        activity.type === 'user' ? 'bg-purple-500' : 'bg-orange-500'
                      }`}></div>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Render child routes
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
              </div>

              {/* Main Content */}
              <div className="flex-grow">
                <Outlet />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
