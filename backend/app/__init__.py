from flask import Flask
from app.models import db
import os

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    db.init_app(app)
    with app.app_context():
        db.create_all()
    return app