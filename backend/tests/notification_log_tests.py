from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import NotificationLog
from tests.test_session import db_session
import pytest
from datetime import datetime



def compare_notification_logs_contents(db_query_result: list, expected_result: list):
    for i in range(len(expected_result)):
        dispense_time_id, status = expected_result[i]
        assert ((db_query_result[i].dispense_time_id == dispense_time_id) and 
                (db_query_result[i].status == status))
        


def test_notification_logs_content(db_session: Session):
    current_notification_logs_content = db_session.query(NotificationLog).all()
    expected_notification_logs_content = []
    compare_notification_logs_contents(current_notification_logs_content, expected_notification_logs_content)



def test_notification_logs_insert_notification_log(db_session: Session):
    notification_log = NotificationLog(dispense_time_id = 1, 
                                       actual_time = datetime(2026, 5, 8, 8, 0, 0),
                                       status = 'sent')
    db_session.add(notification_log)
    db_session.commit()

    current_notification_logs_content = db_session.query(NotificationLog).all()
    expected_notification_logs_content = [(1, 'sent')]

    compare_notification_logs_contents(current_notification_logs_content, expected_notification_logs_content)



def test_notification_logs_delete_notification_log(db_session: Session):
    notification_log = NotificationLog(dispense_time_id = 1, 
                                       actual_time = datetime(2026, 5, 8, 8, 0, 0),
                                       status = 'sent')
    db_session.add(notification_log)
    db_session.commit()

    db_session.delete(notification_log)
    db_session.commit()

    current_notification_logs_content = db_session.query(NotificationLog).all()
    expected_notification_logs_content = []

    compare_notification_logs_contents(current_notification_logs_content, expected_notification_logs_content)



def test_notification_logs_update_notification_log(db_session: Session):
    notification_log = NotificationLog(not_log_id = 1,
                                       dispense_time_id = 1, 
                                       actual_time = datetime(2026, 5, 8, 8, 0, 0),
                                       status = 'sent')
    db_session.add(notification_log)
    db_session.commit()

    db_session.query(NotificationLog).filter(NotificationLog.not_log_id == 1).update(
        {NotificationLog.status : 'failed'}
    )
    db_session.commit()

    current_notification_logs_content = db_session.query(NotificationLog).all()
    expected_notification_logs_content = [(1, 'failed')]

    compare_notification_logs_contents(current_notification_logs_content, expected_notification_logs_content)



def test_notification_logs_null_dispense_time_id(db_session: Session):
    notification_log = NotificationLog(dispense_time_id = None, 
                                       actual_time = datetime(2026, 5, 8, 8, 0, 0),
                                       status = 'sent')
    
    db_session.add(notification_log)
    with pytest.raises(IntegrityError):
        db_session.commit()
        
    db_session.rollback()
    current_notification_logs_content = db_session.query(NotificationLog).all()
    expected_notification_logs_content = []

    compare_notification_logs_contents(current_notification_logs_content, expected_notification_logs_content)



def test_notification_logs_order_records(db_session: Session):
    notification_log1 = NotificationLog(dispense_time_id = 1, 
                                        actual_time = datetime(2026, 5, 8, 8, 0, 0),
                                        status = 'sent')
    notification_log2 = NotificationLog(dispense_time_id = 1, 
                                        actual_time = datetime(2026, 5, 8, 9, 0, 0),
                                        status = 'failed')
    db_session.add(notification_log1)
    db_session.add(notification_log2)
    db_session.commit()

    notification_logs_ordered_by_time = db_session.query(NotificationLog).order_by(NotificationLog.actual_time).all()
    expected_notification_logs_content = [(1, 'sent'), (1, 'failed')]
    
    compare_notification_logs_contents(notification_logs_ordered_by_time, expected_notification_logs_content)
    


def test_notification_logs_filtered_by_status(db_session: Session):
    notification_log1 = NotificationLog(dispense_time_id = 1, 
                                        actual_time = datetime(2026, 5, 8, 8, 0, 0),
                                        status = 'sent')
    notification_log2 = NotificationLog(dispense_time_id = 1, 
                                        actual_time = datetime(2026, 5, 8, 9, 0, 0),
                                        status = 'failed')
    db_session.add(notification_log1)
    db_session.add(notification_log2)
    db_session.commit()

    notification_logs_filtered_by_status = db_session.query(NotificationLog).where(NotificationLog.status.in_(['sent'])).all()
    expected_notification_logs_content = [(1, 'sent')]
    
    compare_notification_logs_contents(notification_logs_filtered_by_status, expected_notification_logs_content)
