import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Mail, Calendar, Crown, Shield } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const AdminUsers = () => {
  const { isDark } = useTheme('admin-theme');
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', type: 'free', joinDate: '2024-01-15', conversions: 15, status: 'active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', type: 'premium', joinDate: '2024-01-10', conversions: 245, status: 'active' },
    { id: 3, name: 'Mike Chen', email: 'mike@example.com', type: 'pro', joinDate: '2024-01-05', conversions: 1250, status: 'active' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || user.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>User Management</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Manage user accounts and subscriptions</p>
          </div>
        </div>

        <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-3 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                }`}
              >
                <option value="all">All Users</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="pro">Pro</option>
              </select>
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <table className="w-full">
            <thead className={`border-b ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>User</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>Type</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>Conversions</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>Join Date</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{user.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.type === 'pro' ? 'bg-purple-100 text-purple-800' :
                      user.type === 'premium' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.type === 'pro' && <Crown className="h-3 w-3 mr-1" />}
                      {user.type === 'premium' && <Shield className="h-3 w-3 mr-1" />}
                      {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{user.conversions}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(user.joinDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;