from flask import Flask
from flask_cors import CORS
from sqlalchemy import text
from app.models import db
import os

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///:memory:')
    db.init_app(app)
    
    from app.routes.dashboard import dashboard_bp
    app.register_blueprint(dashboard_bp)
    
    with app.app_context():
        db.drop_all()
        db.create_all()
        try:
            with open('scripts/mockup_data.sql', 'r') as f:
                sql_script = f.read()
            db.session.execute(text(sql_script))
            db.session.commit()
            print("Database seeded successfully with raw SQL!")
        except Exception as e:
            db.session.rollback()
            print(f"Error seeding database: {e}")
    return app