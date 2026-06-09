from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import DispenseTime
from tests.conftest import db_session
import pytest
from datetime import time as dt_time



def compare_dispense_times_contents(db_query_result: list, expected_result: list):
    for i in range(len(expected_result)):
        user_id, time = expected_result[i]
        assert ((db_query_result[i].user_id == user_id) and 
                (db_query_result[i].time == time))
        


def test_dispense_times_content(db_session: Session):
    dispense_time = DispenseTime(user_id = 1, time = dt_time(8, 0, 0))
    db_session.add(dispense_time)
    db_session.commit()

    current_dispense_times_content = db_session.query(DispenseTime).all()
    expected_dispense_times_content = [(1, dt_time(8, 0, 0))]
    compare_dispense_times_contents(current_dispense_times_content, expected_dispense_times_content)



def test_dispense_times_insert_dispense_time(db_session: Session):
    dispense_time1 = DispenseTime(user_id = 1, time = dt_time(8, 0, 0))
    db_session.add(dispense_time1)
    db_session.commit() 

    dispense_time2 = DispenseTime(user_id = 1, time = dt_time(18, 30, 0))
    db_session.add(dispense_time2)
    db_session.commit()

    current_dispense_times_content = db_session.query(DispenseTime).all()
    expected_dispense_times_content = [(1, dt_time(8, 0, 0)), (1, dt_time(18, 30, 0))]

    compare_dispense_times_contents(current_dispense_times_content, expected_dispense_times_content)



def test_dispense_times_delete_dispense_time(db_session: Session):
    dispense_time1 = DispenseTime(user_id = 1, time = dt_time(8, 0, 0))
    db_session.add(dispense_time1)
    db_session.commit()  

    dispense_time2 = DispenseTime(user_id = 1, time = dt_time(18, 30, 0))
    db_session.add(dispense_time2)
    db_session.commit()

    db_session.delete(dispense_time2)
    db_session.commit()

    current_dispense_times_content = db_session.query(DispenseTime).all()
    expected_dispense_times_content = [(1, dt_time(8, 0, 0))]

    compare_dispense_times_contents(current_dispense_times_content, expected_dispense_times_content)



def test_dispense_times_update_dispense_time(db_session: Session):
    dispense_time1 = DispenseTime(user_id = 1, time = dt_time(8, 0, 0))
    db_session.add(dispense_time1)
    db_session.commit() 

    db_session.query(DispenseTime).filter(DispenseTime.dispense_time_id == 1).update(
        {DispenseTime.time : dt_time(9, 15, 0)}
    )
    db_session.commit()

    current_dispense_times_content = db_session.query(DispenseTime).all()
    expected_dispense_times_content = [(1, dt_time(9, 15, 0))]

    compare_dispense_times_contents(current_dispense_times_content, expected_dispense_times_content)



def test_dispense_times_null_data(db_session: Session):
    dispense_time1 = DispenseTime(user_id = 1, time = dt_time(8, 0, 0))
    db_session.add(dispense_time1)
    db_session.commit() 

    dispense_time2 = DispenseTime(user_id = None, time = None)
    db_session.add(dispense_time2)
    with pytest.raises(IntegrityError):
        db_session.commit()
        
    db_session.rollback()
    current_dispense_times_content = db_session.query(DispenseTime).all()
    expected_dispense_times_content = [(1, dt_time(8, 0, 0))]

    compare_dispense_times_contents(current_dispense_times_content, expected_dispense_times_content)



def test_dispense_times_order_records(db_session: Session):
    dispense_time1 = DispenseTime(user_id = 1, time = dt_time(8, 0, 0))
    db_session.add(dispense_time1)
    db_session.commit() 

    dispense_time2 = DispenseTime(user_id = 1, time = dt_time(18, 30, 0))
    dispense_time3 = DispenseTime(user_id = 1, time = dt_time(12, 0, 0))
    db_session.add(dispense_time2)
    db_session.add(dispense_time3)
    db_session.commit()

    dispense_times_ordered_by_time = db_session.query(DispenseTime).order_by(DispenseTime.time).all()
    expected_dispense_times_content = [(1, dt_time(8, 0, 0)), (1, dt_time(12, 0, 0)), (1, dt_time(18, 30, 0))]
    
    compare_dispense_times_contents(dispense_times_ordered_by_time, expected_dispense_times_content)
    


def test_dispense_times_filtered_by_time(db_session: Session):
    dispense_time1 = DispenseTime(user_id = 1, time = dt_time(8, 0, 0))
    db_session.add(dispense_time1)
    db_session.commit() 

    dispense_time2 = DispenseTime(user_id = 1, time = dt_time(18, 30, 0))
    dispense_time3 = DispenseTime(user_id = 1, time = dt_time(12, 0, 0))
    db_session.add(dispense_time2)
    db_session.add(dispense_time3)
    db_session.commit()

    dispense_times_filtered_by_time = db_session.query(DispenseTime).where(DispenseTime.time.in_([dt_time(8, 0, 0), dt_time(12, 0, 0)])).all()
    expected_dispense_times_content = [(1, dt_time(8, 0, 0)), (1, dt_time(12, 0, 0))]
    
    compare_dispense_times_contents(dispense_times_filtered_by_time, expected_dispense_times_content)
