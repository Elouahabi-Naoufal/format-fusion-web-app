const API_BASE_URL = 'http://localhost:5000/api';

// Check if backend is running
const checkBackend = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    if (response.ok) {
      console.log('✅ Backend connected successfully');
      return true;
    }
  } catch (error) {
    console.warn('❌ Backend not running on localhost:5000 - Start with: cd backend && python app.py');
    return false;
  }
};

checkBackend();

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('admin_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async login(username: string, password: string) {
    const response = await this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    this.token = response.access_token;
    localStorage.setItem('admin_token', this.token!);
    return response;
  }

  async adminLogin(username: string, password: string) {
    return this.login(username, password);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('admin_token');
  }

  // File methods
  async uploadFiles(files: File[], fromFormat: string, toFormat: string, userEmail?: string) {
    console.log('API: Uploading files', { files: files.length, fromFormat, toFormat });
    
    const formData = new FormData();
    files.forEach(file => {
      console.log('Adding file:', file.name, file.size);
      formData.append('files', file);
    });
    formData.append('fromFormat', fromFormat);
    formData.append('toFormat', toFormat);
    if (userEmail) formData.append('userEmail', userEmail);

    const response = await fetch(`${this.baseURL}/files/upload`, {
      method: 'POST',
      body: formData,
    });

    console.log('Upload response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error:', errorText);
      const error = JSON.parse(errorText).error || 'Upload failed';
      throw new Error(error);
    }

    const result = await response.json();
    console.log('Upload result:', result);
    return result;
  }

  async startConversion(fileIds: string[]) {
    return this.request('/convert/start', {
      method: 'POST',
      body: JSON.stringify({ fileIds }),
    });
  }

  async getConversionProgress(fileId: string) {
    return this.request(`/convert/progress/${fileId}`);
  }

  async getFiles(page = 1, perPage = 10, status?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    if (status) params.append('status', status);

    return this.request(`/files?${params}`);
  }

  async downloadFile(fileId: string) {
    const response = await fetch(`${this.baseURL}/files/${fileId}/download?t=${Date.now()}`, {
      headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      throw new Error('Download failed');
    }
    
    return response.blob();
  }

  async deleteFile(fileId: string) {
    return this.request(`/files/${fileId}`, { method: 'DELETE' });
  }

  async getFileStats() {
    return this.request('/files/stats');
  }

  // Blog methods
  async getBlogPosts(page = 1, perPage = 10, category?: string, featured?: boolean) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    if (category) params.append('category', category);
    if (featured !== undefined) params.append('featured', featured.toString());

    return this.request(`/blog?${params}`);
  }

  async getBlogPost(id: string) {
    return this.request(`/blog/${id}`);
  }

  async createBlogPost(post: any) {
    return this.request('/blog', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }

  async updateBlogPost(id: string, post: any) {
    return this.request(`/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(post),
    });
  }

  async deleteBlogPost(id: string) {
    return this.request(`/blog/${id}`, { method: 'DELETE' });
  }

  async getFeaturedPosts() {
    return this.request('/blog/featured');
  }

  async getBlogCategories() {
    return this.request('/blog/categories');
  }

  // Admin methods
  async getDashboardStats() {
    return this.request('/admin/dashboard');
  }

  async getAdminFiles(page = 1, perPage = 20, status?: string, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    return this.request(`/admin/files?${params}`);
  }

  async getAdminBlogPosts(page = 1, perPage = 20, category?: string, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    return this.request(`/admin/blog?${params}`);
  }







  async getPageContent(page: string) {
    return this.request(`/admin/content/${page}`);
  }

  async updatePageContent(id: string, data: { title: string; content: string; type: string }) {
    return this.request(`/admin/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdminSettings() {
    return this.request('/admin/settings');
  }

  async updateAdminSettings(settings: any) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;