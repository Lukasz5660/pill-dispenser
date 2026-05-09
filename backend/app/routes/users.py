from flask import Blueprint, jsonify, request
from app.models import db, User, DispenseTime, Schedule, DispenseTimeSchedule, Medication
from datetime import datetime, date, timedelta

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    dispense_times = db.session.scalars(
        db.select(DispenseTime).filter_by(user_id=user_id).order_by(DispenseTime.time)
    ).all()

    schedule_data = []
    for dt in dispense_times:
        medications = []
        for dts in dt.dts_entries:
            medications.append({
                'amount': str(dts.dosage),
                'name': dts.schedule.medication.med_name
            })

        time_str = dt.time.strftime('%H:%M')
        if time_str.startswith('0'):
            time_str = time_str[1:]

        schedule_data.append({
            'time': time_str,
            'medications': medications
        })

    return jsonify({
        'user': {
            'id': user.user_id,
            'name': user.username
        },
        'schedule': schedule_data
    })

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
        return jsonify({
            'message': 'User and schedules created successfully',
            'user_id': new_user.user_id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
