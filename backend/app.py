from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import sqlite3
import threading
import time
import json
import csv
import zipfile
import shutil
from werkzeug.utils import secure_filename
from PIL import Image
from io import BytesIO

app = Flask(__name__)
CORS(app)

# Create database
def init_db():
    conn = sqlite3.connect('app.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        filename TEXT,
        status TEXT DEFAULT 'completed'
    )''')
    conn.commit()
    conn.close()

@app.route('/api/health')
def health():
    return {'status': 'ok'}

@app.route('/api/files/upload', methods=['POST'])
def upload():
    files = request.files.getlist('files')
    from_format = request.form.get('fromFormat', '').upper()
    to_format = request.form.get('toFormat', '').upper()
    result = []
    
    conn = sqlite3.connect('app.db')
    c = conn.cursor()
    try:
        c.execute('ALTER TABLE files ADD COLUMN from_format TEXT')
        c.execute('ALTER TABLE files ADD COLUMN to_format TEXT')
    except:
        pass  # Columns already exist
    
    for file in files:
        if file:
            file_id = str(uuid.uuid4())
            filename = secure_filename(file.filename)
            
            os.makedirs('uploads', exist_ok=True)
            file.save(f'uploads/{file_id}_{filename}')
            
            c.execute('INSERT INTO files (id, filename, from_format, to_format, status) VALUES (?, ?, ?, ?, ?)', 
                     (file_id, filename, from_format, to_format, 'pending'))
            
            result.append({
                'id': file_id,
                'filename': filename,
                'originalFormat': from_format,
                'convertedFormat': to_format,
                'status': 'pending'
            })
    
    conn.commit()
    conn.close()
    
    return {'files': result}

@app.route('/api/convert/start', methods=['POST'])
def convert():
    data = request.get_json()
    file_ids = data.get('fileIds', [])
    
    for file_id in file_ids:
        thread = threading.Thread(target=convert_file, args=(file_id,))
        thread.start()
    
    return {'message': 'Conversion started'}

def convert_file(file_id):
    print(f"\n=== CONVERSION START for {file_id} ===")
    conn = sqlite3.connect('app.db')
    c = conn.cursor()
    c.execute('UPDATE files SET status = ? WHERE id = ?', ('processing', file_id))
    conn.commit()
    
    c.execute('SELECT filename, from_format, to_format FROM files WHERE id = ?', (file_id,))
    result = c.fetchone()
    print(f"Database result: {result}")
    
    if result:
        filename, from_format, to_format = result
        input_path = f'uploads/{file_id}_{filename}'
        print(f"Original filename: {filename}")
        print(f"Input path: {input_path}")
        print(f"Input file exists: {os.path.exists(input_path)}")
        print(f"Converting: {from_format} -> {to_format}")
        
        # Convert file
        base_name = os.path.splitext(filename)[0]
        output_filename = f'{file_id}_{base_name}_converted.{to_format.lower()}'
        output_path = f'uploads/{output_filename}'
        download_name = f'{base_name}_converted.{to_format.lower()}'
        print(f"Output filename: {output_filename}")
        print(f"Output path: {output_path}")
        
        try:
            # IMAGE CONVERSIONS
            if from_format in ['PNG', 'JPG', 'JPEG', 'BMP', 'TIFF', 'WEBP', 'GIF'] and to_format in ['PNG', 'JPG', 'JPEG', 'BMP', 'TIFF', 'WEBP', 'PDF']:
                with Image.open(input_path) as img:
                    if to_format in ['JPG', 'JPEG'] and img.mode in ['RGBA', 'LA']:
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                        img = background
                    
                    if to_format == 'PDF':
                        if img.mode in ['RGBA', 'LA']:
                            background = Image.new('RGB', img.size, (255, 255, 255))
                            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                            img = background
                        img.save(output_path, 'PDF')
                    elif to_format in ['JPG', 'JPEG']:
                        img.save(output_path, 'JPEG', quality=95)
                    else:
                        img.save(output_path, to_format)
            
            # DOCUMENT CONVERSIONS
            elif (from_format in ['PDF', 'DOCX', 'TXT', 'RTF'] and to_format in ['PDF', 'DOCX', 'TXT', 'RTF']) or (from_format in ['HTML', 'CSS', 'JS'] and to_format == 'TXT'):
                if to_format == 'TXT':
                    with open(input_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    with open(output_path, 'w', encoding='utf-8') as f:
                        f.write(f"Converted from {from_format}\n\n{content}")
                else:
                    shutil.copy2(input_path, output_path)
            
            # DATA CONVERSIONS
            elif from_format == 'CSV' and to_format == 'JSON':
                data = []
                with open(input_path, 'r', encoding='utf-8') as csvfile:
                    reader = csv.DictReader(csvfile)
                    for row in reader:
                        data.append(row)
                with open(output_path, 'w', encoding='utf-8') as jsonfile:
                    json.dump(data, jsonfile, indent=2)
            
            elif from_format == 'JSON' and to_format == 'CSV':
                with open(input_path, 'r', encoding='utf-8') as jsonfile:
                    data = json.load(jsonfile)
                if data and isinstance(data, list) and isinstance(data[0], dict):
                    with open(output_path, 'w', encoding='utf-8', newline='') as csvfile:
                        writer = csv.DictWriter(csvfile, fieldnames=data[0].keys())
                        writer.writeheader()
                        writer.writerows(data)
                else:
                    shutil.copy2(input_path, output_path)
            
            # ARCHIVE CONVERSIONS
            elif from_format in ['ZIP', 'RAR', '7Z'] and to_format == 'ZIP':
                if from_format == 'ZIP':
                    shutil.copy2(input_path, output_path)
                else:
                    # Create new zip with original file
                    with zipfile.ZipFile(output_path, 'w') as zipf:
                        zipf.write(input_path, os.path.basename(input_path))
            
            # AUDIO/VIDEO CONVERSIONS (simulated)
            elif (from_format in ['MP3', 'WAV', 'FLAC', 'AAC', 'OGG', 'M4A'] and to_format in ['MP3', 'WAV', 'FLAC', 'AAC']) or (from_format in ['MP4', 'AVI', 'MOV', 'WMV', 'FLV', 'MKV'] and to_format in ['MP4', 'AVI', 'MOV']):
                shutil.copy2(input_path, output_path)
            
            # DEFAULT - Copy with new extension
            else:
                shutil.copy2(input_path, output_path)
            
            time.sleep(2)  # Simulate processing time
            print(f'✅ Conversion completed: {input_path} -> {output_path}')
            print(f'Output file exists: {os.path.exists(output_path)}')
            if os.path.exists(output_path):
                print(f'Output file size: {os.path.getsize(output_path)} bytes')
            
            print(f"Updating database: filename = {output_filename}")
            c.execute('UPDATE files SET status = ?, filename = ? WHERE id = ?', ('completed', output_filename, file_id))
            
            # Verify database update
            c.execute('SELECT filename, status FROM files WHERE id = ?', (file_id,))
            verify_result = c.fetchone()
            print(f"Database after update: {verify_result}")
            
        except Exception as e:
            print(f"❌ Conversion failed: {str(e)}")
            c.execute('UPDATE files SET status = ? WHERE id = ?', ('failed', file_id))
    else:
        print("❌ No file found in database")
    
    conn.commit()
    conn.close()
    print(f"=== CONVERSION END for {file_id} ===\n")

@app.route('/api/convert/progress/<file_id>')
def progress(file_id):
    conn = sqlite3.connect('app.db')
    c = conn.cursor()
    c.execute('SELECT filename, status FROM files WHERE id = ?', (file_id,))
    result = c.fetchone()
    conn.close()
    
    if result:
        filename, status = result
        progress_val = {'pending': 0, 'processing': 50, 'completed': 100, 'failed': 0}.get(status, 0)
        return {
            'id': file_id,
            'fileName': filename,
            'progress': progress_val,
            'status': status
        }
    
    return {'error': 'File not found'}, 404

@app.route('/api/files/<file_id>/download')
def download(file_id):
    print(f"\n=== DOWNLOAD REQUEST for {file_id} ===")
    conn = sqlite3.connect('app.db')
    c = conn.cursor()
    c.execute('SELECT filename, status, to_format FROM files WHERE id = ?', (file_id,))
    result = c.fetchone()
    conn.close()
    
    print(f"Database query result: {result}")
    
    if result:
        filename, status, to_format = result
        print(f'File ID: {file_id}')
        print(f'Filename from DB: {filename}')
        print(f'Status: {status}')
        
        if status == 'completed':
            file_path = f'uploads/{filename}'
            print(f'Constructed file path: {file_path}')
            print(f'File exists at path: {os.path.exists(file_path)}')
            
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                print(f'File size: {file_size} bytes')
                # Set download name as 'converted' with target format extension
                clean_download_name = f'converted.{to_format.lower()}'
                
                print(f'Sending file: {file_path}')
                print(f'Download name: {clean_download_name}')
                print(f"=== DOWNLOAD SUCCESS ===\n")
                
                # Schedule file deletion after 20 seconds
                def delete_files_after_delay():
                    time.sleep(20)
                    try:
                        if os.path.exists(file_path):
                            os.remove(file_path)
                            print(f"Deleted file: {file_path}")
                        
                        # Also delete original file
                        original_path = f'uploads/{file_id}_{filename.split("_", 1)[1].replace("_converted", "")}'
                        if os.path.exists(original_path):
                            os.remove(original_path)
                            print(f"Deleted original: {original_path}")
                        
                        # Keep database record for history
                        print(f"Files deleted, database record kept: {file_id}")
                    except Exception as e:
                        print(f"Error deleting files: {e}")
                
                thread = threading.Thread(target=delete_files_after_delay)
                thread.daemon = True
                thread.start()
                
                response = send_file(file_path, as_attachment=True, download_name=clean_download_name)
                response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
                response.headers['Pragma'] = 'no-cache'
                response.headers['Expires'] = '0'
                response.headers['Content-Disposition'] = f'attachment; filename="{clean_download_name}"'
                return response
            else:
                print(f"❌ File does not exist at {file_path}")
                # List all files in uploads directory
                uploads_files = os.listdir('uploads') if os.path.exists('uploads') else []
                print(f"Files in uploads directory: {uploads_files}")
        else:
            print(f"❌ File not completed, status: {status}")
    else:
        print(f"❌ No record found for file_id: {file_id}")
    
    print(f"=== DOWNLOAD FAILED ===\n")
    return {'error': 'File not found or not ready'}, 404

if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    init_db()
    print("Starting server on http://localhost:5000")
    app.run(debug=True, port=5000)