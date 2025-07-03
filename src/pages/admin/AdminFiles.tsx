import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Trash2, Eye, Calendar, FileText, Database } from 'lucide-react';
import { api } from '../../lib/api';
import { useTheme } from '../../hooks/useTheme';

const AdminFiles = () => {
  const { isDark } = useTheme('admin-theme');
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await api.getAdminFiles();
      setFiles(response.files || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      setFiles([
        { id: '1', filename: 'document.pdf', status: 'completed', originalFormat: 'PDF', convertedFormat: 'DOCX', fileSize: '2.4 MB', uploadDate: '2024-01-15', downloadCount: 5 },
        { id: '2', filename: 'image.jpg', status: 'processing', originalFormat: 'JPG', convertedFormat: 'PNG', fileSize: '1.8 MB', uploadDate: '2024-01-14', downloadCount: 0 },
        { id: '3', filename: 'video.mp4', status: 'failed', originalFormat: 'MP4', convertedFormat: 'AVI', fileSize: '45.2 MB', uploadDate: '2024-01-13', downloadCount: 0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || file.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (fileId) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await api.deleteFile(fileId);
        setFiles(files.filter(file => file.id !== fileId));
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>File Management</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>View and manage uploaded files</p>
          </div>
        </div>

        <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-3 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search files..."
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                }`}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
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
                }`}>File</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>Conversion</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>Status</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>Date</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredFiles.map((file) => (
                <tr key={file.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className={`h-8 w-8 mr-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{file.filename}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{file.fileSize}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      {file.originalFormat} → {file.convertedFormat}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(file.status)}`}>
                      {file.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'text-blue-400 hover:bg-blue-900/20' : 'text-blue-600 hover:bg-blue-50'
                      }`}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'text-green-400 hover:bg-green-900/20' : 'text-green-600 hover:bg-green-50'
                      }`}>
                        <Download className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(file.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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

export default AdminFiles;