
import React, { useState } from 'react';
import { FileText, Image, Music, Video, Archive, Code } from 'lucide-react';

interface FormatSelectorProps {
  onFormatSelect: (from: string, to: string) => void;
}

const FormatSelector = ({ onFormatSelect }: FormatSelectorProps) => {
  const [fromFormat, setFromFormat] = useState('');
  const [toFormat, setToFormat] = useState('');

  const formatCategories = [
    {
      name: 'Documents',
      icon: FileText,
      formats: ['PDF', 'DOCX', 'TXT', 'RTF', 'ODT', 'PAGES'],
      color: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      name: 'Images',
      icon: Image,
      formats: ['JPG', 'PNG', 'GIF', 'BMP', 'TIFF', 'WEBP', 'SVG'],
      color: 'from-green-100 to-green-200',
      iconColor: 'text-green-600'
    },
    {
      name: 'Audio',
      icon: Music,
      formats: ['MP3', 'WAV', 'FLAC', 'AAC', 'OGG', 'M4A'],
      color: 'from-purple-100 to-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      name: 'Video',
      icon: Video,
      formats: ['MP4', 'AVI', 'MOV', 'WMV', 'FLV', 'MKV'],
      color: 'from-red-100 to-red-200',
      iconColor: 'text-red-600'
    },
    {
      name: 'Archives',
      icon: Archive,
      formats: ['ZIP', 'RAR', '7Z', 'TAR', 'GZ'],
      color: 'from-yellow-100 to-yellow-200',
      iconColor: 'text-yellow-600'
    },
    {
      name: 'Code',
      icon: Code,
      formats: ['HTML', 'CSS', 'JS', 'JSON', 'XML', 'CSV'],
      color: 'from-indigo-100 to-indigo-200',
      iconColor: 'text-indigo-600'
    }
  ];

  const handleConvert = () => {
    if (fromFormat && toFormat) {
      onFormatSelect(fromFormat, toFormat);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
        Choose Conversion Format
      </h3>

      {/* Format Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {formatCategories.map((category) => (
          <div
            key={category.name}
            className={`p-4 rounded-lg bg-gradient-to-br ${category.color} border border-gray-200 hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-white rounded-lg">
                <category.icon className={`h-5 w-5 ${category.iconColor}`} />
              </div>
              <h4 className="font-medium text-gray-900">{category.name}</h4>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {category.formats.map((format) => (
                <button
                  key={format}
                  onClick={() => setFromFormat(format)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                    fromFormat === format
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'bg-white/50 text-gray-700 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Conversion Selector */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <select
              value={fromFormat}
              onChange={(e) => setFromFormat(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select format</option>
              {formatCategories.flatMap(cat => 
                cat.formats.map(format => (
                  <option key={format} value={format}>{format}</option>
                ))
              )}
            </select>
          </div>

          <div className="pt-6">
            <div className="w-8 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400"></div>
            <div className="text-center text-gray-500 text-sm mt-1">to</div>
          </div>

          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <select
              value={toFormat}
              onChange={(e) => setToFormat(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select format</option>
              {formatCategories.flatMap(cat => 
                cat.formats.map(format => (
                  <option key={format} value={format}>{format}</option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleConvert}
            disabled={!fromFormat || !toFormat}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
          >
            Start Conversion
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormatSelector;
