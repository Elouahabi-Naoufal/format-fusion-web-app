
import React, { useState, useEffect } from 'react';
import { Save, Edit, Globe, FileText } from 'lucide-react';

interface PageContent {
  id: string;
  page: string;
  section: string;
  title: string;
  content: string;
  lastModified: string;
}

const AdminContent = () => {
  const [contents, setContents] = useState<PageContent[]>([]);
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    // Load content from localStorage or use mock data
    const savedContent = localStorage.getItem('page_content');
    if (savedContent) {
      setContents(JSON.parse(savedContent));
    } else {
      // Initialize with mock data
      const mockContent: PageContent[] = [
        {
          id: '1',
          page: 'Home',
          section: 'Hero',
          title: 'Convert Files Effortlessly',
          content: 'Transform your files between 200+ formats with professional quality. Fast, secure, and completely free for everyone.',
          lastModified: '2024-01-15T10:30:00'
        },
        {
          id: '2',
          page: 'Home',
          section: 'Features',
          title: 'Why Choose FormatFusion?',
          content: 'Experience the most advanced file conversion platform with enterprise-grade security and blazing-fast processing speeds.',
          lastModified: '2024-01-15T10:30:00'
        },
        {
          id: '3',
          page: 'Home',
          section: 'CTA',
          title: 'Ready to Convert Your Files?',
          content: 'Join millions of users who trust FormatFusion for their file conversion needs.',
          lastModified: '2024-01-15T10:30:00'
        },
        {
          id: '4',
          page: 'About',
          section: 'Mission',
          title: 'Our Mission',
          content: 'We are dedicated to making file conversion simple, fast, and accessible to everyone. Our platform supports over 200 file formats and processes millions of conversions daily.',
          lastModified: '2024-01-14T15:20:00'
        },
        {
          id: '5',
          page: 'Footer',
          section: 'Description',
          title: 'Company Description',
          content: 'Convert your files effortlessly with our powerful, secure, and fast file conversion platform. Supporting hundreds of formats with professional-grade quality.',
          lastModified: '2024-01-14T15:20:00'
        }
      ];
      setContents(mockContent);
      localStorage.setItem('page_content', JSON.stringify(mockContent));
    }
  }, []);

  const saveContents = (updatedContents: PageContent[]) => {
    setContents(updatedContents);
    localStorage.setItem('page_content', JSON.stringify(updatedContents));
  };

  const handleEdit = (content: PageContent) => {
    setEditingContent(content);
    setFormData({ title: content.title, content: content.content });
  };

  const handleSave = () => {
    if (editingContent) {
      const updatedContents = contents.map(content =>
        content.id === editingContent.id
          ? {
              ...content,
              title: formData.title,
              content: formData.content,
              lastModified: new Date().toISOString()
            }
          : content
      );
      saveContents(updatedContents);
      setEditingContent(null);
      setFormData({ title: '', content: '' });
    }
  };

  const handleCancel = () => {
    setEditingContent(null);
    setFormData({ title: '', content: '' });
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

  const groupedContents = contents.reduce((acc, content) => {
    if (!acc[content.page]) {
      acc[content.page] = [];
    }
    acc[content.page].push(content);
    return acc;
  }, {} as Record<string, PageContent[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Page Content Management</h2>
        <p className="text-gray-600">Edit content across all pages of your website</p>
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {Object.entries(groupedContents).map(([page, pageContents]) => (
          <div key={page} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">{page} Page</h3>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {pageContents.map((content) => (
                <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{content.section} Section</h4>
                      <p className="text-sm text-gray-500">
                        Last modified: {formatDate(content.lastModified)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit(content)}
                      disabled={editingContent?.id === content.id}
                      className="inline-flex items-center px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </div>

                  {editingContent?.id === content.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content
                        </label>
                        <textarea
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900">{content.title}</h5>
                      <p className="text-gray-600 leading-relaxed">{content.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Content Management Tips</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium mb-2">Best Practices:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Keep titles concise and descriptive</li>
              <li>Use clear, engaging language</li>
              <li>Test changes on different screen sizes</li>
              <li>Maintain consistent tone across pages</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">SEO Tips:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Include relevant keywords naturally</li>
              <li>Write compelling meta descriptions</li>
              <li>Use headings hierarchy properly</li>
              <li>Keep content fresh and updated</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
