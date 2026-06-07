from flask import Flask
from flask_cors import CORS
from sqlalchemy import text
from app.models import db
from app.services.mqtt_service import init_mqtt
import os
import sys
import logging

def create_app():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[logging.StreamHandler(sys.stdout)]
    )
    
    app = Flask(__name__)
    CORS(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    db.init_app(app)
    from app.routes.dashboard import dashboard_bp
    from app.routes.users import users_bp
    from app.routes.medicines import medicines_bp
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(medicines_bp)

    with app.app_context():
        db.drop_all()
        db.create_all()
        try:
            with open('scripts/mockup_data.sql', 'r') as f:
                sql_script = f.read()
            db.session.execute(text(sql_script))
            db.session.commit()
            logging.getLogger(__name__).info("DB: Seeded successfully with raw SQL")
        except Exception as e:
            db.session.rollback()
            logging.getLogger(__name__).error(f"DB: Error seeding database - {e}")
            
    init_mqtt(app)
    return app