
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { useTheme } from '../../hooks/useTheme';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  status: 'draft' | 'published';
  category: string;
  tags: string[];
  featured: boolean;
}

const AdminBlog = () => {
  const { isDark } = useTheme('admin-theme');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    category: 'Tutorials',
    tags: [],
    status: 'draft',
    featured: false
  });

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await api.getAdminBlogPosts();
        const formattedPosts = response.posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          publishDate: post.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: post.published ? 'published' : 'draft',
          category: post.category,
          tags: post.tags ? post.tags.split(',') : [],
          featured: post.featured
        }));
        setPosts(formattedPosts);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
        // Fallback to localStorage
        const savedPosts = localStorage.getItem('blog_posts');
        if (savedPosts) {
          setPosts(JSON.parse(savedPosts));
        } else {
          // Initialize with mock data as fallback
          const mockPosts: BlogPost[] = [
            {
              id: '1',
              title: 'Complete Guide to PDF Conversion',
              excerpt: 'Learn everything you need to know about converting PDFs to and from various formats.',
              content: 'Full content here...',
              author: 'Sarah Johnson',
              publishDate: '2024-01-15',
              status: 'published',
              category: 'Tutorials',
              tags: ['PDF', 'Conversion', 'Documents'],
              featured: true
            }
          ];
          setPosts(mockPosts);
          localStorage.setItem('blog_posts', JSON.stringify(mockPosts));
        }
      }
    };

    fetchBlogPosts();
  }, []);

  const { toast } = useToast();

  const savePosts = (updatedPosts: BlogPost[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('blog_posts', JSON.stringify(updatedPosts));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPost) {
        // Update existing post
        const postData = {
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          author: formData.author,
          category: formData.category,
          tags: formData.tags?.join(','),
          published: formData.status === 'published',
          featured: formData.featured
        };
        
        await api.updateBlogPost(editingPost.id, postData);
        const updatedPosts = posts.map(post =>
          post.id === editingPost.id
            ? { ...post, ...formData, publishDate: post.publishDate }
            : post
        );
        savePosts(updatedPosts);
        
        toast({
          title: "Post Updated",
          description: "Blog post has been updated successfully.",
        });
      } else {
        // Create new post
        const postData = {
          title: formData.title || '',
          excerpt: formData.excerpt || '',
          content: formData.content || '',
          author: formData.author || '',
          category: formData.category || 'Tutorials',
          tags: formData.tags?.join(',') || '',
          published: formData.status === 'published',
          featured: formData.featured || false
        };
        
        const response = await api.createBlogPost(postData);
        const newPost: BlogPost = {
          id: response.id || Date.now().toString(),
          title: formData.title || '',
          excerpt: formData.excerpt || '',
          content: formData.content || '',
          author: formData.author || '',
          publishDate: new Date().toISOString().split('T')[0],
          status: formData.status || 'draft',
          category: formData.category || 'Tutorials',
          tags: formData.tags || [],
          featured: formData.featured || false
        };
        savePosts([...posts, newPost]);
        
        toast({
          title: "Post Created",
          description: "New blog post has been created successfully.",
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save blog post. Changes saved locally.",
        variant: "destructive",
      });
      
      // Fallback to local storage
      if (editingPost) {
        const updatedPosts = posts.map(post =>
          post.id === editingPost.id
            ? { ...post, ...formData, publishDate: post.publishDate }
            : post
        );
        savePosts(updatedPosts);
      } else {
        const newPost: BlogPost = {
          id: Date.now().toString(),
          title: formData.title || '',
          excerpt: formData.excerpt || '',
          content: formData.content || '',
          author: formData.author || '',
          publishDate: new Date().toISOString().split('T')[0],
          status: formData.status || 'draft',
          category: formData.category || 'Tutorials',
          tags: formData.tags || [],
          featured: formData.featured || false
        };
        savePosts([...posts, newPost]);
      }
    }

    closeModal();
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData(post);
    setIsModalOpen(true);
  };

  const handleDelete = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await api.deleteBlogPost(postId);
        const updatedPosts = posts.filter(post => post.id !== postId);
        savePosts(updatedPosts);
        
        toast({
          title: "Post Deleted",
          description: "Blog post has been deleted successfully.",
        });
      } catch (error) {
        console.error('Error deleting post:', error);
        toast({
          title: "Delete Failed",
          description: "Failed to delete post from server. Removed locally.",
          variant: "destructive",
        });
        
        // Fallback to local deletion
        const updatedPosts = posts.filter(post => post.id !== postId);
        savePosts(updatedPosts);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      author: '',
      category: 'Tutorials',
      tags: [],
      status: 'draft',
      featured: false
    });
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData({ ...formData, tags });
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className={`rounded-xl shadow-lg border p-6 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Blog Management</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Create and manage your blog content</p>
            <div className="flex items-center space-x-4 mt-3">
              <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{posts.filter(p => p.status === 'published').length} Published</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>{posts.filter(p => p.status === 'draft').length} Drafts</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{posts.filter(p => p.featured).length} Featured</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className={`inline-flex items-center px-4 py-2 border rounded-lg transition-colors ${
              isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <Eye className="h-4 w-4 mr-2" />
              Preview Site
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Post
            </button>
          </div>
        </div>
      </div>

        {/* Posts Table */}
        <div className={`rounded-xl shadow-lg border overflow-hidden ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Title
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Author
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Date
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {posts.map((post) => (
                <tr key={post.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{post.title}</p>
                      <p className={`text-sm truncate max-w-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{post.excerpt}</p>
                      {post.featured && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className={`h-4 w-4 mr-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{post.author}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(post.publishDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark ? 'text-blue-400 hover:bg-blue-900/20' : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          isDark ? 'text-green-400 hover:bg-green-900/20' : 'text-green-600 hover:bg-green-50'
                        }`}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'
                        }`}
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto m-4 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Tutorials">Tutorials</option>
                    <option value="Technology">Technology</option>
                    <option value="Tips">Tips</option>
                    <option value="News">News</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags?.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="PDF, Conversion, Tutorial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder="Write your blog post content here... You can use markdown formatting."
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                  Featured post
                </label>
              </div>

              <div className={`flex justify-end space-x-4 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={`px-6 py-2 border rounded-lg transition-colors ${
                    isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminBlog;
