import React, { useState, useEffect } from 'react';
import { Save, Settings, AlertCircle, Upload } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';

interface AdminSettings {
  maxFileSize: string;
  allowedFileTypes: string;
  imageQuality: string;
  audioBitrate: string;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings>({
    maxFileSize: '100',
    allowedFileTypes: 'PDF,DOCX,JPG,PNG,MP4,MP3,WAV,FLAC',
    imageQuality: '95',
    audioBitrate: '192'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.getAdminSettings();
      setSettings({
        maxFileSize: response.settings.max_file_size || '100',
        allowedFileTypes: response.settings.allowed_file_types || 'PDF,DOCX,JPG,PNG,MP4,MP3,WAV,FLAC',
        imageQuality: response.settings.image_quality || '95',
        audioBitrate: response.settings.audio_bitrate || '192'
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load settings. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateAdminSettings({
        max_file_size: settings.maxFileSize,
        allowed_file_types: settings.allowedFileTypes,
        image_quality: settings.imageQuality,
        audio_bitrate: settings.audioBitrate
      });
      
      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save settings to server.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <p className="text-gray-600">Configure system-wide settings and limits</p>
      </div>

      {/* Enhanced Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Settings Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">File Settings</h3>
              <p className="text-sm text-gray-500">Configure file upload limits</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum File Size
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                  min="1"
                  max="1000"
                />
                <span className="absolute right-3 top-3 text-gray-500 text-sm">MB</span>
              </div>
              <div className="mt-2 bg-gray-100 rounded-lg p-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Current: {settings.maxFileSize}MB</span>
                  <span>Recommended: 100MB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((parseInt(settings.maxFileSize) / 1000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed File Types
              </label>
              <textarea
                value={settings.allowedFileTypes}
                onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
                placeholder="PDF,DOCX,JPG,PNG,MP4,MP3"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {settings.allowedFileTypes.split(',').map((type, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {type.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Settings Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Conversion Settings</h3>
              <p className="text-sm text-gray-500">Quality and performance options</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Quality
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={settings.imageQuality}
                  onChange={(e) => setSettings({ ...settings, imageQuality: e.target.value })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low (1%)</span>
                  <span className="font-medium text-purple-600">{settings.imageQuality}%</span>
                  <span>High (100%)</span>
                </div>
              </div>
              <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700">
                  Higher quality = larger file sizes. Recommended: 85-95%
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio Bitrate
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="64"
                  max="320"
                  step="32"
                  value={settings.audioBitrate}
                  onChange={(e) => setSettings({ ...settings, audioBitrate: e.target.value })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>64 kbps</span>
                  <span className="font-medium text-purple-600">{settings.audioBitrate} kbps</span>
                  <span>320 kbps</span>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-gray-100 rounded text-center">
                  <div className="font-medium">Low</div>
                  <div className="text-gray-500">64-128</div>
                </div>
                <div className="p-2 bg-blue-100 rounded text-center">
                  <div className="font-medium">Standard</div>
                  <div className="text-blue-600">160-192</div>
                </div>
                <div className="p-2 bg-purple-100 rounded text-center">
                  <div className="font-medium">High</div>
                  <div className="text-purple-600">256-320</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Save Changes</h3>
            <p className="text-sm text-gray-500">Apply your configuration changes</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Saving Changes...' : 'Save All Settings'}
          </button>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Changes to these settings will affect all future file conversions. 
              Existing conversions will not be affected. Some changes may require a server restart to take effect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;