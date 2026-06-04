from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import DispenseTimeSchedule, Schedule, DispenseTime
from tests.conftest import db_session
import pytest
from datetime import date, time as dt_time



def compare_dts_contents(db_query_result: list, expected_result: list):
    for i in range(len(expected_result)):
        schedule_id, dispense_time_id, dosage = expected_result[i]
        assert ((db_query_result[i].schedule_id == schedule_id) and 
                (db_query_result[i].dispense_time_id == dispense_time_id) and
                (db_query_result[i].dosage == dosage))
        


def test_dts_content(db_session: Session):
    current_dts_content = db_session.query(DispenseTimeSchedule).all()
    expected_dts_content = []
    compare_dts_contents(current_dts_content, expected_dts_content)



def test_dts_insert_dts(db_session: Session):
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

    current_dts_content = db_session.query(DispenseTimeSchedule).all()
    expected_dts_content = [(1, 1, 2)]

    compare_dts_contents(current_dts_content, expected_dts_content)



def test_dts_delete_dts(db_session: Session):
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

    db_session.delete(dts)
    db_session.commit()

    current_dts_content = db_session.query(DispenseTimeSchedule).all()
    expected_dts_content = []

    compare_dts_contents(current_dts_content, expected_dts_content)



def test_dts_update_dts(db_session: Session):
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

    db_session.query(DispenseTimeSchedule).filter(DispenseTimeSchedule.dts_id == 1).update(
        {DispenseTimeSchedule.dosage : 3}
    )
    db_session.commit()

    current_dts_content = db_session.query(DispenseTimeSchedule).all()
    expected_dts_content = [(1, 1, 3)]

    compare_dts_contents(current_dts_content, expected_dts_content)



def test_dts_null_data(db_session: Session):
    dts = DispenseTimeSchedule(dts_id = 1,
                               schedule_id = None, 
                              dispense_time_id = None,
                              dosage = None)
    
    db_session.add(dts)
    with pytest.raises(IntegrityError):
        db_session.commit()
        
    db_session.rollback()
    current_dts_content = db_session.query(DispenseTimeSchedule).all()
    expected_dts_content = []

    compare_dts_contents(current_dts_content, expected_dts_content)



def test_dts_order_records(db_session: Session):
    schedule1 = Schedule(schedule_id = 1,
                         medication_id = 1, 
                        user_id = 1,
                        start_time = date(2026, 1, 1),
                        end_time = date(2026, 12, 31))
    schedule2 = Schedule(schedule_id = 2,
                        medication_id = 2, 
                        user_id = 1,
                        start_time = date(2026, 1, 1),
                        end_time = date(2026, 12, 31))
    db_session.add(schedule1)
    db_session.add(schedule2)
    db_session.commit()

    dts1 = DispenseTimeSchedule(dts_id = 1,
                               schedule_id = 1, 
                               dispense_time_id = 1,
                               dosage = 2)
    dts2 = DispenseTimeSchedule(dts_id = 2,
                               schedule_id = 2, 
                               dispense_time_id = 1,
                               dosage = 1)
    db_session.add(dts1)
    db_session.add(dts2)
    db_session.commit()

    dts_ordered_by_dosage = db_session.query(DispenseTimeSchedule).order_by(DispenseTimeSchedule.dosage).all()
    expected_dts_content = [(2, 1, 1), (1, 1, 2)]
    
    compare_dts_contents(dts_ordered_by_dosage, expected_dts_content)
    


def test_dts_filtered_by_schedule(db_session: Session):
    schedule1 = Schedule(schedule_id = 1,
                        medication_id = 1, 
                        user_id = 1,
                        start_time = date(2026, 1, 1),
                        end_time = date(2026, 12, 31))
    schedule2 = Schedule(schedule_id = 2,
                        medication_id = 2, 
                        user_id = 1,
                        start_time = date(2026, 1, 1),
                        end_time = date(2026, 12, 31))
    db_session.add(schedule1)
    db_session.add(schedule2)
    db_session.commit()

    dts1 = DispenseTimeSchedule(dts_id = 1,
                               schedule_id = 1, 
                               dispense_time_id = 1,
                               dosage = 2)
    dts2 = DispenseTimeSchedule(dts_id = 2,
                               schedule_id = 2, 
                               dispense_time_id = 1,
                               dosage = 1)
    db_session.add(dts1)
    db_session.add(dts2)
    db_session.commit()

    dts_filtered_by_schedule = db_session.query(DispenseTimeSchedule).where(DispenseTimeSchedule.schedule_id.in_([1])).all()
    expected_dts_content = [(1, 1, 2)]
    
    compare_dts_contents(dts_filtered_by_schedule, expected_dts_content)
