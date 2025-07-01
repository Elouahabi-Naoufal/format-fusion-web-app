# FormatFusion Setup Guide

## Installation Requirements

### 1. System Requirements
- **Node.js 18+** and npm
- **Python 3.8+** and pip
- **Git** (for cloning)

### 2. Frontend Dependencies
```bash
# Install frontend dependencies
npm install

# Install additional dependency for running both servers
npm install concurrently --save-dev
```

### 3. Backend Dependencies
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

## Quick Start

### Option 1: Run Both Servers Together
```bash
# From project root
npm run dev:full
```

### Option 2: Run Servers Separately
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py

# Terminal 2 - Frontend
npm run dev
```

## Access Points
- **Frontend**: http://localhost:5173 (or http://localhost:8080)
- **Backend API**: http://localhost:5000
- **Admin Login**: http://localhost:5173/admin/login
  - Username: `admin`
  - Password: `admin123`

## Features Available
✅ **File Upload & Conversion**
- Real image conversion (JPG ↔ PNG, BMP, etc.)
- Simulated conversion for other formats
- Progress tracking
- Download converted files

✅ **Admin Dashboard**
- File management
- Statistics
- User authentication

✅ **Blog System**
- View blog posts
- Categories and featured posts

## Supported Conversions

### Real Conversions (Working)
- **Images**: JPG ↔ PNG, BMP, TIFF, WEBP

### Simulated Conversions
- **Documents**: PDF ↔ DOCX, TXT, RTF
- **Audio**: WAV ↔ MP3, FLAC, AAC
- **Video**: MOV, AVI → MP4
- **Archives**: ZIP ↔ RAR, 7Z
- **Data**: CSV ↔ XLSX, JSON

## Troubleshooting

### Backend Issues
- Ensure Python virtual environment is activated
- Check if port 5000 is available
- Verify all dependencies are installed

### Frontend Issues
- Check if backend is running on port 5000
- Ensure Node.js version is 18+
- Clear browser cache if needed

### Database Issues
- SQLite database is created automatically
- Database file: `backend/formatfusion.db`
- Delete database file to reset data

## File Structure
```
format-fusion-web-app/
├── src/                    # React frontend
├── backend/               # Flask backend
│   ├── app.py            # Main Flask app
│   ├── models.py         # Database models
│   ├── uploads/          # File storage
│   └── formatfusion.db   # SQLite database
├── package.json          # Frontend dependencies
└── README.md            # Project documentation
```