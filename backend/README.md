# FormatFusion Backend API

Flask-based REST API for the FormatFusion file conversion application.

## Features

- File upload and conversion management
- Blog post management
- Admin authentication and dashboard
- SQLite database with automatic initialization
- Support for multiple file formats
- Real-time conversion progress tracking

## Installation

1. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Initialize the database:**
   ```bash
   python init_db.py
   ```

## Running the Server

### Development Mode
```bash
python app.py
```

### Production Mode
```bash
python run.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### File Management
- `POST /api/files/upload` - Upload files for conversion
- `GET /api/files` - List files with pagination
- `GET /api/files/{id}` - Get specific file details
- `GET /api/files/{id}/download` - Download converted file
- `DELETE /api/files/{id}` - Delete file
- `GET /api/files/stats` - Get file statistics

### Conversion
- `POST /api/convert/start` - Start file conversion
- `GET /api/convert/status/{id}` - Get conversion status
- `GET /api/convert/progress/{id}` - Get conversion progress

### Blog Management
- `GET /api/blog` - List blog posts
- `GET /api/blog/{id}` - Get specific blog post
- `POST /api/blog` - Create new blog post
- `PUT /api/blog/{id}` - Update blog post
- `DELETE /api/blog/{id}` - Delete blog post
- `GET /api/blog/categories` - Get blog categories
- `GET /api/blog/featured` - Get featured posts

### Admin
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/files` - Admin file management
- `GET /api/admin/blog` - Admin blog management
- `GET /api/admin/content/{page}` - Get page content
- `PUT /api/admin/content/{page}` - Update page content

## Default Admin Credentials

- **Username:** admin
- **Password:** admin123

## Environment Variables

Create a `.env` file with:

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-super-secret-key-change-this-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production
DATABASE_URL=sqlite:///database/formatfusion.db
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=104857600
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## File Structure

```
backend/
├── app/
│   ├── models/          # Database models
│   ├── routes/          # API route handlers
│   └── utils/           # Utility functions
├── database/            # SQLite database files
├── uploads/             # Uploaded and converted files
├── app.py              # Main Flask application
├── init_db.py          # Database initialization
├── run.py              # Production runner
└── requirements.txt    # Python dependencies
```

## Supported File Formats

### Images
- JPG/JPEG ↔ PNG, BMP, TIFF, WEBP

### Documents (Simulated)
- PDF ↔ DOCX, TXT, RTF

### Audio (Simulated)
- WAV ↔ MP3, FLAC, AAC

### Video (Simulated)
- MOV, AVI, WMV, FLV → MP4

### Archives (Simulated)
- ZIP ↔ RAR, 7Z

### Data (Simulated)
- CSV ↔ XLSX, JSON, XML

## Notes

- File conversions are currently simulated for most formats except basic image conversions
- Files are automatically cleaned up after 24 hours
- Maximum file size is 100MB
- CORS is configured for frontend development server