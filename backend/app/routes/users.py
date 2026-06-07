from flask import Blueprint, jsonify, request, current_app
from app.models import db, User, DispenseTime, Schedule, DispenseTimeSchedule, Medication, Device, NotificationLog, DispenseLog
from app.services.mqtt_service import publish_sync
from datetime import datetime, date, timedelta
from app.routes.utils import _get_device_id_for_account
import logging

logger = logging.getLogger(__name__)

users_bp = Blueprint('users', __name__, url_prefix='/api/users')



@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    dispense_times = db.session.scalars(
        db.select(DispenseTime).filter_by(user_id=user_id).order_by(DispenseTime.time)
    ).all()

    schedules = db.session.scalars(
        db.select(Schedule).filter_by(user_id=user_id)
    ).all()

    edit_medications = []
    for sch in schedules:
        edit_medications.append({
            'id': str(sch.medication_id),
            'name': sch.medication.med_name,
            'endDate': sch.end_time.strftime('%Y-%m-%d')
        })

    schedule_data = []
    edit_assignments = {}
    for dt in dispense_times:
        medications = []
        time_str = dt.time.strftime('%H:%M')
        time_str_edit = time_str
        
        edit_assignments[time_str_edit] = []

        for dts in dt.dts_entries:
            medications.append({
                'amount': str(dts.dosage),
                'name': dts.schedule.medication.med_name
            })
            edit_assignments[time_str_edit].append({
                'id': str(dts.schedule.medication_id),
                'name': dts.schedule.medication.med_name,
                'dosage': dts.dosage
            })

        if time_str.startswith('0'):
            time_str = time_str[1:]

        schedule_data.append({
            'time': time_str,
            'medications': medications
        })

    logger.info(f"User: {user_id} fetched")
    return jsonify({
        'user': {
            'id': user.user_id,
            'name': user.username
        },
        'schedule': schedule_data,
        'editPayload': {
            'medications': edit_medications,
            'assignments': edit_assignments
        }
    })

@users_bp.route('', methods=['GET'])
def get_users():
    account_id = request.args.get('account_id', 1, type=int)
    users = db.session.scalars(db.select(User).filter_by(account_id=account_id)).all()
    user_list = []
    for user in users:
        user_list.append({
            'id': str(user.user_id),
            'name': user.username,
            'initial': user.username[0].upper() if user.username else '?'
        })
    logger.info(f"Users: fetched for account {account_id}")
    return jsonify({'users': user_list})

