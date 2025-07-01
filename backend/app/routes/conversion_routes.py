from flask import Blueprint, request, jsonify
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db
from models.file_model import FileRecord
from utils.converter import FileConverter
import threading
from datetime import datetime

conversion_bp = Blueprint('conversion', __name__)

@conversion_bp.route('/start', methods=['POST'])
def start_conversion():
    try:
        data = request.get_json()
        file_ids = data.get('fileIds', [])
        
        if not file_ids:
            return jsonify({'error': 'No file IDs provided'}), 400
        
        # Start conversion process for each file
        for file_id in file_ids:
            file_record = FileRecord.query.get(file_id)
            if file_record and file_record.status == 'pending':
                file_record.status = 'processing'
                db.session.commit()
                
                # Start conversion in background thread
                thread = threading.Thread(
                    target=convert_file_async,
                    args=(file_id,)
                )
                thread.daemon = True
                thread.start()
        
        return jsonify({'message': 'Conversion started', 'fileIds': file_ids})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@conversion_bp.route('/status/<file_id>', methods=['GET'])
def get_conversion_status(file_id):
    try:
        file_record = FileRecord.query.get_or_404(file_id)
        return jsonify({
            'id': file_record.id,
            'status': file_record.status,
            'progress': get_progress_percentage(file_record.status),
            'errorMessage': file_record.error_message
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@conversion_bp.route('/progress/<file_id>', methods=['GET'])
def get_conversion_progress(file_id):
    try:
        file_record = FileRecord.query.get_or_404(file_id)
        progress = get_progress_percentage(file_record.status)
        
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
    """Background task to convert file"""
    try:
        file_record = FileRecord.query.get(file_id)
        if not file_record:
            return
        
        converter = FileConverter()
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
        file_record = FileRecord.query.get(file_id)
        if file_record:
            file_record.status = 'failed'
            file_record.error_message = str(e)
            db.session.commit()

def get_progress_percentage(status):
    """Convert status to progress percentage"""
    status_progress = {
        'pending': 0,
        'processing': 50,
        'completed': 100,
        'failed': 0
    }
    return status_progress.get(status, 0)