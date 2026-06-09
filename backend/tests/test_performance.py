from app.models import NotificationLog, DispenseLog, Schedule, DispenseTimeSchedule, DispenseTime
from datetime import datetime, timedelta, date, time
from sqlalchemy import func
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
    medication_sup_idx = 10000
    dts_sup_idx = 10000
    dl_sup_idx = 10000

    fake_schedules = [Schedule(medication_id = random.randint(1, medication_sup_idx),
            user_id = random.choice(user_ids),
            start_time = date(2026, 1, 1),
            end_time = date(2026, 12, 31)) for _ in range(records)]
    
    db_session.bulk_save_objects(fake_schedules)
    db_session.commit()

    fake_dts = [DispenseTimeSchedule(schedule_id = random.randint(1, dts_sup_idx),
            dispense_time_id = random.randint(1, 7),
            dosage = random.randint(1, 5)) for _ in range(records)]
    
    db_session.bulk_save_objects(fake_dts)
    db_session.commit()

    fake_logs = [DispenseLog(dts_id = random.randint(1, dl_sup_idx),
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


def test_schedules_date_range_performance(benchmark, db_session):
    records = 100000
    record_horizon = 100
    user_ids = [1, 2, 3, 4, 5]

    start_time_filter = date(2026, 1, 1)
    end_time_filter = date(2026, 6, 30)

    medication_sup_idx = 10000

    fake_schedules = [Schedule(
            medication_id = random.randint(1, medication_sup_idx),
            user_id = random.choice(user_ids),
            start_time = date(2026, 1, 1) + timedelta(days = random.randint(0, 365)),
            end_time = date(2026, 6, 30) + timedelta(days = random.randint(0, 180))
        ) for _ in range(records)]
    
    db_session.bulk_save_objects(fake_schedules)
    db_session.commit()

    def run_query():
        (db_session.query(Schedule)
         .filter(Schedule.start_time >= start_time_filter,
                 Schedule.end_time <= end_time_filter)
         .order_by(Schedule.start_time)
         .limit(record_horizon)
         .all())

    benchmark(run_query)


def test_notification_logs_joins_performance(benchmark, db_session):
    base_time = datetime(2026, 1, 1, 8, 0, 0)
    statuses = ['sent', 'failed', 'pending']
    records = 100000
    record_horizon = 100
    user_ids = [1, 2, 3, 4, 5]
    nl_sup_idx = 10000

    fake_dispense_times = [DispenseTime(user_id = random.choice(user_ids),
            time = time(random.randint(0, 23), random.randint(0, 59), 0)
        ) for _ in range(records)]
    
    db_session.bulk_save_objects(fake_dispense_times)
    db_session.commit()

    fake_logs = [NotificationLog(dispense_time_id = random.randint(1, nl_sup_idx),
            actual_time = base_time + timedelta(minutes = i),
            status = random.choice(statuses)
        ) for i in range(records)]
    
    db_session.bulk_save_objects(fake_logs)
    db_session.commit()

    def run_query():
        (db_session.query(NotificationLog)
         .join(DispenseTime)
         .filter(DispenseTime.user_id.in_(user_ids))
         .order_by(NotificationLog.actual_time)
         .limit(record_horizon)
         .all())

    benchmark(run_query)


def test_dispense_logs_aggregation_performance(benchmark, db_session):
    base_time = datetime(2026, 1, 1, 8, 0, 0)
    records = 100000
    dl_sup_idx = 10000

    fake_logs = [DispenseLog(dts_id = random.randint(1, dl_sup_idx),
            actual_time = base_time + timedelta(minutes = i)
            ) for i in range(records)]
    
    db_session.bulk_save_objects(fake_logs)
    db_session.commit()

    def run_query():
        (db_session.query(DispenseLog.dts_id, func.count(DispenseLog.log_id))
         .group_by(DispenseLog.dts_id)
         .all())

    benchmark(run_query)


def test_notification_logs_status_and_time_performance(benchmark, db_session):
    base_time = datetime(2026, 1, 1, 8, 0, 0)
    statuses = ['sent', 'failed', 'pending']
    records = 100000
    record_horizon = 100
    dispense_time_ids = [1, 2, 3, 4, 5, 6, 7]

    status_filter = 'failed'

    fake_logs = [NotificationLog(dispense_time_id = random.choice(dispense_time_ids),
            actual_time = base_time + timedelta(minutes = i),
            status = random.choice(statuses)
        ) for i in range(records)]
    
    db_session.bulk_save_objects(fake_logs)
    db_session.commit()

    def run_query():
        (db_session.query(NotificationLog)
         .filter(NotificationLog.status == status_filter,
                 NotificationLog.actual_time >= base_time)
         .order_by(NotificationLog.actual_time)
         .limit(record_horizon)
         .all())

    benchmark(run_query)