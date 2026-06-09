from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import MedicationChamber
from tests.conftest import db_session
import pytest



def compare_medication_chambers_contents(db_query_result: list, expected_result: list):
    for i in range(len(expected_result)):
        chamber_id, medication_id, stock = expected_result[i]
        assert ((db_query_result[i].chamber_id == chamber_id) and 
                (db_query_result[i].medication_id == medication_id) and
                (db_query_result[i].stock == stock))
        


def test_medication_chambers_content(db_session: Session):
    medication_chamber1 = MedicationChamber(chamber_id = 1, medication_id = 1, stock = 30)
    db_session.add(medication_chamber1)
    db_session.commit()

    medication_chamber2 = MedicationChamber(chamber_id = 2, medication_id = 2, stock = 15)
    db_session.add(medication_chamber2)
    db_session.commit()

    current_medication_chambers_content = db_session.query(MedicationChamber).all()
    expected_medication_chambers_content = [(1, 1, 30), (2, 2, 15)]
    compare_medication_chambers_contents(current_medication_chambers_content, expected_medication_chambers_content)



def test_medication_chambers_insert_medication_chamber(db_session: Session):
    medication_chamber1 = MedicationChamber(chamber_id = 1, medication_id = 1, stock = 30)
    db_session.add(medication_chamber1)
    db_session.commit()

    medication_chamber2 = MedicationChamber(chamber_id = 2, medication_id = 2, stock = 15)
    db_session.add(medication_chamber2)
    db_session.commit()

    medication_chamber3 = MedicationChamber(chamber_id = 1, medication_id = 2, stock = 20)
    db_session.add(medication_chamber3)
    db_session.commit()

    current_medication_chambers_content = db_session.query(MedicationChamber).all()
    expected_medication_chambers_content = [(1, 1, 30), (2, 2, 15), (1, 2, 20)]

    compare_medication_chambers_contents(current_medication_chambers_content, expected_medication_chambers_content)



def test_medication_chambers_delete_medication_chamber(db_session: Session):
    medication_chamber1 = MedicationChamber(chamber_id = 1, medication_id = 1, stock = 30)
    db_session.add(medication_chamber1)
    db_session.commit()

    medication_chamber2 = MedicationChamber(chamber_id = 2, medication_id = 2, stock = 15)
    db_session.add(medication_chamber2)
    db_session.commit()

    medication_chamber3 = MedicationChamber(chamber_id = 1, medication_id = 2, stock = 20)
    db_session.add(medication_chamber3)
    db_session.commit()

    db_session.delete(medication_chamber3)
    db_session.commit()

    current_medication_chambers_content = db_session.query(MedicationChamber).all()
    expected_medication_chambers_content = [(1, 1, 30), (2, 2, 15)]

    compare_medication_chambers_contents(current_medication_chambers_content, expected_medication_chambers_content)



def test_medication_chambers_update_medication_chamber(db_session: Session):
    medication_chamber1 = MedicationChamber(chamber_id = 1, medication_id = 1, stock = 30)
    db_session.add(medication_chamber1)
    db_session.commit()

    medication_chamber2 = MedicationChamber(chamber_id = 2, medication_id = 2, stock = 15)
    db_session.add(medication_chamber2)
    db_session.commit()

    db_session.query(MedicationChamber).filter(MedicationChamber.mc_id == 1).update(
        {MedicationChamber.stock : 25}
    )
    db_session.commit()

    current_medication_chambers_content = db_session.query(MedicationChamber).order_by(MedicationChamber.mc_id).all()
    expected_medication_chambers_content = [(1, 1, 25), (2, 2, 15)]

    compare_medication_chambers_contents(current_medication_chambers_content, expected_medication_chambers_content)



def test_medication_chambers_null_data(db_session: Session):
    medication_chamber1 = MedicationChamber(chamber_id = 1, medication_id = 1, stock = 30)
    db_session.add(medication_chamber1)
    db_session.commit()

    medication_chamber2 = MedicationChamber(chamber_id = 2, medication_id = 2, stock = 15)
    db_session.add(medication_chamber2)
    db_session.commit()

    medication_chamber3 = MedicationChamber(chamber_id = None, medication_id = None, stock = None)
    db_session.add(medication_chamber3)
    with pytest.raises(IntegrityError):
        db_session.commit()
        
    db_session.rollback()
    current_medication_chambers_content = db_session.query(MedicationChamber).all()
    expected_medication_chambers_content = [(1, 1, 30), (2, 2, 15)]

    compare_medication_chambers_contents(current_medication_chambers_content, expected_medication_chambers_content)



def test_medication_chambers_order_records(db_session: Session):
    medication_chamber1 = MedicationChamber(chamber_id = 1, medication_id = 1, stock = 30)
    db_session.add(medication_chamber1)
    db_session.commit()

    medication_chamber2 = MedicationChamber(chamber_id = 2, medication_id = 2, stock = 15)
    db_session.add(medication_chamber2)
    db_session.commit()

    medication_chamber3 = MedicationChamber(chamber_id = 1, medication_id = 2, stock = 50)
    medication_chamber4 = MedicationChamber(chamber_id = 2, medication_id = 1, stock = 10)
    
    db_session.add(medication_chamber3)
    db_session.add(medication_chamber4)
    db_session.commit()

    medication_chambers_ordered_by_stock = db_session.query(MedicationChamber).order_by(MedicationChamber.stock).all()
    expected_medication_chambers_content = [(2, 1, 10), (2, 2, 15), (1, 1, 30), (1, 2, 50)]
    
    compare_medication_chambers_contents(medication_chambers_ordered_by_stock, expected_medication_chambers_content)
    


def test_medication_chambers_filtered_by_medication(db_session: Session):
    medication_chamber1 = MedicationChamber(chamber_id = 1, medication_id = 1, stock = 30)
    db_session.add(medication_chamber1)
    db_session.commit()

    medication_chamber2 = MedicationChamber(chamber_id = 2, medication_id = 2, stock = 15)
    db_session.add(medication_chamber2)
    db_session.commit()

    medication_chamber3 = MedicationChamber(chamber_id = 1, medication_id = 2, stock = 50)
    medication_chamber4 = MedicationChamber(chamber_id = 2, medication_id = 1, stock = 10)
    db_session.add(medication_chamber3)
    db_session.add(medication_chamber4)
    db_session.commit()

    medication_chambers_filtered_by_medication = db_session.query(MedicationChamber).where(MedicationChamber.medication_id.in_([1])).all()
    expected_medication_chambers_content = [(1, 1, 30), (2, 1, 10)]
    
    compare_medication_chambers_contents(medication_chambers_filtered_by_medication, expected_medication_chambers_content)
