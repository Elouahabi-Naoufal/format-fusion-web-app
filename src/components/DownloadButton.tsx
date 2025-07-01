import React from 'react';
import { Download } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../hooks/use-toast';

interface DownloadButtonProps {
  fileId: string;
  fileName: string;
  status: string;
}

const DownloadButton = ({ fileId, fileName, status }: DownloadButtonProps) => {
  const { toast } = useToast();

  const handleDownload = async () => {
    if (status !== 'completed') {
      toast({
        title: "Download Not Ready",
        description: "File conversion is still in progress.",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = await api.downloadFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: `Converted file is being downloaded.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download file.",
        variant: "destructive",
      });
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={status !== 'completed'}
      className={`inline-flex items-center px-3 py-1 text-sm rounded-lg font-medium transition-all duration-200 ${
        status === 'completed'
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      <Download className="h-3 w-3 mr-1" />
      Download
    </button>
  );
};

export default DownloadButton;