from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import DispenseLog, DispenseTimeSchedule, Schedule
from tests.test_session import db_session
import pytest
from datetime import datetime, date



def compare_dispense_logs_contents(db_query_result: list, expected_result: list):
    for i in range(len(expected_result)):
        dts_id, status = expected_result[i]
        assert ((db_query_result[i].dts_id == dts_id) and 
                (db_query_result[i].status == status))
        


def test_dispense_logs_content(db_session: Session):
    current_dispense_logs_content = db_session.query(DispenseLog).all()
    expected_dispense_logs_content = []
    compare_dispense_logs_contents(current_dispense_logs_content, expected_dispense_logs_content)



def test_dispense_logs_insert_dispense_log(db_session: Session):
    schedule = Schedule(schedule_id = 1, 
                       medication_id = 1, 
                       user_id = 1,
                       start_time = date(2026, 1, 1),
                       end_time = date(2026, 12, 31))
    db_session.add(schedule)
    db_session.commit()

    dts = DispenseTimeSchedule(dts_id = 1, 
                               schedule_id = 1, 
                              dispense_time_id = 1,
                              dosage = 2)
    db_session.add(dts)
    db_session.commit()

    dispense_log = DispenseLog(log_id = 1,
                              dts_id = 1, 
                              actual_time = datetime(2026, 5, 8, 8, 0, 0),
                              status = 'dispensed')
    db_session.add(dispense_log)
    db_session.commit()

    current_dispense_logs_content = db_session.query(DispenseLog).all()
    expected_dispense_logs_content = [(1, 'dispensed')]

    compare_dispense_logs_contents(current_dispense_logs_content, expected_dispense_logs_content)



def test_dispense_logs_delete_dispense_log(db_session: Session):
    schedule = Schedule(schedule_id = 1,
                        medication_id = 1, 
                       user_id = 1,
                       start_time = date(2026, 1, 1),
                       end_time = date(2026, 12, 31))
    db_session.add(schedule)
    db_session.commit()

    dts = DispenseTimeSchedule(dts_id = 1,
                               schedule_id = 1, 
                              dispense_time_id = 1,
                              dosage = 2)
    db_session.add(dts)
    db_session.commit()

    dispense_log = DispenseLog(log_id = 1,
                               dts_id = 1, 
                              actual_time = datetime(2026, 5, 8, 8, 0, 0),
                              status = 'dispensed')
    db_session.add(dispense_log)
    db_session.commit()

    db_session.delete(dispense_log)
    db_session.commit()

    current_dispense_logs_content = db_session.query(DispenseLog).all()
    expected_dispense_logs_content = []

    compare_dispense_logs_contents(current_dispense_logs_content, expected_dispense_logs_content)



def test_dispense_logs_update_dispense_log(db_session: Session):
    schedule = Schedule(schedule_id = 1,
                        medication_id = 1, 
                       user_id = 1,
                       start_time = date(2026, 1, 1),
                       end_time = date(2026, 12, 31))
    db_session.add(schedule)
    db_session.commit()

    dts = DispenseTimeSchedule(dts_id = 1,
                               schedule_id = 1, 
                              dispense_time_id = 1,
                              dosage = 2)
    db_session.add(dts)
    db_session.commit()

    dispense_log = DispenseLog(log_id = 1,
                               dts_id = 1, 
                              actual_time = datetime(2026, 5, 8, 8, 0, 0),
                              status = 'dispensed')
    db_session.add(dispense_log)
    db_session.commit()

    db_session.query(DispenseLog).filter(DispenseLog.log_id == 1).update(
        {DispenseLog.status : 'failed'}
    )
    db_session.commit()

    current_dispense_logs_content = db_session.query(DispenseLog).all()
    expected_dispense_logs_content = [(1, 'failed')]

    compare_dispense_logs_contents(current_dispense_logs_content, expected_dispense_logs_content)



def test_dispense_logs_null_dts_id(db_session: Session):
    dispense_log = DispenseLog(log_id = 1,
                               dts_id = None, 
                              actual_time = datetime(2026, 5, 8, 8, 0, 0),
                              status = 'dispensed')
    
    db_session.add(dispense_log)
    with pytest.raises(IntegrityError):
        db_session.commit()
        
    db_session.rollback()
    current_dispense_logs_content = db_session.query(DispenseLog).all()
    expected_dispense_logs_content = []

    compare_dispense_logs_contents(current_dispense_logs_content, expected_dispense_logs_content)



def test_dispense_logs_order_records(db_session: Session):
    schedule = Schedule(schedule_id = 1,
                        medication_id = 1, 
                       user_id = 1,
                       start_time = date(2026, 1, 1),
                       end_time = date(2026, 12, 31))
    db_session.add(schedule)
    db_session.commit()

    dts = DispenseTimeSchedule(dts_id = 1,
                               schedule_id = 1, 
                              dispense_time_id = 1,
                              dosage = 2)
    db_session.add(dts)
    db_session.commit()

    dispense_log1 = DispenseLog(log_id = 1,
                                dts_id = 1, 
                               actual_time = datetime(2026, 5, 8, 8, 0, 0),
                               status = 'dispensed')
    dispense_log2 = DispenseLog(log_id = 2,
                                dts_id = 1, 
                               actual_time = datetime(2026, 5, 8, 9, 0, 0),
                               status = 'failed')
    db_session.add(dispense_log1)
    db_session.add(dispense_log2)
    db_session.commit()

    dispense_logs_ordered_by_time = db_session.query(DispenseLog).order_by(DispenseLog.actual_time).all()
    expected_dispense_logs_content = [(1, 'dispensed'), (1, 'failed')]
    
    compare_dispense_logs_contents(dispense_logs_ordered_by_time, expected_dispense_logs_content)
    


def test_dispense_logs_filtered_by_status(db_session: Session):
    schedule = Schedule(schedule_id = 1,
                        medication_id = 1, 
                       user_id = 1,
                       start_time = date(2026, 1, 1),
                       end_time = date(2026, 12, 31))
    db_session.add(schedule)
    db_session.commit()

    dts = DispenseTimeSchedule(dts_id = 1,
                               schedule_id = 1, 
                              dispense_time_id = 1,
                              dosage = 2)
    db_session.add(dts)
    db_session.commit()

    dispense_log1 = DispenseLog(log_id = 1,
                                dts_id = 1, 
                               actual_time = datetime(2026, 5, 8, 8, 0, 0),
                               status = 'dispensed')
    dispense_log2 = DispenseLog(log_id = 2,
                                dts_id = 1, 
                               actual_time = datetime(2026, 5, 8, 9, 0, 0),
                               status = 'failed')
    db_session.add(dispense_log1)
    db_session.add(dispense_log2)
    db_session.commit()

    dispense_logs_filtered_by_status = db_session.query(DispenseLog).where(DispenseLog.status.in_(['dispensed'])).all()
    expected_dispense_logs_content = [(1, 'dispensed')]
    
    compare_dispense_logs_contents(dispense_logs_filtered_by_status, expected_dispense_logs_content)
