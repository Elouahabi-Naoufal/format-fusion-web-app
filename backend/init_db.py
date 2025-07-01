#!/usr/bin/env python3
"""
Database initialization script for FormatFusion
"""

import os
import sys
import json
from datetime import datetime

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from app.models.file_model import FileRecord
from app.models.blog_model import BlogPost
from app.models.admin_model import AdminUser, AdminContent

def init_database():
    """Initialize database with tables and sample data"""
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("✓ Database tables created")
        
        # Create admin user
        admin = AdminUser.query.filter_by(username='admin').first()
        if not admin:
            admin = AdminUser(
                username='admin',
                email='admin@formatfusion.com'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            print("✓ Admin user created (username: admin, password: admin123)")
        
        # Create sample blog posts
        if BlogPost.query.count() == 0:
            sample_posts = [
                {
                    'title': 'Complete Guide to PDF Conversion: Best Practices and Tips',
                    'excerpt': 'Learn everything you need to know about converting PDFs to and from various formats while maintaining quality and formatting.',
                    'content': '''# Complete Guide to PDF Conversion

PDF files are ubiquitous in the digital world, but sometimes you need to convert them to other formats or create PDFs from different file types. This comprehensive guide will walk you through everything you need to know about PDF conversion.

## Why Convert PDFs?

There are several reasons why you might need to convert PDF files:

- **Editing Requirements**: PDFs are not easily editable, so converting to Word or other formats allows for modifications
- **Compatibility**: Some systems or applications may not support PDF files
- **Size Optimization**: Converting to other formats can sometimes reduce file size
- **Content Extraction**: Extract text, images, or data from PDFs for other uses

## Best Practices for PDF Conversion

### 1. Choose the Right Output Format

Different formats serve different purposes:
- **Word (DOCX)**: Best for editing text content
- **Excel (XLSX)**: Ideal for tabular data extraction
- **PowerPoint (PPTX)**: Great for presentation content
- **Images (JPG/PNG)**: Perfect for visual content preservation

### 2. Maintain Quality

When converting PDFs:
- Use high-resolution settings for image outputs
- Preserve formatting as much as possible
- Check for OCR accuracy in scanned documents
- Verify that all content is properly converted

## Conclusion

PDF conversion is a powerful tool that can significantly improve your document workflow. By following these best practices and understanding the strengths of different formats, you can ensure high-quality conversions that meet your specific needs.''',
                    'author': 'Sarah Johnson',
                    'category': 'Tutorials',
                    'tags': json.dumps(['PDF', 'Conversion', 'Documents', 'Tips']),
                    'image_url': 'photo-1498050108023-c5249f4df085',
                    'featured': True,
                    'read_time': '8 min read'
                },
                {
                    'title': 'Image Format Wars: JPEG vs PNG vs WEBP - Which Should You Choose?',
                    'excerpt': 'Dive deep into the world of image formats and discover which format is best for your specific needs in 2024.',
                    'content': '''# Image Format Wars: JPEG vs PNG vs WEBP

Choosing the right image format can significantly impact your website's performance, storage costs, and user experience. Let's explore the strengths and weaknesses of the most popular image formats.

## JPEG: The Old Reliable

JPEG has been the standard for photography and complex images for decades.

**Pros:**
- Excellent compression for photographs
- Universal browser support
- Small file sizes for complex images
- Adjustable quality settings

**Cons:**
- Lossy compression reduces quality
- No transparency support
- Not ideal for images with text or sharp edges

## PNG: The Quality Champion

PNG offers lossless compression and advanced features that make it ideal for certain use cases.

**Pros:**
- Lossless compression maintains perfect quality
- Supports transparency (alpha channel)
- Great for images with text, logos, and sharp edges

**Cons:**
- Larger file sizes than JPEG
- Not ideal for photographs

## WEBP: The Modern Contender

Google's WEBP format aims to combine the best of both worlds.

**Pros:**
- Superior compression compared to JPEG and PNG
- Supports both lossy and lossless compression
- Transparency support
- Animation support

**Cons:**
- Limited browser support (though improving rapidly)
- Not all image editing tools support it

## Conclusion

There's no one-size-fits-all solution. The best format depends on your specific needs, target audience, and technical constraints.''',
                    'author': 'Mike Chen',
                    'category': 'Technology',
                    'tags': json.dumps(['Images', 'Web', 'Performance', 'Formats']),
                    'image_url': 'photo-1488590528505-98d2b5aba04b',
                    'featured': True,
                    'read_time': '6 min read'
                }
            ]
            
            for post_data in sample_posts:
                post = BlogPost(**post_data)
                db.session.add(post)
            
            print("✓ Sample blog posts created")
        
        # Create sample admin content
        if AdminContent.query.count() == 0:
            content_pages = [
                {
                    'page': 'terms',
                    'title': 'Terms of Service',
                    'content': '''# Terms of Service

Welcome to FormatFusion. By using our service, you agree to these terms.

## 1. Service Description

FormatFusion provides file conversion services that allow users to convert files between different formats.

## 2. User Responsibilities

- You are responsible for the content you upload
- Do not upload copyrighted material without permission
- Do not upload malicious files or content

## 3. Privacy

We respect your privacy and do not store your files permanently. All uploaded files are automatically deleted after 24 hours.

## 4. Limitations

- Maximum file size: 100MB
- Maximum 10 files per conversion
- Some format combinations may not be supported

## 5. Contact

If you have questions about these terms, please contact us at legal@formatfusion.com.'''
                },
                {
                    'page': 'privacy',
                    'title': 'Privacy Policy',
                    'content': '''# Privacy Policy

Your privacy is important to us. This policy explains how we collect, use, and protect your information.

## Information We Collect

- Files you upload for conversion
- Basic usage analytics
- Email addresses (if provided)

## How We Use Information

- To provide file conversion services
- To improve our service quality
- To communicate with users when necessary

## Data Retention

- Uploaded files are automatically deleted after 24 hours
- Conversion history is kept for 30 days
- Analytics data is anonymized

## Security

We use industry-standard security measures to protect your data during transmission and processing.

## Contact

For privacy concerns, contact us at privacy@formatfusion.com.'''
                }
            ]
            
            for content_data in content_pages:
                content = AdminContent(
                    **content_data,
                    updated_by=admin.id
                )
                db.session.add(content)
            
            print("✓ Sample admin content created")
        
        # Commit all changes
        db.session.commit()
        print("✓ Database initialization completed successfully!")
        
        print("\n" + "="*50)
        print("SETUP COMPLETE!")
        print("="*50)
        print("Admin Login:")
        print("  Username: admin")
        print("  Password: admin123")
        print("\nAPI Base URL: http://localhost:5000/api")
        print("Admin Dashboard: http://localhost:5173/admin")
        print("="*50)

if __name__ == '__main__':
    init_database()