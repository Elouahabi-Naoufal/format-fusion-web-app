from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db
from models.admin_model import AdminUser, AdminContent
from models.file_model import FileRecord
from models.blog_model import BlogPost
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
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

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        # File statistics
        total_files = FileRecord.query.count()
        completed_files = FileRecord.query.filter(FileRecord.status == 'completed').count()
        processing_files = FileRecord.query.filter(FileRecord.status == 'processing').count()
        failed_files = FileRecord.query.filter(FileRecord.status == 'failed').count()
        
        # Blog statistics
        total_posts = BlogPost.query.count()
        published_posts = BlogPost.query.filter(BlogPost.published == True).count()
        featured_posts = BlogPost.query.filter(BlogPost.featured == True).count()
        
        # Recent activity
        recent_files = FileRecord.query.order_by(FileRecord.upload_date.desc()).limit(5).all()
        recent_posts = BlogPost.query.order_by(BlogPost.created_at.desc()).limit(5).all()
        
        return jsonify({
            'fileStats': {
                'total': total_files,
                'completed': completed_files,
                'processing': processing_files,
                'failed': failed_files
            },
            'blogStats': {
                'total': total_posts,
                'published': published_posts,
                'featured': featured_posts
            },
            'recentFiles': [file.to_dict() for file in recent_files],
            'recentPosts': [post.to_dict() for post in recent_posts]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/content/<page>', methods=['GET'])
def get_page_content(page):
    try:
        content = AdminContent.query.filter_by(page=page).first()
        if content:
            return jsonify(content.to_dict())
        else:
            return jsonify({
                'page': page,
                'title': f'{page.title()} Page',
                'content': f'Content for {page} page will be displayed here.'
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/content/<page>', methods=['PUT'])
@jwt_required()
def update_page_content(page):
    try:
        admin_id = get_jwt_identity()
        data = request.get_json()
        
        content = AdminContent.query.filter_by(page=page).first()
        
        if content:
            content.title = data.get('title', content.title)
            content.content = data.get('content', content.content)
            content.updated_by = admin_id
            content.updated_at = datetime.utcnow()
        else:
            content = AdminContent(
                page=page,
                title=data.get('title', f'{page.title()} Page'),
                content=data.get('content', ''),
                updated_by=admin_id
            )
            db.session.add(content)
        
        db.session.commit()
        return jsonify(content.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/files', methods=['GET'])
@jwt_required()
def get_admin_files():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        search = request.args.get('search', '')
        
        query = FileRecord.query
        
        if status and status != 'all':
            query = query.filter(FileRecord.status == status)
        
        if search:
            query = query.filter(
                db.or_(
                    FileRecord.filename.contains(search),
                    FileRecord.user_email.contains(search)
                )
            )
        
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

@admin_bp.route('/blog', methods=['GET'])
@jwt_required()
def get_admin_blog_posts():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category = request.args.get('category')
        search = request.args.get('search', '')
        
        query = BlogPost.query
        
        if category and category != 'all':
            query = query.filter(BlogPost.category == category)
        
        if search:
            query = query.filter(
                db.or_(
                    BlogPost.title.contains(search),
                    BlogPost.author.contains(search)
                )
            )
        
        posts = query.order_by(BlogPost.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'posts': [post.to_dict() for post in posts.items],
            'total': posts.total,
            'pages': posts.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500