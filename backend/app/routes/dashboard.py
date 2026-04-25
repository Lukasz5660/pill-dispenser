from flask import Blueprint, jsonify
from app.models import db, User, Medication, MedicationChamber, Device

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/<int:account_id>', methods=['GET'])
def get_dashboard(account_id):
    users = db.session.scalars(db.select(User).filter_by(account_id=account_id)).all()
    user_list = []
    for user in users:
        user_list.append({
            'id': str(user.user_id),
            'name': user.username,
            'initial': user.username[0].upper() if user.username else '?'
        })
        
    medications = db.session.scalars(db.select(Medication).filter_by(account_id=account_id)).all()
    med_list = []
    for med in medications:
        chamber = db.session.scalars(db.select(MedicationChamber).filter_by(medication_id=med.medication_id)).first()
        stock = chamber.stock if chamber else 0
        med_list.append({
            'id': str(med.medication_id),
            'name': med.med_name,
            'remaining': stock
        })
        
    device = db.session.scalars(db.select(Device).filter_by(account_id=account_id)).first()
    device_data = None
    if device:
        device_data = {
            'model': device.model.model_name if device.model else "Unknown",
            'last_heartbeat': device.last_heartbeat.isoformat() + "Z" if device.last_heartbeat else None
        }

    return jsonify({
        'users': user_list,
        'medicines': med_list,
        'device': device_data
    })
