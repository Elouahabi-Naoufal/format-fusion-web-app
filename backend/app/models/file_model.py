import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import db from the main app module
if __name__ == '__main__':
    from app import db
else:
    # When imported as a module
    import importlib.util
    spec = importlib.util.spec_from_file_location("app", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "app.py"))
    app_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(app_module)
    db = app_module.db
from datetime import datetime
import uuid

class FileRecord(db.Model):
    __tablename__ = 'file_records'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = db.Column(db.String(255), nullable=False)
    original_format = db.Column(db.String(10), nullable=False)
    converted_format = db.Column(db.String(10), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    converted_path = db.Column(db.String(500))
    status = db.Column(db.String(20), default='pending')  # pending, processing, completed, failed
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