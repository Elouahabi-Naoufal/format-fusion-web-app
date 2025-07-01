from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image
import os
import uuid
import sqlite3
import threading
import time
import random
import shutil
import json
import csv
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key'

jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["*"]}})

# Database setup
def init_db():
    conn = sqlite3.connect('formatfusion.db')
    c = conn.cursor()
    
    # Files table
    c.execute('''CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        original_format TEXT NOT NULL,
        converted_format TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        converted_path TEXT,
        status TEXT DEFAULT 'pending',
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completion_date TIMESTAMP,
        download_count INTEGER DEFAULT 0,
        user_email TEXT,
        error_message TEXT
    )''')
    
    # Admin users table
    c.execute('''CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Blog posts table
    c.execute('''CREATE TABLE IF NOT EXISTS blog_posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        author TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT,
        image_url TEXT,
        featured BOOLEAN DEFAULT 0,
        published BOOLEAN DEFAULT 1,
        publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_time TEXT,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Create admin user
    admin_id = str(uuid.uuid4())
    password_hash = generate_password_hash('admin123')
    c.execute('INSERT OR IGNORE INTO admin_users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
              (admin_id, 'admin', 'admin@formatfusion.com', password_hash))
    
    # Sample blog posts
    sample_posts = [
        {
            'id': str(uuid.uuid4()),
            'title': 'Complete Guide to PDF Conversion',
            'excerpt': 'Learn everything about converting PDFs to various formats.',
            'content': 'PDF conversion guide content here...',
            'author': 'Sarah Johnson',
            'category': 'Tutorials',
            'tags': '["PDF", "Conversion", "Documents"]',
            'featured': 1,
            'read_time': '8 min read'
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Image Format Wars: JPEG vs PNG vs WEBP',
            'excerpt': 'Discover which image format is best for your needs.',
            'content': 'Image format comparison content here...',
            'author': 'Mike Chen',
            'category': 'Technology',
            'tags': '["Images", "Web", "Performance"]',
            'featured': 1,
            'read_time': '6 min read'
        }
    ]
    
    for post in sample_posts:
        c.execute('''INSERT OR IGNORE INTO blog_posts 
                     (id, title, excerpt, content, author, category, tags, featured, read_time)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (post['id'], post['title'], post['excerpt'], post['content'],
                   post['author'], post['category'], post['tags'], post['featured'], post['read_time']))
    
    conn.commit()
    conn.close()

# File converter
class FileConverter:
    def convert_file(self, input_path, from_format, to_format, file_id):
        try:
            base_name = os.path.splitext(os.path.basename(input_path))[0]
            output_filename = f"{file_id}_{base_name}.{to_format.lower()}"
            output_path = os.path.join('uploads', 'converted', output_filename)
            
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Image conversion
            if from_format.upper() in ['JPG', 'JPEG', 'PNG', 'BMP', 'TIFF', 'WEBP']:
                with Image.open(input_path) as img:
                    if to_format.upper() in ['JPG', 'JPEG'] and img.mode in ['RGBA', 'LA']:
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                        img = background
                    
                    if to_format.upper() in ['JPG', 'JPEG']:
                        img.save(output_path, 'JPEG', quality=95)
                    else:
                        img.save(output_path, to_format.upper())
                
                time.sleep(random.uniform(1, 3))
                return True, output_path, None
            
            # Other formats - simulate conversion
            time.sleep(random.uniform(2, 6))
            shutil.copy2(input_path, output_path)
            return True, output_path, None
            
        except Exception as e:
            return False, None, str(e)

converter = FileConverter()

# Routes
@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy', 'message': 'FormatFusion API is running'})

@app.route('/api/files/upload', methods=['POST'])
def upload_files():
    try:
        files = request.files.getlist('files')
        from_format = request.form.get('fromFormat', '').upper()
        to_format = request.form.get('toFormat', '').upper()
        user_email = request.form.get('userEmail', '')
        
        uploaded_files = []
        conn = sqlite3.connect('formatfusion.db')
        c = conn.cursor()
        
        for file in files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                file_id = str(uuid.uuid4())
                file_path = os.path.join('uploads', f"{file_id}_{filename}")
                
                os.makedirs('uploads', exist_ok=True)
                file.save(file_path)
                
                c.execute('''INSERT INTO files 
                           (id, filename, original_format, converted_format, file_size, file_path, user_email, status)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                         (file_id, filename, from_format, to_format, os.path.getsize(file_path), 
                          file_path, user_email, 'pending'))
                
                uploaded_files.append({
                    'id': file_id,
                    'filename': filename,
                    'originalFormat': from_format,
                    'convertedFormat': to_format,
                    'fileSize': format_file_size(os.path.getsize(file_path)),
                    'status': 'pending'
                })
        
        conn.commit()
        conn.close()
        return jsonify({'files': uploaded_files}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/convert/start', methods=['POST'])
def start_conversion():
    try:
        data = request.get_json()
        file_ids = data.get('fileIds', [])
        
        conn = sqlite3.connect('formatfusion.db')
        c = conn.cursor()
        
        for file_id in file_ids:
            c.execute('UPDATE files SET status = ? WHERE id = ?', ('processing', file_id))
            thread = threading.Thread(target=convert_file_async, args=(file_id,))
            thread.daemon = True
            thread.start()
        
        conn.commit()
        conn.close()
        return jsonify({'message': 'Conversion started', 'fileIds': file_ids})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/convert/progress/<file_id>')
def get_conversion_progress(file_id):
    try:
        conn = sqlite3.connect('formatfusion.db')
        c = conn.cursor()
        c.execute('SELECT * FROM files WHERE id = ?', (file_id,))
        row = c.fetchone()
        conn.close()
        
        if not row:
            return jsonify({'error': 'File not found'}), 404
        
        progress = {'pending': 0, 'processing': 50, 'completed': 100, 'failed': 0}.get(row[7], 0)
        
        return jsonify({
            'id': row[0],
            'fileName': row[1],
            'fromFormat': row[2],
            'toFormat': row[3],
            'progress': progress,
            'status': row[7],
            'fileSize': format_file_size(row[4])
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        conn = sqlite3.connect('formatfusion.db')
        c = conn.cursor()
        c.execute('SELECT * FROM admin_users WHERE username = ?', (username,))
        admin = c.fetchone()
        conn.close()
        
        if admin and check_password_hash(admin[3], password):
            access_token = create_access_token(identity=admin[0], expires_delta=timedelta(hours=24))
            return jsonify({'access_token': access_token, 'admin': {'username': admin[1], 'email': admin[2]}})
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/stats')
def get_file_stats():
    try:
        conn = sqlite3.connect('formatfusion.db')
        c = conn.cursor()
        c.execute('SELECT COUNT(*) FROM files')
        total_files = c.fetchone()[0]
        c.execute('SELECT COUNT(*) FROM files WHERE status = "completed"')
        completed_files = c.fetchone()[0]
        c.execute('SELECT SUM(download_count) FROM files')
        total_downloads = c.fetchone()[0] or 0
        conn.close()
        
        success_rate = (completed_files / total_files * 100) if total_files > 0 else 0
        
        return jsonify({
            'totalFiles': total_files,
            'completedFiles': completed_files,
            'totalDownloads': total_downloads,
            'successRate': round(success_rate, 2)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog')
def get_blog_posts():
    try:
        conn = sqlite3.connect('formatfusion.db')
        c = conn.cursor()
        c.execute('SELECT * FROM blog_posts WHERE published = 1 ORDER BY publish_date DESC LIMIT 20')
        posts = c.fetchall()
        conn.close()
        
        blog_posts = []
        for post in posts:
            blog_posts.append({
                'id': post[0],
                'title': post[1],
                'excerpt': post[2],
                'content': post[3],
                'author': post[4],
                'category': post[5],
                'tags': json.loads(post[6]) if post[6] else [],
                'featured': bool(post[8]),
                'publishDate': post[10],
                'readTime': post[11],
                'views': post[12]
            })
        
        return jsonify({'posts': blog_posts})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/<post_id>')
def get_blog_post(post_id):
    try:
        conn = sqlite3.connect('formatfusion.db')
        c = conn.cursor()
        c.execute('SELECT * FROM blog_posts WHERE id = ?', (post_id,))
        post = c.fetchone()
        
        if post:
            c.execute('UPDATE blog_posts SET views = views + 1 WHERE id = ?', (post_id,))
            conn.commit()
        
        conn.close()
        
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        return jsonify({
            'id': post[0],
            'title': post[1],
            'excerpt': post[2],
            'content': post[3],
            'author': post[4],
            'category': post[5],
            'tags': json.loads(post[6]) if post[6] else [],
            'featured': bool(post[8]),
            'publishDate': post[10],
            'readTime': post[11],
            'views': post[12] + 1
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/<file_id>/download')
def download_file(file_id):
    try:
        conn = sqlite3.connect('formatfusion.db')
        c = conn.cursor()
        c.execute('SELECT * FROM files WHERE id = ?', (file_id,))
        file_record = c.fetchone()
        
        if not file_record or file_record[7] != 'completed':
            return jsonify({'error': 'File not ready'}), 400
        
        file_path = file_record[6] or file_record[5]  # converted_path or file_path
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        c.execute('UPDATE files SET download_count = download_count + 1 WHERE id = ?', (file_id,))
        conn.commit()
        conn.close()
        
        return send_file(file_path, as_attachment=True)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/files')
@jwt_required()
def get_admin_files():
    try:
        conn = sqlite3.connect('formatfusion.db')
        c = conn.cursor()
        c.execute('SELECT * FROM files ORDER BY upload_date DESC LIMIT 50')
        files = c.fetchall()
        conn.close()
        
        file_list = []
        for file in files:
            file_list.append({
                'id': file[0],
                'filename': file[1],
                'originalFormat': file[2],
                'convertedFormat': file[3],
                'fileSize': format_file_size(file[4]),
                'status': file[7],
                'uploadDate': file[8],
                'downloadCount': file[10],
                'userEmail': file[11]
            })
        
        return jsonify({'files': file_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    try:
        conn = sqlite3.connect('formatfusion.db')
        c = conn.cursor()
        c.execute('SELECT * FROM files WHERE id = ?', (file_id,))
        file_record = c.fetchone()
        
        if file_record:
            if os.path.exists(file_record[5]):
                os.remove(file_record[5])
            if file_record[6] and os.path.exists(file_record[6]):
                os.remove(file_record[6])
            
            c.execute('DELETE FROM files WHERE id = ?', (file_id,))
            conn.commit()
        
        conn.close()
        return jsonify({'message': 'File deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def convert_file_async(file_id):
    try:
        conn = sqlite3.connect('formatfusion.db')
        c = conn.cursor()
        c.execute('SELECT * FROM files WHERE id = ?', (file_id,))
        file_record = c.fetchone()
        
        if not file_record:
            return
        
        success, output_path, error_msg = converter.convert_file(
            file_record[5], file_record[2], file_record[3], file_id
        )
        
        if success:
            c.execute('UPDATE files SET status = ?, converted_path = ?, completion_date = ? WHERE id = ?',
                     ('completed', output_path, datetime.now().isoformat(), file_id))
        else:
            c.execute('UPDATE files SET status = ?, error_message = ? WHERE id = ?',
                     ('failed', error_msg, file_id))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        conn = sqlite3.connect('formatfusion.db')
        c = conn.cursor()
        c.execute('UPDATE files SET status = ?, error_message = ? WHERE id = ?',
                 ('failed', str(e), file_id))
        conn.commit()
        conn.close()

def format_file_size(bytes_size):
    if bytes_size == 0:
        return '0 Bytes'
    k = 1024
    sizes = ['Bytes', 'KB', 'MB', 'GB']
    i = 0
    while bytes_size >= k and i < len(sizes) - 1:
        bytes_size /= k
        i += 1
    return f"{bytes_size:.2f} {sizes[i]}"

if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('uploads/converted', exist_ok=True)
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)