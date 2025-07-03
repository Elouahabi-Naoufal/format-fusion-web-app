import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, FileText, Upload, Activity, Zap, Globe, Shield, Clock, ArrowUpRight, BarChart3, DollarSign } from 'lucide-react';
import { api } from '../../lib/api';
import { useTheme } from '../../hooks/useTheme';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalFiles: 12847,
    activeUsers: 3256,
    revenue: 45280,
    successRate: 98.7,
    todayConversions: 234,
    weeklyGrowth: 15.3,
    storageUsed: 78.4,
    avgProcessingTime: 2.1
  });

  const [activities, setActivities] = useState([
    { id: 1, type: 'conversion', message: 'PDF to DOCX conversion completed', user: 'Sarah Chen', time: '2m ago', status: 'success' },
    { id: 2, type: 'user', message: 'New premium user registered', user: 'System', time: '5m ago', status: 'info' },
    { id: 3, type: 'revenue', message: 'Payment received $29.99', user: 'John Doe', time: '8m ago', status: 'success' },
    { id: 4, type: 'system', message: 'Server maintenance completed', user: 'Admin', time: '15m ago', status: 'warning' },
    { id: 5, type: 'error', message: 'Conversion failed - file corrupted', user: 'Mike Johnson', time: '22m ago', status: 'error' }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getDashboardStats();
        setStats(prev => ({ ...prev, ...response }));
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ title, value, change, icon: Icon, trend, color, prefix = '', suffix = '', isDark }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-sm border hover:shadow-lg transition-all duration-300 group ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 rounded-full -mr-16 -mt-16 group-hover:opacity-10 transition-opacity`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          <div className={`flex items-center text-sm font-medium ${
            trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <ArrowUpRight className={`h-4 w-4 mr-1 ${trend === 'down' ? 'rotate-90' : ''}`} />
            {change}
          </div>
        </div>
        <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
        <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{title}</div>
      </div>
    </div>
  );

  const ActivityIcon = ({ type }) => {
    const icons = {
      conversion: Upload,
      user: Users,
      revenue: DollarSign,
      system: Shield,
      error: Zap
    };
    const Icon = icons[type] || Activity;
    return <Icon className="h-4 w-4" />;
  };

  const { isDark } = useTheme('admin-theme');

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className={`font-medium text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>All Systems Operational</span>
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Conversions"
            value={stats.totalFiles}
            change="+12.5%"
            icon={Upload}
            trend="up"
            color="bg-blue-500"
            isDark={isDark}
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            change="+8.3%"
            icon={Users}
            trend="up"
            color="bg-emerald-500"
            isDark={isDark}
          />
          <StatCard
            title="Monthly Revenue"
            value={stats.revenue}
            change="+23.1%"
            icon={DollarSign}
            trend="up"
            color="bg-purple-500"
            prefix="$"
            isDark={isDark}
          />
          <StatCard
            title="Success Rate"
            value={stats.successRate}
            change="+0.4%"
            icon={BarChart3}
            trend="up"
            color="bg-orange-500"
            suffix="%"
            isDark={isDark}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <div className={`lg:col-span-2 rounded-2xl p-6 shadow-sm border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Performance Overview</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Conversion trends over time</p>
              </div>
              <div className="flex space-x-2">
                {['7D', '30D', '90D'].map((period, i) => (
                  <button key={period} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    i === 0 ? 'bg-blue-500 text-white shadow-sm' : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Chart Area */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Daily Conversions</span>
                </div>
                <span className="text-blue-600 font-semibold">+15.3% vs last week</span>
              </div>
              
              <div className="h-64 flex items-end justify-between space-x-2">
                {[45, 52, 48, 61, 58, 67, 73, 69, 78, 85, 92, 98, 87, 94].map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all duration-300 cursor-pointer"
                      style={{ height: `${(value / 100) * 200}px` }}
                      title={`${value} conversions`}
                    />
                    <span className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className={`rounded-2xl p-6 shadow-sm border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Live Activity</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Real-time system events</p>
              </div>
              <Activity className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className={`flex items-start space-x-3 p-3 rounded-xl transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'success' ? 'bg-emerald-100 text-emerald-600' :
                    activity.status === 'error' ? 'bg-red-100 text-red-600' :
                    activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <ActivityIcon type={activity.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.message}</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className={`w-full mt-4 font-medium text-sm py-2 rounded-lg transition-colors ${
              isDark ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
            }`}>
              View All Activity →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-2xl p-6 shadow-sm border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: 'Create Blog Post', desc: 'Write new content', color: 'bg-blue-500' },
              { icon: Upload, label: 'Bulk Convert', desc: 'Process multiple files', color: 'bg-emerald-500' },
              { icon: Users, label: 'User Management', desc: 'Manage user accounts', color: 'bg-purple-500' },
              { icon: BarChart3, label: 'Analytics Report', desc: 'Generate insights', color: 'bg-orange-500' }
            ].map((action, i) => (
              <button key={i} className={`group text-left p-4 rounded-xl border hover:shadow-md transition-all duration-300 ${
                isDark ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className={`inline-flex p-3 rounded-lg ${action.color} bg-opacity-10 mb-3 group-hover:bg-opacity-20 transition-colors`}>
                  <action.icon className={`h-6 w-6 ${action.color.replace('bg-', 'text-')}`} />
                </div>
                <div className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{action.label}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{action.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;