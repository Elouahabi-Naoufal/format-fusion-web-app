from flask import Blueprint, request, jsonify
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db
from models.blog_model import BlogPost
import json

blog_bp = Blueprint('blog', __name__)

@blog_bp.route('/', methods=['GET'])
def get_blog_posts():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        category = request.args.get('category')
        featured = request.args.get('featured', type=bool)
        
        query = BlogPost.query.filter(BlogPost.published == True)
        
        if category and category != 'All':
            query = query.filter(BlogPost.category == category)
        
        if featured is not None:
            query = query.filter(BlogPost.featured == featured)
        
        posts = query.order_by(BlogPost.publish_date.desc()).paginate(
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

@blog_bp.route('/<post_id>', methods=['GET'])
def get_blog_post(post_id):
    try:
        post = BlogPost.query.get_or_404(post_id)
        
        # Increment view count
        post.views += 1
        db.session.commit()
        
        return jsonify(post.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blog_bp.route('/', methods=['POST'])
def create_blog_post():
    try:
        data = request.get_json()
        
        post = BlogPost(
            title=data['title'],
            excerpt=data.get('excerpt', ''),
            content=data['content'],
            author=data['author'],
            category=data['category'],
            tags=json.dumps(data.get('tags', [])),
            image_url=data.get('image', ''),
            featured=data.get('featured', False),
            published=data.get('published', True),
            read_time=data.get('readTime', '5 min read')
        )
        
        db.session.add(post)
        db.session.commit()
        
        return jsonify(post.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@blog_bp.route('/<post_id>', methods=['PUT'])
def update_blog_post(post_id):
    try:
        post = BlogPost.query.get_or_404(post_id)
        data = request.get_json()
        
        post.title = data.get('title', post.title)
        post.excerpt = data.get('excerpt', post.excerpt)
        post.content = data.get('content', post.content)
        post.author = data.get('author', post.author)
        post.category = data.get('category', post.category)
        post.tags = json.dumps(data.get('tags', json.loads(post.tags or '[]')))
        post.image_url = data.get('image', post.image_url)
        post.featured = data.get('featured', post.featured)
        post.published = data.get('published', post.published)
        post.read_time = data.get('readTime', post.read_time)
        
        db.session.commit()
        
        return jsonify(post.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@blog_bp.route('/<post_id>', methods=['DELETE'])
def delete_blog_post(post_id):
    try:
        post = BlogPost.query.get_or_404(post_id)
        db.session.delete(post)
        db.session.commit()
        
        return jsonify({'message': 'Blog post deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@blog_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = db.session.query(BlogPost.category).distinct().all()
        category_list = [cat[0] for cat in categories]
        return jsonify({'categories': category_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blog_bp.route('/featured', methods=['GET'])
def get_featured_posts():
    try:
        posts = BlogPost.query.filter(
            BlogPost.featured == True,
            BlogPost.published == True
        ).order_by(BlogPost.publish_date.desc()).limit(6).all()
        
        return jsonify({'posts': [post.to_dict() for post in posts]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500