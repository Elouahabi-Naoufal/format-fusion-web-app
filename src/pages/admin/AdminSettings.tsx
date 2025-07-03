import React, { useState, useEffect } from 'react';
import { Save, Settings, Shield, Database, Globe, Bell, Users, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/use-toast';

const AdminSettings = () => {
  const { isDark } = useTheme('admin-theme');
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    maxFileSize: '100',
    allowedFileTypes: 'PDF,DOCX,JPG,PNG,MP4,MP3,WAV,FLAC',
    imageQuality: '95',
    audioBitrate: '192',
    enableNotifications: true,
    autoDeleteFiles: true,
    maintenanceMode: false,
    maxConcurrentConversions: '10'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.getAdminSettings();
      setSettings(prev => ({ ...prev, ...response.settings }));
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateAdminSettings(settings);
      toast({
        title: "Settings Updated",
        description: "System settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const settingSections = [
    {
      title: 'File Processing',
      icon: FileText,
      settings: [
        { key: 'maxFileSize', label: 'Max File Size (MB)', type: 'number' },
        { key: 'allowedFileTypes', label: 'Allowed File Types', type: 'text' },
        { key: 'maxConcurrentConversions', label: 'Max Concurrent Conversions', type: 'number' }
      ]
    },
    {
      title: 'Quality Settings',
      icon: Settings,
      settings: [
        { key: 'imageQuality', label: 'Image Quality (%)', type: 'number' },
        { key: 'audioBitrate', label: 'Audio Bitrate (kbps)', type: 'number' }
      ]
    },
    {
      title: 'System Settings',
      icon: Database,
      settings: [
        { key: 'enableNotifications', label: 'Enable Notifications', type: 'boolean' },
        { key: 'autoDeleteFiles', label: 'Auto Delete Files (24h)', type: 'boolean' },
        { key: 'maintenanceMode', label: 'Maintenance Mode', type: 'boolean' }
      ]
    }
  ];

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>System Settings</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Configure system parameters and preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-6">
          {settingSections.map((section) => (
            <div key={section.title} className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <section.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{section.title}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.settings.map((setting) => (
                  <div key={setting.key}>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {setting.label}
                    </label>
                    {setting.type === 'boolean' ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings[setting.key]}
                          onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {settings[setting.key] ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ) : (
                      <input
                        type={setting.type}
                        value={settings[setting.key]}
                        onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Shield className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Security Notice</h3>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
              Changes to these settings will affect all users and file processing operations. 
              Please review carefully before saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;