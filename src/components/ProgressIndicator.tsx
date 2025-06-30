
import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ConversionProgress {
  id: string;
  fileName: string;
  fromFormat: string;
  toFormat: string;
  progress: number;
  status: 'pending' | 'converting' | 'completed' | 'error';
  fileSize: string;
}

interface ProgressIndicatorProps {
  conversions: ConversionProgress[];
}

const ProgressIndicator = ({ conversions }: ProgressIndicatorProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'converting':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (conversions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Conversion Progress
      </h3>

      <div className="space-y-4">
        {conversions.map((conversion) => (
          <div
            key={conversion.id}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getStatusIcon(conversion.status)}
                <div>
                  <p className="font-medium text-gray-900 truncate max-w-xs">
                    {conversion.fileName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {conversion.fromFormat} → {conversion.toFormat} • {conversion.fileSize}
                  </p>
                </div>
              </div>
              
              <span className={`text-sm font-medium ${getStatusColor(conversion.status)} capitalize`}>
                {conversion.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(conversion.status)}`}
                style={{ width: `${conversion.progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {conversion.progress}% complete
              </span>
              
              {conversion.status === 'completed' && (
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Download
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Progress Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {conversions.filter(c => c.status === 'completed').length} of {conversions.length} completed
          </span>
          <span>
            {conversions.filter(c => c.status === 'error').length > 0 && 
              `${conversions.filter(c => c.status === 'error').length} failed`
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
