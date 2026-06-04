from tests.conftest import db_session
from app.models import NotificationLog, DispenseLog, Schedule, DispenseTimeSchedule
from datetime import datetime, timedelta, date
import random


def test_notification_log_performance(benchmark, db_session):
    base_time = datetime(2026, 1, 1, 8, 0, 0)
    statuses = ['sent', 'failed', 'pending']
    records = 100000
    record_horizone = 100
    dispense_time_ids = [1, 2, 3, 4, 5, 6, 7]

    fake_logs = [NotificationLog(dispense_time_id = 1, 
                 actual_time = base_time + timedelta(minutes = i), 
                 status = random.choice(statuses)) for i in range(records)]

    db_session.bulk_save_objects(fake_logs)
    db_session.commit()

    def run_query():
        (db_session.query(NotificationLog)
        .where(NotificationLog.dispense_time_id.in_(dispense_time_ids))
        .order_by(NotificationLog.actual_time)
        .limit(record_horizone).all())

    benchmark(run_query)



def test_dispense_logs_joins_performance(benchmark, db_session):
    base_time = datetime(2026, 1, 1, 8, 0, 0)
    records = 100000
    record_horizon = 100
    user_ids = [1, 2, 3, 4, 5]

    fake_schedules = [Schedule(medication_id = random.randint(1, 10),
            user_id = random.choice(user_ids),
            start_time = date(2026, 1, 1),
            end_time = date(2026, 12, 31)) for _ in range(records)]
    
    db_session.bulk_save_objects(fake_schedules)
    db_session.commit()

    fake_dts = [DispenseTimeSchedule(schedule_id = random.randint(1, records),
            dispense_time_id = random.randint(1, 7),
            dosage = random.randint(1, 5)) for _ in range(records)]
    
    db_session.bulk_save_objects(fake_dts)
    db_session.commit()

    fake_logs = [DispenseLog(dts_id=random.randint(1, records),
            actual_time = base_time + timedelta(minutes = i)) for i in range(records)]
    
    db_session.bulk_save_objects(fake_logs)
    db_session.commit()

    def run_query():
        (db_session.query(DispenseLog)
         .join(DispenseTimeSchedule)
         .join(Schedule)
         .filter(Schedule.user_id.in_(user_ids))
         .order_by(DispenseLog.actual_time)
         .limit(record_horizon)
         .all())

    benchmark(run_query)