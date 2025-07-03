import React, { useState, useEffect } from 'react';
import { Save, Globe, Eye, Edit3, Image, Type, Palette } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';

interface PageContent {
  id: string;
  page: string;
  section: string;
  title: string;
  content: string;
  type: 'text' | 'html' | 'image';
  lastModified: string;
}

const AdminContent = () => {
  const [content, setContent] = useState<PageContent[]>([]);
  const [selectedPage, setSelectedPage] = useState('home');
  const [editingItem, setEditingItem] = useState<PageContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const pages = [
    { id: 'home', name: 'Home Page', icon: Globe },
    { id: 'about', name: 'About Us', icon: Type },
    { id: 'features', name: 'Features', icon: Palette },
    { id: 'contact', name: 'Contact', icon: Edit3 }
  ];

  useEffect(() => {
    fetchContent();
  }, [selectedPage]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await api.getPageContent(selectedPage);
      setContent(response.content || []);
    } catch (error) {
      console.error('Failed to fetch content:', error);
      // Fallback to mock data
      const mockContent: PageContent[] = [
        {
          id: '1',
          page: selectedPage,
          section: 'hero',
          title: 'Hero Section Title',
          content: 'Transform your files with ease using our powerful conversion tools.',
          type: 'text',
          lastModified: new Date().toISOString()
        },
        {
          id: '2',
          page: selectedPage,
          section: 'features',
          title: 'Features Section',
          content: '<h3>Why Choose FormatFusion?</h3><ul><li>Fast conversions</li><li>Multiple formats</li><li>Secure processing</li></ul>',
          type: 'html',
          lastModified: new Date().toISOString()
        },
        {
          id: '3',
          page: selectedPage,
          section: 'cta',
          title: 'Call to Action',
          content: 'Start converting your files today - it\'s free and easy!',
          type: 'text',
          lastModified: new Date().toISOString()
        }
      ];
      setContent(mockContent);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: PageContent) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      await api.updatePageContent(editingItem.id, {
        title: editingItem.title,
        content: editingItem.content,
        type: editingItem.type
      });

      const updatedContent = content.map(item =>
        item.id === editingItem.id
          ? { ...editingItem, lastModified: new Date().toISOString() }
          : item
      );
      setContent(updatedContent);

      toast({
        title: "Content Updated",
        description: "Page content has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update content. Please try again.",
        variant: "destructive",
      });
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'html':
        return <Edit3 className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'html':
        return 'bg-orange-100 text-orange-700';
      case 'image':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Page Content</h2>
        <p className="text-gray-600">Edit and manage your website content</p>
      </div>

      {/* Page Selector */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Page to Edit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setSelectedPage(page.id)}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedPage === page.id
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <page.icon className="h-5 w-5" />
              <span className="font-medium">{page.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {pages.find(p => p.id === selectedPage)?.name} Content
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Globe className="h-4 w-4" />
              <span>Live Preview Available</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading content...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {content.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{item.title}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                        <span className="ml-1">{item.type.toUpperCase()}</span>
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Section: <span className="font-medium">{item.section}</span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4 mb-3">
                      {item.type === 'html' ? (
                        <div 
                          className="text-sm text-gray-700"
                          dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                      ) : (
                        <p className="text-sm text-gray-700 line-clamp-3">{item.content}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Last modified: {new Date(item.lastModified).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Edit Content</h3>
              <p className="text-gray-600 mt-1">Modify the content for {editingItem.section} section</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={editingItem.type}
                  onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as 'text' | 'html' | 'image' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="text">Plain Text</option>
                  <option value="html">HTML</option>
                  <option value="image">Image URL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={editingItem.content}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                  rows={editingItem.type === 'html' ? 12 : 6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder={
                    editingItem.type === 'html' 
                      ? 'Enter HTML content...' 
                      : editingItem.type === 'image'
                      ? 'Enter image URL...'
                      : 'Enter text content...'
                  }
                />
              </div>

              {editingItem.type === 'html' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: editingItem.content }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2 inline" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContent;