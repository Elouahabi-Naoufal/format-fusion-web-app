
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">File Management</h2>
        <p className="text-gray-600">View and manage uploaded files and conversion history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalFiles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedFiles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Download className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Downloads</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalDownloads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search files or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-xs">{file.fileName}</p>
                      <p className="text-sm text-gray-500">{file.fileSize}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{file.originalFormat}</span>
                      <span className="text-gray-500 mx-2">→</span>
                      <span className="font-medium text-gray-900">{file.convertedFormat}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{file.userEmail}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(file.status)}`}>
                      {file.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(file.uploadDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{file.downloadCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {file.status === 'completed' && (
                        <button
                          onClick={() => handleDownload(file.id, file.fileName)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
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

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-500">No files match your current filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFiles;
