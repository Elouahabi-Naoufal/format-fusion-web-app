from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import json

db = SQLAlchemy()

class FileRecord(db.Model):
    __tablename__ = 'file_records'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = db.Column(db.String(255), nullable=False)
    original_format = db.Column(db.String(10), nullable=False)
    converted_format = db.Column(db.String(10), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    converted_path = db.Column(db.String(500))
    status = db.Column(db.String(20), default='pending')
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    completion_date = db.Column(db.DateTime)
    download_count = db.Column(db.Integer, default=0)
    user_email = db.Column(db.String(255))
    error_message = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'originalFormat': self.original_format,
            'convertedFormat': self.converted_format,
            'fileSize': self.format_file_size(self.file_size),
            'status': self.status,
            'uploadDate': self.upload_date.isoformat() if self.upload_date else None,
            'completionDate': self.completion_date.isoformat() if self.completion_date else None,
            'downloadCount': self.download_count,
            'userEmail': self.user_email,
            'errorMessage': self.error_message
        }
    
    def format_file_size(self, bytes_size):
        if bytes_size == 0:
            return '0 Bytes'
        k = 1024
        sizes = ['Bytes', 'KB', 'MB', 'GB']
        i = 0
        while bytes_size >= k and i < len(sizes) - 1:
            bytes_size /= k
            i += 1
        return f"{bytes_size:.2f} {sizes[i]}"

class BlogPost(db.Model):
    __tablename__ = 'blog_posts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    excerpt = db.Column(db.Text)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    tags = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    featured = db.Column(db.Boolean, default=False)
    published = db.Column(db.Boolean, default=True)
    publish_date = db.Column(db.DateTime, default=datetime.utcnow)
    read_time = db.Column(db.String(20))
    views = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'excerpt': self.excerpt,
            'content': self.content,
            'author': self.author,
            'category': self.category,
            'tags': json.loads(self.tags) if self.tags else [],
            'image': self.image_url,
            'featured': self.featured,
            'published': self.published,
            'publishDate': self.publish_date.isoformat() if self.publish_date else None,
            'readTime': self.read_time,
            'views': self.views,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'isActive': self.is_active,
            'lastLogin': self.last_login.isoformat() if self.last_login else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class AdminContent(db.Model):
    __tablename__ = 'admin_content'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    page = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    updated_by = db.Column(db.String(36), db.ForeignKey('admin_users.id'))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'page': self.page,
            'title': self.title,
            'content': self.content,
            'updatedBy': self.updated_by,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }