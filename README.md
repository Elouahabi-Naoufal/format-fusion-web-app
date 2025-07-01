# FormatFusion - File Conversion Web Application

A modern, full-stack web application for converting files between different formats. Built with React (TypeScript) frontend and Flask (Python) backend.

## 🚀 Features

- **File Conversion**: Support for 200+ file formats across multiple categories
- **Real-time Progress**: Live conversion progress tracking
- **Batch Processing**: Convert multiple files simultaneously
- **Admin Dashboard**: Complete admin panel for managing files and content
- **Blog System**: Built-in blog with categories and featured posts
- **Responsive Design**: Mobile-first design with modern UI components
- **Secure**: JWT authentication and file encryption

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Router** for navigation
- **React Query** for data fetching
- **Lucide React** for icons

### Backend
- **Flask** (Python) REST API
- **SQLite** database
- **JWT** authentication
- **Pillow** for image processing
- **Flask-CORS** for cross-origin requests
- **Werkzeug** for file handling

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- pip (Python package manager)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd format-fusion-web-app
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   npm run backend:install
   ```
   
   Or manually:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Initialize the database:**
   ```bash
   npm run backend:init
   ```

5. **Start both frontend and backend:**
   ```bash
   npm run dev:full
   ```

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   npm run backend:dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:5173/admin
- **Admin Login**: http://localhost:5173/admin/login

## 🔐 Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 📁 Project Structure

```
format-fusion-web-app/
├── src/                    # React frontend source
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── lib/               # Utilities and API client
│   └── hooks/             # Custom React hooks
├── backend/               # Flask backend
│   ├── app/              # Flask application
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utility functions
│   ├── database/         # SQLite database files
│   ├── uploads/          # File storage
│   └── requirements.txt  # Python dependencies
├── public/               # Static assets
└── package.json         # Node.js dependencies
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run backend:install` - Install Python dependencies
- `npm run backend:init` - Initialize database with sample data
- `npm run backend:dev` - Start Flask development server
- `npm run backend:prod` - Start Flask production server

### Full Stack
- `npm run dev:full` - Start both frontend and backend concurrently

## 🎯 API Endpoints

### File Management
- `POST /api/files/upload` - Upload files for conversion
- `GET /api/files` - List files with pagination
- `GET /api/files/{id}/download` - Download converted file
- `DELETE /api/files/{id}` - Delete file

### Conversion
- `POST /api/convert/start` - Start file conversion
- `GET /api/convert/progress/{id}` - Get conversion progress

### Blog
- `GET /api/blog` - List blog posts
- `GET /api/blog/{id}` - Get specific blog post
- `POST /api/blog` - Create blog post (admin)

### Admin
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/files` - File management
- `GET /api/admin/blog` - Blog management

## 🔄 Supported File Formats

### Images
- **Input**: JPG, JPEG, PNG, GIF, BMP, TIFF, WEBP, SVG
- **Output**: JPG, PNG, BMP, TIFF, WEBP

### Documents (Simulated)
- PDF, DOCX, TXT, RTF, ODT, PAGES

### Audio (Simulated)
- MP3, WAV, FLAC, AAC, OGG, M4A

### Video (Simulated)
- MP4, AVI, MOV, WMV, FLV, MKV

### Archives (Simulated)
- ZIP, RAR, 7Z, TAR, GZ

### Code/Data (Simulated)
- HTML, CSS, JS, JSON, XML, CSV

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Update API base URL in `src/lib/api.ts`

### Backend (Heroku/Railway/DigitalOcean)
1. Set environment variables
2. Install dependencies: `pip install -r backend/requirements.txt`
3. Initialize database: `python backend/init_db.py`
4. Start server: `python backend/run.py`

## 🔒 Environment Variables

### Backend (.env)
```env
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=your-super-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=sqlite:///database/formatfusion.db
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=104857600
CORS_ORIGINS=https://your-frontend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed description
3. Include error logs and system information

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Lucide](https://lucide.dev/) for icons
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Flask](https://flask.palletsprojects.com/) for the backend framework