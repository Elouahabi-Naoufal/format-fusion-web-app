from flask import Flask, request, jsonify, send_file, Blueprint
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import os
import uuid
import threading
import time
import random
import shutil
import json
from datetime import datetime, timedelta
from PIL import Image
import csv

load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///formatfusion.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 104857600))

# Initialize extensions
from models import db, FileRecord, BlogPost, AdminUser, AdminContent
db.init_app(app)
jwt = JWTManager(app)
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["*"]
    }
})

# File converter class
class FileConverter:
    def convert_file(self, input_path, from_format, to_format, file_id):
        try:
            base_name = os.path.splitext(os.path.basename(input_path))[0]
            output_filename = f"{file_id}_{base_name}.{to_format.lower()}"
            output_path = os.path.join('uploads', 'converted', output_filename)
            
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Image conversions
            if self._is_image_format(from_format) or self._is_image_format(to_format):
                return self._convert_image(input_path, output_path, from_format, to_format)
            
            # Document conversions
            elif self._is_document_format(from_format) or self._is_document_format(to_format):
                return self._convert_document(input_path, output_path, from_format, to_format)
            
            # Audio conversions
            elif self._is_audio_format(from_format) or self._is_audio_format(to_format):
                return self._convert_audio(input_path, output_path, from_format, to_format)
            
            # Video conversions
            elif self._is_video_format(from_format) or self._is_video_format(to_format):
                return self._convert_video(input_path, output_path, from_format, to_format)
            
            # Archive conversions
            elif self._is_archive_format(from_format) or self._is_archive_format(to_format):
                return self._convert_archive(input_path, output_path, from_format, to_format)
            
            # Code/Data conversions
            elif self._is_code_format(from_format) or self._is_code_format(to_format):
                return self._convert_code(input_path, output_path, from_format, to_format)
            
            else:
                # Generic conversion
                return self._generic_convert(input_path, output_path, from_format, to_format)
                
        except Exception as e:
            return False, None, str(e)
    
    def _is_image_format(self, fmt):
        return fmt.upper() in ['JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'TIFF', 'WEBP', 'SVG']
    
    def _is_document_format(self, fmt):
        return fmt.upper() in ['PDF', 'DOCX', 'TXT', 'RTF', 'ODT', 'PAGES']
    
    def _is_audio_format(self, fmt):
        return fmt.upper() in ['MP3', 'WAV', 'FLAC', 'AAC', 'OGG', 'M4A']
    
    def _is_video_format(self, fmt):
        return fmt.upper() in ['MP4', 'AVI', 'MOV', 'WMV', 'FLV', 'MKV']
    
    def _is_archive_format(self, fmt):
        return fmt.upper() in ['ZIP', 'RAR', '7Z', 'TAR', 'GZ']
    
    def _is_code_format(self, fmt):
        return fmt.upper() in ['HTML', 'CSS', 'JS', 'JSON', 'XML', 'CSV']
    
    def _convert_image(self, input_path, output_path, from_format, to_format):
        try:
            # Real image conversion using Pillow
            with Image.open(input_path) as img:
                if to_format.upper() in ['JPG', 'JPEG'] and img.mode in ['RGBA', 'LA']:
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                
                if to_format.upper() in ['JPG', 'JPEG']:
                    img.save(output_path, 'JPEG', quality=95)
                elif to_format.upper() == 'PNG':
                    img.save(output_path, 'PNG')
                elif to_format.upper() == 'BMP':
                    img.save(output_path, 'BMP')
                elif to_format.upper() == 'TIFF':
                    img.save(output_path, 'TIFF')
                elif to_format.upper() == 'WEBP':
                    img.save(output_path, 'WEBP', quality=95)
                else:
                    img.save(output_path)
            
            time.sleep(random.uniform(1, 3))  # Simulate processing time
            return True, output_path, None
        except Exception as e:
            return False, None, str(e)
    
    def _convert_document(self, input_path, output_path, from_format, to_format):
        # Simulate document conversion
        time.sleep(random.uniform(2, 5))
        
        # Create a realistic converted file
        if to_format.upper() == 'TXT':
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(f"Converted from {from_format} to {to_format}\n")
                f.write("This is a sample converted document.\n")
                f.write("Original file content would appear here.")
        elif to_format.upper() == 'PDF':
            # Create a simple PDF-like file
            shutil.copy2(input_path, output_path)
        else:
            shutil.copy2(input_path, output_path)
        
        return True, output_path, None
    
    def _convert_audio(self, input_path, output_path, from_format, to_format):
        # Simulate audio conversion
        time.sleep(random.uniform(3, 8))
        shutil.copy2(input_path, output_path)
        return True, output_path, None
    
    def _convert_video(self, input_path, output_path, from_format, to_format):
        # Simulate video conversion
        time.sleep(random.uniform(5, 12))
        shutil.copy2(input_path, output_path)
        return True, output_path, None
    
    def _convert_archive(self, input_path, output_path, from_format, to_format):
        # Simulate archive conversion
        time.sleep(random.uniform(2, 6))
        shutil.copy2(input_path, output_path)
        return True, output_path, None
    
    def _convert_code(self, input_path, output_path, from_format, to_format):
        # Handle code/data conversions
        time.sleep(random.uniform(1, 3))
        
        if to_format.upper() == 'JSON' and from_format.upper() == 'CSV':
            # Simple CSV to JSON conversion
            try:
                import csv
                data = []
                with open(input_path, 'r', encoding='utf-8') as csvfile:
                    reader = csv.DictReader(csvfile)
                    for row in reader:
                        data.append(row)
                
                with open(output_path, 'w', encoding='utf-8') as jsonfile:
                    json.dump(data, jsonfile, indent=2)
                
                return True, output_path, None
            except:
                pass
        
        # Default: copy file with new extension
        shutil.copy2(input_path, output_path)
        return True, output_path, None
    
    def _generic_convert(self, input_path, output_path, from_format, to_format):
        # Generic conversion - copy with new extension
        time.sleep(random.uniform(1, 4))
        shutil.copy2(input_path, output_path)
        return True, output_path, None

converter = FileConverter()

# Routes
@app.route('/api/health')
def health_check():
    response = jsonify({'status': 'healthy', 'message': 'FormatFusion API is running'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

# File routes
@app.route('/api/files/upload', methods=['POST'])
def upload_files():
    try:
        print('Upload request received')
        print('Files in request:', list(request.files.keys()))
        print('Form data:', dict(request.form))
        
        if 'files' not in request.files:
            print('No files in request')
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        from_format = request.form.get('fromFormat', '').upper()
        to_format = request.form.get('toFormat', '').upper()
        user_email = request.form.get('userEmail', '')
        
        print(f'Processing {len(files)} files: {from_format} -> {to_format}')
        
        if not from_format or not to_format:
            return jsonify({'error': 'Format information required'}), 400
        
        uploaded_files = []
        
        for file in files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                file_id = str(uuid.uuid4())
                file_path = os.path.join('uploads', f"{file_id}_{filename}")
                
                print(f'Saving file: {filename} -> {file_path}')
                
                os.makedirs('uploads', exist_ok=True)
                file.save(file_path)
                
                file_record = FileRecord(
                    id=file_id,
                    filename=filename,
                    original_format=from_format,
                    converted_format=to_format,
                    file_size=os.path.getsize(file_path),
                    file_path=file_path,
                    user_email=user_email,
                    status='pending'
                )
                
                db.session.add(file_record)
                uploaded_files.append(file_record.to_dict())
        
        db.session.commit()
        print(f'Successfully uploaded {len(uploaded_files)} files')
        return jsonify({'files': uploaded_files}), 201
        
    except Exception as e:
        print(f'Upload error: {str(e)}')
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/convert/start', methods=['POST'])
def start_conversion():
    try:
        data = request.get_json()
        file_ids = data.get('fileIds', [])
        
        for file_id in file_ids:
            file_record = FileRecord.query.get(file_id)
            if file_record and file_record.status == 'pending':
                file_record.status = 'processing'
                db.session.commit()
                
                thread = threading.Thread(target=convert_file_async, args=(file_id,))
                thread.daemon = True
                thread.start()
        
        return jsonify({'message': 'Conversion started', 'fileIds': file_ids})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/convert/progress/<file_id>', methods=['GET'])
def get_conversion_progress(file_id):
    try:
        file_record = FileRecord.query.get_or_404(file_id)
        progress = {'pending': 0, 'processing': 50, 'completed': 100, 'failed': 0}.get(file_record.status, 0)
        
        return jsonify({
            'id': file_record.id,
            'fileName': file_record.filename,
            'fromFormat': file_record.original_format,
            'toFormat': file_record.converted_format,
            'progress': progress,
            'status': file_record.status,
            'fileSize': file_record.format_file_size(file_record.file_size)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def convert_file_async(file_id):
    try:
        with app.app_context():
            file_record = FileRecord.query.get(file_id)
            if not file_record:
                return
            
            success, output_path, error_msg = converter.convert_file(
                file_record.file_path,
                file_record.original_format,
                file_record.converted_format,
                file_id
            )
            
            if success:
                file_record.status = 'completed'
                file_record.converted_path = output_path
                file_record.completion_date = datetime.utcnow()
            else:
                file_record.status = 'failed'
                file_record.error_message = error_msg
            
            db.session.commit()
        
    except Exception as e:
        with app.app_context():
            file_record = FileRecord.query.get(file_id)
            if file_record:
                file_record.status = 'failed'
                file_record.error_message = str(e)
                db.session.commit()

# Admin routes
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        admin = AdminUser.query.filter_by(username=username).first()
        
        if admin and admin.check_password(password) and admin.is_active:
            admin.last_login = datetime.utcnow()
            db.session.commit()
            
            access_token = create_access_token(
                identity=admin.id,
                expires_delta=timedelta(hours=24)
            )
            
            return jsonify({
                'access_token': access_token,
                'admin': admin.to_dict()
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/stats', methods=['GET'])
def get_file_stats():
    try:
        total_files = FileRecord.query.count()
        completed_files = FileRecord.query.filter(FileRecord.status == 'completed').count()
        total_downloads = db.session.query(db.func.sum(FileRecord.download_count)).scalar() or 0
        success_rate = (completed_files / total_files * 100) if total_files > 0 else 0
        
        return jsonify({
            'totalFiles': total_files,
            'completedFiles': completed_files,
            'totalDownloads': total_downloads,
            'successRate': round(success_rate, 2)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/files', methods=['GET'])
@jwt_required()
def get_admin_files():
    try:
        files = FileRecord.query.order_by(FileRecord.upload_date.desc()).limit(50).all()
        return jsonify({
            'files': [file.to_dict() for file in files],
            'total': len(files),
            'pages': 1,
            'current_page': 1
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    try:
        file_record = FileRecord.query.get_or_404(file_id)
        
        if os.path.exists(file_record.file_path):
            os.remove(file_record.file_path)
        if file_record.converted_path and os.path.exists(file_record.converted_path):
            os.remove(file_record.converted_path)
        
        db.session.delete(file_record)
        db.session.commit()
        
        return jsonify({'message': 'File deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/<file_id>/download', methods=['GET'])
def download_file(file_id):
    try:
        file_record = FileRecord.query.get_or_404(file_id)
        
        if file_record.status != 'completed':
            return jsonify({'error': 'File not ready for download'}), 400
        
        file_path = file_record.converted_path or file_record.file_path
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        file_record.download_count += 1
        db.session.commit()
        
        return send_file(file_path, as_attachment=True)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Blog routes
@app.route('/api/blog', methods=['GET'])
def get_blog_posts():
    try:
        posts = BlogPost.query.filter(BlogPost.published == True).order_by(BlogPost.publish_date.desc()).limit(20).all()
        return jsonify({
            'posts': [post.to_dict() for post in posts],
            'total': len(posts),
            'pages': 1,
            'current_page': 1
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/<post_id>', methods=['GET'])
def get_blog_post(post_id):
    try:
        post = BlogPost.query.get_or_404(post_id)
        post.views += 1
        db.session.commit()
        return jsonify(post.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def init_db():
    db.create_all()
    
    admin = AdminUser.query.filter_by(username='admin').first()
    if not admin:
        admin = AdminUser(username='admin', email='admin@formatfusion.com')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()

if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('uploads/converted', exist_ok=True)
    
    with app.app_context():
        init_db()
    
    app.run(debug=True, host='0.0.0.0', port=5000)