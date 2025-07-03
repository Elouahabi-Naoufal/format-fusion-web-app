
import React, { useState, useEffect } from 'react';
import { Download, Trash2, Eye, Calendar, FileText, Filter } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';

interface FileRecord {
  id: string;
  fileName: string;
  originalFormat: string;
  convertedFormat: string;
  fileSize: string;
  uploadDate: string;
  status: 'completed' | 'processing' | 'failed';
  downloadCount: number;
  userEmail?: string;
}

const AdminFiles = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFiles: 0,
    completedFiles: 0,
    totalDownloads: 0,
    successRate: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, [filterStatus, searchTerm]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminFiles(1, 50, filterStatus === 'all' ? undefined : filterStatus, searchTerm || undefined);
      setFiles(response.files);
    } catch (error) {
      console.error('Error fetching files:', error);
      // Fallback to mock data
      const mockFiles: FileRecord[] = [
        {
          id: '1',
          fileName: 'Annual_Report_2023.pdf',
          originalFormat: 'PDF',
          convertedFormat: 'DOCX',
          fileSize: '2.4 MB',
          uploadDate: '2024-01-15T10:30:00',
          status: 'completed',
          downloadCount: 3,
          userEmail: 'john.doe@email.com'
        },
        {
          id: '2', 
          fileName: 'product_image.jpg',
          originalFormat: 'JPG',
          convertedFormat: 'PNG',
          fileSize: '856 KB',
          uploadDate: '2024-01-15T09:15:00',
          status: 'completed',
          downloadCount: 1,
          userEmail: 'sarah.smith@email.com'
        },
        {
          id: '3',
          fileName: 'presentation.pptx',
          originalFormat: 'PPTX',
          convertedFormat: 'PDF',
          fileSize: '4.2 MB',
          uploadDate: '2024-01-14T16:45:00',
          status: 'processing',
          downloadCount: 0,
          userEmail: 'mike.johnson@email.com'
        },
        {
          id: '4',
          fileName: 'audio_track.wav',
          originalFormat: 'WAV',
          convertedFormat: 'MP3',
          fileSize: '12.8 MB',
          uploadDate: '2024-01-14T14:20:00',
          status: 'completed',
          downloadCount: 5,
          userEmail: 'alex.rivera@email.com'
        },
        {
          id: '5',
          fileName: 'data_export.csv',
          originalFormat: 'CSV',
          convertedFormat: 'XLSX',
          fileSize: '234 KB',
          uploadDate: '2024-01-13T11:10:00',
          status: 'failed',
          downloadCount: 0,
          userEmail: 'lisa.chen@email.com'
        },
        {
          id: '6',
          fileName: 'video_demo.mov',
          originalFormat: 'MOV',
          convertedFormat: 'MP4',
          fileSize: '45.6 MB',
          uploadDate: '2024-01-13T09:30:00',
          status: 'completed',
          downloadCount: 12,
          userEmail: 'david.kim@email.com'
        }
      ];
      setFiles(mockFiles);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getFileStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
    const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDelete = async (fileId: string) => {
    if (confirm('Are you sure you want to delete this file record?')) {
      try {
        await api.deleteFile(fileId);
        setFiles(files.filter(file => file.id !== fileId));
        toast({
          title: "File Deleted",
          description: "File record has been deleted successfully.",
        });
        fetchStats(); // Refresh stats
      } catch (error) {
        console.error('Error deleting file:', error);
        toast({
          title: "Delete Failed",
          description: "Failed to delete file record.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const blob = await api.downloadFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download file.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  return (
    <div className="space-y-8">
      {/* Cyber Header */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-2xl" />
        <div className="relative">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">File Matrix</h2>
          <p className="text-gray-400 mt-1">Advanced file management and analytics</p>
        </div>
      </div>

      {/* Neon Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: 'Total Files', value: stats.totalFiles, change: '+12%', icon: FileText, color: 'from-cyan-500 to-blue-500' },
          { title: 'Completed', value: stats.completedFiles, change: '94.2%', icon: FileText, color: 'from-green-500 to-emerald-500' },
          { title: 'Downloads', value: stats.totalDownloads, change: '+8%', icon: Download, color: 'from-purple-500 to-pink-500' },
          { title: 'Success Rate', value: `${stats.successRate}%`, change: 'Above avg', icon: FileText, color: 'from-yellow-500 to-orange-500' },
          { title: 'Storage', value: `${stats.fileStorage || 2.4}GB`, change: '68% used', icon: FileText, color: 'from-orange-500 to-red-500' },
          { title: 'Processing', value: files.filter(f => f.status === 'processing').length, change: 'Live', icon: FileText, color: 'from-red-500 to-pink-500' }
        ].map((stat, i) => (
          <div key={i} className="group relative bg-gray-900 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-6 w-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                <span className="text-xs text-gray-400">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cyber Filters */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search quantum files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-cyan-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Futuristic Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                {['File', 'Conversion', 'User', 'Status', 'Date', 'Downloads', 'Actions'].map((header) => (
                  <th key={header} className="px-6 py-4 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white truncate max-w-xs">{file.fileName}</p>
                      <p className="text-sm text-gray-400">{file.fileSize}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm flex items-center">
                      <span className="text-cyan-400 font-medium">{file.originalFormat}</span>
                      <span className="text-gray-500 mx-2">→</span>
                      <span className="text-purple-400 font-medium">{file.convertedFormat}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300">{file.userEmail}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      file.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      file.status === 'processing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {file.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(file.uploadDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white font-medium">{file.downloadCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      {file.status === 'completed' && (
                        <button onClick={() => handleDownload(file.id, file.fileName)} className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors" title="Download">
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(file.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No files detected</h3>
            <p className="text-gray-400">Adjust your quantum filters to reveal hidden files.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFiles;
