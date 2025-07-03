# 🚀 Deploy FormatFusion to Railway (5 Minutes)

## Step 1: Prepare Your App

### 1.1 Create Railway Config
```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "cd backend && python app.py"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"

[[services]]
name = "formatfusion-backend"
source = "."

[[services]]
name = "formatfusion-frontend"
source = "."
buildCommand = "npm run build"
startCommand = "npm run preview"
```

### 1.2 Update Backend for Production
```python
# Add to backend/app.py
import os

# Production configuration
if os.environ.get('RAILWAY_ENVIRONMENT'):
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
    
    # CORS for production
    CORS(app, origins=[os.environ.get('FRONTEND_URL', 'https://your-app.vercel.app')])

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

### 1.3 Create Requirements File
```txt
# backend/requirements.txt
Flask==2.3.3
Flask-CORS==4.0.0
Flask-JWT-Extended==4.5.3
Flask-SQLAlchemy==3.0.5
Werkzeug==2.3.7
Pillow==10.0.1
python-dotenv==1.0.0
psycopg2-binary==2.9.7
stripe==6.6.0
```

## Step 2: Deploy to Railway

### 2.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2.2 Railway Setup
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your FormatFusion repo

### 2.3 Add Environment Variables
In Railway dashboard, add:
```env
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=postgresql://... (Railway provides this)
FRONTEND_URL=https://your-frontend-domain.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2.4 Add PostgreSQL Database
1. In Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway automatically connects it

## Step 3: Frontend Deployment (Vercel)

### 3.1 Update API Base URL
```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-railway-app.railway.app/api'
  : 'http://localhost:5000/api';
```

### 3.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy

## Step 4: Domain Setup (Optional)

### 4.1 Custom Domain
- Railway: Add custom domain in settings
- Vercel: Add custom domain in project settings
- Point your domain's DNS to provided URLs

### 4.2 SSL Certificate
- Both Railway and Vercel provide free SSL
- Automatically configured

## 📊 Cost Breakdown

### Railway (Backend + Database)
- **Starter**: $5/month
- **Pro**: $20/month (for higher traffic)
- **Database**: Included in plan

### Vercel (Frontend)
- **Hobby**: Free (perfect for starting)
- **Pro**: $20/month (for commercial use)

### Total Monthly Cost
- **Starting**: $5/month (Railway) + $0 (Vercel) = **$5/month**
- **Growing**: $20/month (Railway) + $20 (Vercel) = **$40/month**

## 🚀 Alternative: All-in-One Railway

### Single Service Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy built frontend
COPY --from=frontend /app/dist ./static

# Serve both frontend and backend
EXPOSE 8080
CMD ["python", "app.py"]
```

### Update Flask to Serve Frontend
```python
# Add to backend/app.py
from flask import send_from_directory

@app.route('/')
def serve_frontend():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)
```

## 🔧 Production Optimizations

### 1. Environment Variables
```bash
# Railway environment variables
SECRET_KEY=prod-secret-key-32-chars-long
JWT_SECRET_KEY=jwt-secret-key-32-chars-long
DATABASE_URL=postgresql://... (auto-provided)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
CORS_ORIGINS=https://your-domain.com
MAX_CONTENT_LENGTH=104857600
```

### 2. Database Migration
```python
# backend/migrate.py
import sqlite3
import psycopg2
import os

def migrate_to_postgresql():
    # Export from SQLite
    sqlite_conn = sqlite3.connect('app.db')
    
    # Import to PostgreSQL
    pg_conn = psycopg2.connect(os.environ['DATABASE_URL'])
    
    # Migration logic here
    pass

if __name__ == '__main__':
    migrate_to_postgresql()
```

### 3. File Storage (Production)
```python
# Use cloud storage for production
import boto3

def upload_to_s3(file_path, bucket, key):
    s3 = boto3.client('s3')
    s3.upload_file(file_path, bucket, key)
    return f"https://{bucket}.s3.amazonaws.com/{key}"
```

## 📈 Scaling Strategy

### Traffic Growth Plan:
- **0-1K users**: Railway Starter ($5/month)
- **1K-10K users**: Railway Pro ($20/month)
- **10K+ users**: Consider AWS/GCP migration

### Performance Monitoring:
- Railway provides built-in metrics
- Add Sentry for error tracking
- Use Stripe Dashboard for payment analytics

## 🎯 Go-Live Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables set
- [ ] Database connected
- [ ] Frontend deployed to Vercel
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Stripe webhooks configured
- [ ] Error monitoring setup
- [ ] Analytics tracking added

## 🚀 One-Click Deploy

### Railway Template (Coming Soon)
```json
{
  "name": "FormatFusion",
  "description": "File conversion platform",
  "repository": "your-username/format-fusion-web-app",
  "env": {
    "SECRET_KEY": {
      "description": "Flask secret key",
      "generator": "secret"
    },
    "JWT_SECRET_KEY": {
      "description": "JWT secret key", 
      "generator": "secret"
    }
  }
}
```

**Deployment Time**: 5-10 minutes
**Monthly Cost**: $5-40 depending on traffic
**Scalability**: Handles 10K+ users easily