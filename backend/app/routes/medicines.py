from flask import Blueprint, jsonify, request
from app.models import db, Medication, Chamber, MedicationChamber, Device, DeviceModel

medicines_bp = Blueprint('medicines', __name__, url_prefix='/api/medicines')

@medicines_bp.route('', methods=['GET'])
def get_medicines():
    account_id = request.args.get('account_id', 1, type=int)

    medications = db.session.scalars(
        db.select(Medication).filter_by(account_id=account_id)
    ).all()

    result = []
    for med in medications:
        chamber_link = next((mc for mc in med.chambers), None)
        result.append({
            'id': str(med.medication_id),
            'name': med.med_name,
            'chamber': chamber_link.chamber.chamber_number if chamber_link else None,
            'remaining': chamber_link.stock if chamber_link else 0
        })

    return jsonify(result)

@medicines_bp.route('', methods=['POST'])
def add_medicine():
    data = request.json
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    med_name = data.get('med_name')
    chamber_number = data.get('chamber_number')
    account_id = data.get('account_id', 1)

    if not med_name or not chamber_number:
        return jsonify({'error': 'Medicine name and chamber number are required'}), 400

    try:
        chamber_number = int(chamber_number)
    except ValueError:
        return jsonify({'error': 'Chamber number must be an integer'}), 400

    device = db.session.scalar(db.select(Device).filter_by(account_id=account_id).limit(1))

    if not device:
        return jsonify({'error': 'No device found for this account'}), 400

    if chamber_number < 1 or chamber_number > device.model.chamber_number:
        return jsonify({
            'error': f'Invalid chamber number. Device {device.model.model_name} supports chambers 1 to {device.model.chamber_number}.'
        }), 400

    existing_chamber = db.session.scalar(
        db.select(Chamber).filter_by(device_id=device.device_id, chamber_number=chamber_number)
    )

    if existing_chamber and existing_chamber.medication_links:
        return jsonify({'error': f'Chamber {chamber_number} is already occupied by another medication.'}), 400

    try:
        new_med = Medication(account_id=account_id, med_name=med_name)
        db.session.add(new_med)
        db.session.flush()
        if not existing_chamber:
            existing_chamber = Chamber(device_id=device.device_id, chamber_number=chamber_number)
            db.session.add(existing_chamber)
            db.session.flush()

        med_chamber_link = MedicationChamber(
            chamber_id=existing_chamber.chamber_id,
            medication_id=new_med.medication_id,
            stock=0
        )
        db.session.add(med_chamber_link)

        db.session.commit()

        return jsonify({
            'message': 'Medicine added successfully',
            'medicine': {
                'id': str(new_med.medication_id),
                'name': new_med.med_name,
                'chamber': chamber_number,
                'remaining': 0
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@medicines_bp.route('/<int:med_id>', methods=['DELETE'])
def delete_medicine(med_id):
    medication = db.session.get(Medication, med_id)
    if not medication:
        return jsonify({'error': 'Medicine not found'}), 404

    try:
        for mc in medication.chambers:
            db.session.delete(mc)

        db.session.delete(medication)
        db.session.commit()

        return jsonify({'message': 'Medicine deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
