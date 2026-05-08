from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import Chamber
from tests.test_session import db_session
import pytest



def compare_chambers_contents(db_query_result: list, expected_result: list):
    for i in range(len(expected_result)):
        device_id, chamber_number = expected_result[i]
        assert ((db_query_result[i].device_id == device_id) and 
                (db_query_result[i].chamber_number == chamber_number))
        


def test_chambers_content(db_session: Session):
    current_chambers_content = db_session.query(Chamber).all()
    expected_chambers_content = [(1, 1), (1, 2)]
    compare_chambers_contents(current_chambers_content, expected_chambers_content)



def test_chambers_insert_chamber(db_session: Session):
    chamber = Chamber(device_id = 1, 
                     chamber_number = 3)
    db_session.add(chamber)
    db_session.commit()

    current_chambers_content = db_session.query(Chamber).all()
    expected_chambers_content = [(1, 1), (1, 2), (1, 3)]

    compare_chambers_contents(current_chambers_content, expected_chambers_content)



def test_chambers_delete_chamber(db_session: Session):
    chamber = Chamber(device_id = 1, 
                     chamber_number = 3)
    db_session.add(chamber)
    db_session.commit()

    db_session.delete(chamber)
    db_session.commit()

    current_chambers_content = db_session.query(Chamber).all()
    expected_chambers_content = [(1, 1), (1, 2)]

    compare_chambers_contents(current_chambers_content, expected_chambers_content)



def test_chambers_update_chamber(db_session: Session):
    db_session.query(Chamber).filter(Chamber.chamber_id == 1).update(
        {Chamber.chamber_number : 5}
    )
    db_session.commit()

    current_chambers_content = db_session.query(Chamber).order_by(Chamber.chamber_id).all()
    expected_chambers_content = [(1, 5), (1, 2)]

    compare_chambers_contents(current_chambers_content, expected_chambers_content)



def test_chambers_null_data(db_session: Session):
    chamber = Chamber(device_id = None, 
                     chamber_number = None)
    
    db_session.add(chamber)
    with pytest.raises(IntegrityError):
        db_session.commit()
        
    db_session.rollback()
    current_chambers_content = db_session.query(Chamber).all()
    expected_chambers_content = [(1, 1), (1, 2)]

    compare_chambers_contents(current_chambers_content, expected_chambers_content)



def test_chambers_order_records(db_session: Session):
    chamber = Chamber(device_id = 1, 
                     chamber_number = 3)
    db_session.add(chamber)
    db_session.commit()

    chambers_ordered_by_number = db_session.query(Chamber).order_by(Chamber.chamber_number).all()
    expected_chambers_content = [(1, 1), (1, 2), (1, 3)]
    
    compare_chambers_contents(chambers_ordered_by_number, expected_chambers_content)
    


def test_chambers_filtered_by_number(db_session: Session):
    chamber = Chamber(device_id = 1, 
                     chamber_number = 3)
    db_session.add(chamber)
    db_session.commit()

    chambers_filtered_by_number = db_session.query(Chamber).where(Chamber.chamber_number.in_([1, 3])).all()
    expected_chambers_content = [(1, 1), (1, 3)]
    
    compare_chambers_contents(chambers_filtered_by_number, expected_chambers_content)
