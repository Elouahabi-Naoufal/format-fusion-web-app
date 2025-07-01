#!/usr/bin/env python3
"""
Production runner for FormatFusion Flask API
"""

import os
from app import app, db

if __name__ == '__main__':
    # Ensure directories exist
    os.makedirs('database', exist_ok=True)
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('uploads/converted', exist_ok=True)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    # Run the application
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)