@users_bp.route('', methods=['POST'])
def add_user():
    data = request.json
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    name = data.get('name')
    account_id = data.get('account_id', 1)
    medications = data.get('medications', [])
    assignments = data.get('assignments', {})

    if not name:
        return jsonify({'error': 'User name is required'}), 400

    try:
        new_user = User(username=name, account_id=account_id)
        db.session.add(new_user)
        db.session.flush()

        schedules_by_med_id = {}
        for med in medications:
            med_id = str(med['id'])
            end_date_str = med.get('endDate')
            if end_date_str:
                try:
                    end_time = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                except ValueError:
                    end_time = date.today() + timedelta(days=30)
            else:
                end_time = date.today() + timedelta(days=30)

            schedule = Schedule(
                medication_id=int(med_id),
                user_id=new_user.user_id,
                start_time=date.today(),
                end_time=end_time
            )
            db.session.add(schedule)
            schedules_by_med_id[med_id] = schedule

        db.session.flush()

        for time_str, assigns in assignments.items():
            parsed_time = datetime.strptime(time_str, '%H:%M').time()
            dt = DispenseTime(user_id=new_user.user_id, time=parsed_time)
            db.session.add(dt)
            db.session.flush()

            for assign in assigns:
                med_id = str(assign['id'])
                dosage = int(assign.get('dosage', 1))

                if med_id in schedules_by_med_id:
                    dts = DispenseTimeSchedule(
                        schedule_id=schedules_by_med_id[med_id].schedule_id,
                        dispense_time_id=dt.dispense_time_id,
                        dosage=dosage
                    )
                    db.session.add(dts)

        db.session.commit()

        device_id = _get_device_id_for_account(account_id)
        if device_id:
            publish_sync(device_id, current_app._get_current_object())

        logger.info(f"User: {new_user.user_id} created")
        return jsonify({
            'message': 'User and schedules created successfully',
            'user_id': new_user.user_id
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"User error (add): {str(e)}")
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    medications = data.get('medications', [])
    assignments = data.get('assignments', {})

    try:
        # Delete existing logs and schedules for this user
        dispense_times = db.session.scalars(db.select(DispenseTime).filter_by(user_id=user_id)).all()
        for dt in dispense_times:
            db.session.execute(db.delete(NotificationLog).where(NotificationLog.dispense_time_id == dt.dispense_time_id))
            for dts in dt.dts_entries:
                db.session.execute(db.delete(DispenseLog).where(DispenseLog.dts_id == dts.dts_id))
            
            db.session.execute(db.delete(DispenseTimeSchedule).where(DispenseTimeSchedule.dispense_time_id == dt.dispense_time_id))
        
        db.session.execute(db.delete(DispenseTime).where(DispenseTime.user_id == user_id))
        db.session.execute(db.delete(Schedule).where(Schedule.user_id == user_id))
        db.session.flush()

        # Recreate schedules
        schedules_by_med_id = {}
        for med in medications:
            med_id = str(med['id'])
            end_date_str = med.get('endDate')
            if end_date_str:
                try:
                    end_time = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                except ValueError:
                    end_time = date.today() + timedelta(days=30)
            else:
                end_time = date.today() + timedelta(days=30)

            schedule = Schedule(
                medication_id=int(med_id),
                user_id=user.user_id,
                start_time=date.today(),
                end_time=end_time
            )
            db.session.add(schedule)
            schedules_by_med_id[med_id] = schedule

        db.session.flush()

        # Recreate dispense times and assignments
        for time_str, assigns in assignments.items():
            parsed_time = datetime.strptime(time_str, '%H:%M').time()
            dt = DispenseTime(user_id=user.user_id, time=parsed_time)
            db.session.add(dt)
            db.session.flush()

            for assign in assigns:
                med_id = str(assign['id'])
                dosage = int(assign.get('dosage', 1))

                if med_id in schedules_by_med_id:
                    dts = DispenseTimeSchedule(
                        schedule_id=schedules_by_med_id[med_id].schedule_id,
                        dispense_time_id=dt.dispense_time_id,
                        dosage=dosage
                    )
                    db.session.add(dts)

        db.session.commit()

        device_id = _get_device_id_for_account(user.account_id)
        if device_id:
            publish_sync(device_id, current_app._get_current_object())

        logger.info(f"User: {user_id} schedules updated")
        return jsonify({'message': 'User schedules updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"User error (update): {str(e)}")
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    try:
        # Delete existing logs and schedules for this user
        dispense_times = db.session.scalars(db.select(DispenseTime).filter_by(user_id=user_id)).all()
        for dt in dispense_times:
            db.session.execute(db.delete(NotificationLog).where(NotificationLog.dispense_time_id == dt.dispense_time_id))
            for dts in dt.dts_entries:
                db.session.execute(db.delete(DispenseLog).where(DispenseLog.dts_id == dts.dts_id))
            
            db.session.execute(db.delete(DispenseTimeSchedule).where(DispenseTimeSchedule.dispense_time_id == dt.dispense_time_id))
        
        db.session.execute(db.delete(DispenseTime).where(DispenseTime.user_id == user_id))
        db.session.execute(db.delete(Schedule).where(Schedule.user_id == user_id))
        db.session.delete(user)
        db.session.commit()

        device_id = _get_device_id_for_account(user.account_id)
        if device_id:
            publish_sync(device_id, current_app._get_current_object())

        logger.info(f"User: {user_id} deleted")
        return jsonify({'message': 'User deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"User error (delete): {str(e)}")
        return jsonify({'error': str(e)}), 500
