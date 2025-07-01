import React from 'react';
import { BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Overview of your file conversion platform</p>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Welcome to Admin Dashboard</h3>
        </div>
        <p className="text-gray-700">
          Use the navigation menu to manage different aspects of your platform:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          <li>• <strong>Blog Posts:</strong> Create and manage blog content</li>
          <li>• <strong>Files:</strong> View and manage uploaded files</li>
          <li>• <strong>Page Content:</strong> Edit website content</li>
          <li>• <strong>Settings:</strong> Configure system settings</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;