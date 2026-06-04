from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import Schedule
from tests.conftest import db_session
import pytest
from datetime import date



def compare_schedules_contents(db_query_result: list, expected_result: list):
    for i in range(len(expected_result)):
        medication_id, user_id, start_time, end_time = expected_result[i]
        assert ((db_query_result[i].medication_id == medication_id) and 
                (db_query_result[i].user_id == user_id) and
                (db_query_result[i].start_time == start_time) and
                (db_query_result[i].end_time == end_time))
        


def test_schedules_content(db_session: Session):
    current_schedules_content = db_session.query(Schedule).all()
    expected_schedules_content = []
    compare_schedules_contents(current_schedules_content, expected_schedules_content)



def test_schedules_insert_schedule(db_session: Session):
    schedule = Schedule(medication_id = 1, 
                       user_id = 1,
                       start_time = date(2026, 1, 1),
                       end_time = date(2026, 12, 31))
    db_session.add(schedule)
    db_session.commit()

    current_schedules_content = db_session.query(Schedule).all()
    expected_schedules_content = [(1, 1, date(2026, 1, 1), date(2026, 12, 31))]

    compare_schedules_contents(current_schedules_content, expected_schedules_content)



def test_schedules_delete_schedule(db_session: Session):
    schedule = Schedule(medication_id = 1, 
                       user_id = 1,
                       start_time = date(2026, 1, 1),
                       end_time = date(2026, 12, 31))
    db_session.add(schedule)
    db_session.commit()

    db_session.delete(schedule)
    db_session.commit()

    current_schedules_content = db_session.query(Schedule).all()
    expected_schedules_content = []

    compare_schedules_contents(current_schedules_content, expected_schedules_content)



def test_schedules_update_schedule(db_session: Session):
    schedule = Schedule(schedule_id = 1,
                       medication_id = 1, 
                       user_id = 1,
                       start_time = date(2026, 1, 1),
                       end_time = date(2026, 12, 31))
    db_session.add(schedule)
    db_session.commit()

    db_session.query(Schedule).filter(Schedule.schedule_id == 1).update(
        {Schedule.medication_id : 1,
        Schedule.user_id : 1,
        Schedule.start_time : date(2026, 2, 1),
        Schedule.end_time : date(2026, 11, 30)}
    )
    db_session.commit()

    current_schedules_content = db_session.query(Schedule).all()
    expected_schedules_content = [(1, 1, date(2026, 2, 1), date(2026, 11, 30))]

    compare_schedules_contents(current_schedules_content, expected_schedules_content)



def test_schedules_null_data(db_session: Session):
    schedule = Schedule(medication_id = None, 
                       user_id = None,
                       start_time = None,
                       end_time = None)
    
    db_session.add(schedule)
    with pytest.raises(IntegrityError):
        db_session.commit()
        
    db_session.rollback()
    current_schedules_content = db_session.query(Schedule).all()
    expected_schedules_content = []

    compare_schedules_contents(current_schedules_content, expected_schedules_content)



def test_schedules_order_records(db_session: Session):
    schedule1 = Schedule(medication_id = 1, 
                        user_id = 1,
                        start_time = date(2026, 3, 1),
                        end_time = date(2026, 3, 31))
    schedule2 = Schedule(medication_id = 2, 
                        user_id = 1,
                        start_time = date(2026, 1, 1),
                        end_time = date(2026, 1, 31))
    schedule3 = Schedule(medication_id = 1, 
                        user_id = 1,
                        start_time = date(2026, 2, 1),
                        end_time = date(2026, 2, 28))
    db_session.add(schedule1)
    db_session.add(schedule2)
    db_session.add(schedule3)
    db_session.commit()

    schedules_ordered_by_start_time = db_session.query(Schedule).order_by(Schedule.start_time).all()
    expected_schedules_content = [(2, 1, date(2026, 1, 1), date(2026, 1, 31)), 
                                  (1, 1, date(2026, 2, 1), date(2026, 2, 28)),
                                  (1, 1, date(2026, 3, 1), date(2026, 3, 31))]
    
    compare_schedules_contents(schedules_ordered_by_start_time, expected_schedules_content)
    
