from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import Medication
from tests.test_session import db_session
import pytest



def compare_medications_contents(db_query_result: list, expected_result: list):
    for i in range(len(expected_result)):
        account_id, med_name = expected_result[i]
        assert ((db_query_result[i].account_id == account_id) and 
                (db_query_result[i].med_name == med_name))
        


def test_medications_content(db_session: Session):
    current_medications_content = db_session.query(Medication).all()
    expected_medications_content = [(1, 'Lisinopril (Blood Pressure)'), (1, 'Atorvastatin (Cholesterol)')]
    compare_medications_contents(current_medications_content, expected_medications_content)



def test_medications_insert_medication(db_session: Session):
    medication = Medication(account_id = 1, 
                           med_name = 'Aspirin')
    db_session.add(medication)
    db_session.commit()

    current_medications_content = db_session.query(Medication).all()
    expected_medications_content = [(1, 'Lisinopril (Blood Pressure)'), (1, 'Atorvastatin (Cholesterol)'), (1, 'Aspirin')]

    compare_medications_contents(current_medications_content, expected_medications_content)



def test_medications_delete_medication(db_session: Session):
    medication = Medication(account_id = 1, 
                           med_name = 'Aspirin')
    db_session.add(medication)
    db_session.commit()

    db_session.delete(medication)
    db_session.commit()

    current_medications_content = db_session.query(Medication).all()
    expected_medications_content = [(1, 'Lisinopril (Blood Pressure)'), (1, 'Atorvastatin (Cholesterol)')]

    compare_medications_contents(current_medications_content, expected_medications_content)



def test_medications_update_medication(db_session: Session):
    db_session.query(Medication).filter(Medication.medication_id == 1).update(
        {Medication.med_name : 'Lisinopril Updated'}
    )
    db_session.commit()

    current_medications_content = db_session.query(Medication).order_by(Medication.medication_id).all()
    expected_medications_content = [(1, 'Lisinopril Updated'), (1, 'Atorvastatin (Cholesterol)')]

    compare_medications_contents(current_medications_content, expected_medications_content)



def test_medications_null_data(db_session: Session):
    medication = Medication(account_id = None, 
                           med_name = None)
    
    db_session.add(medication)
    with pytest.raises(IntegrityError):
        db_session.commit()
        
    db_session.rollback()
    current_medications_content = db_session.query(Medication).all()
    expected_medications_content = [(1, 'Lisinopril (Blood Pressure)'), (1, 'Atorvastatin (Cholesterol)')]

    compare_medications_contents(current_medications_content, expected_medications_content)



def test_medications_order_records(db_session: Session):
    medication1 = Medication(account_id = 1, 
                            med_name = 'Metformin')
    medication2 = Medication(account_id = 1, 
                            med_name = 'Aspirin')
    db_session.add(medication1)
    db_session.add(medication2)
    db_session.commit()

    medications_ordered_by_name = db_session.query(Medication).order_by(Medication.med_name).all()
    expected_medications_content = [(1, 'Aspirin'), (1, 'Atorvastatin (Cholesterol)'), (1, 'Lisinopril (Blood Pressure)'), (1, 'Metformin')]
    
    compare_medications_contents(medications_ordered_by_name, expected_medications_content)
    


def test_medications_filtered_by_name(db_session: Session):
    medication1 = Medication(account_id = 1, 
                            med_name = 'Metformin')
    medication2 = Medication(account_id = 1, 
                            med_name = 'Aspirin')
    db_session.add(medication1)
    db_session.add(medication2)
    db_session.commit()

    medications_filtered_by_name = db_session.query(Medication).where(Medication.med_name.in_(['Metformin', 'Lisinopril (Blood Pressure)'])).all()
    expected_medications_content = [(1, 'Lisinopril (Blood Pressure)'), (1, 'Metformin')]
    
    compare_medications_contents(medications_filtered_by_name, expected_medications_content)
