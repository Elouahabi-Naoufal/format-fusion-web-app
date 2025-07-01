import React, { useState, useEffect } from 'react';
import { Save, Settings, AlertCircle } from 'lucide-react';
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

      {/* Settings Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              File Settings
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum File Size (MB)
              </label>
              <input
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
                max="1000"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum size for uploaded files</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed File Types
              </label>
              <textarea
                value={settings.allowedFileTypes}
                onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="PDF,DOCX,JPG,PNG,MP4,MP3"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of allowed file extensions</p>
            </div>
          </div>

          {/* Conversion Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Conversion Settings
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Quality (%)
              </label>
              <input
                type="number"
                value={settings.imageQuality}
                onChange={(e) => setSettings({ ...settings, imageQuality: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">Quality for image conversions (1-100)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio Bitrate (kbps)
              </label>
              <input
                type="number"
                value={settings.audioBitrate}
                onChange={(e) => setSettings({ ...settings, audioBitrate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="64"
                max="320"
              />
              <p className="text-xs text-gray-500 mt-1">Bitrate for audio conversions</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
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