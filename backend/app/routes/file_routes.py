from flask import Blueprint, request, jsonify, send_file
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db
from models.file_model import FileRecord
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime

file_bp = Blueprint('files', __name__)

ALLOWED_EXTENSIONS = {
    'pdf', 'docx', 'txt', 'rtf', 'odt', 'pages',
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg',
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a',
    'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv',
    'zip', 'rar', '7z', 'tar', 'gz',
    'html', 'css', 'js', 'json', 'xml', 'csv'
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@file_bp.route('/upload', methods=['POST'])
def upload_files():
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        from_format = request.form.get('fromFormat', '').upper()
        to_format = request.form.get('toFormat', '').upper()
        user_email = request.form.get('userEmail', '')
        
        if not from_format or not to_format:
            return jsonify({'error': 'Format information required'}), 400
        
        uploaded_files = []
        
        for file in files:
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_id = str(uuid.uuid4())
                file_path = os.path.join('uploads', f"{file_id}_{filename}")
                
                # Ensure upload directory exists
                os.makedirs('uploads', exist_ok=True)
                file.save(file_path)
                
                # Create file record
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
        return jsonify({'files': uploaded_files}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@file_bp.route('/', methods=['GET'])
def get_files():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        
        query = FileRecord.query
        
        if status:
            query = query.filter(FileRecord.status == status)
        
        files = query.order_by(FileRecord.upload_date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'files': [file.to_dict() for file in files.items],
            'total': files.total,
            'pages': files.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_bp.route('/<file_id>', methods=['GET'])
def get_file(file_id):
    try:
        file_record = FileRecord.query.get_or_404(file_id)
        return jsonify(file_record.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_bp.route('/<file_id>/download', methods=['GET'])
def download_file(file_id):
    try:
        file_record = FileRecord.query.get_or_404(file_id)
        
        if file_record.status != 'completed':
            return jsonify({'error': 'File not ready for download'}), 400
        
        file_path = file_record.converted_path or file_record.file_path
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        # Increment download count
        file_record.download_count += 1
        db.session.commit()
        
        return send_file(file_path, as_attachment=True)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_bp.route('/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    try:
        file_record = FileRecord.query.get_or_404(file_id)
        
        # Delete physical files
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

@file_bp.route('/stats', methods=['GET'])
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