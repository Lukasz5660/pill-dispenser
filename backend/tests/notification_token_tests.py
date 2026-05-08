from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import NotificationToken
from tests.test_session import db_session
import pytest



def compare_notification_tokens_contents(db_query_result: list, expected_result: list):
    for i in range(len(expected_result)):
        account_id, token, device_name = expected_result[i]
        assert ((db_query_result[i].account_id == account_id) and 
                (db_query_result[i].token == token) and
                (db_query_result[i].device_name == device_name))
        


def test_notification_tokens_content(db_session: Session):
    current_notification_tokens_content = db_session.query(NotificationToken).all()
    expected_notification_tokens_content = []
    compare_notification_tokens_contents(current_notification_tokens_content, expected_notification_tokens_content)



def test_notification_tokens_insert_notification_token(db_session: Session):
    notification_token = NotificationToken(account_id = 1, 
                                           token = 'token_abc123',
                                           device_name = 'iPhone')
    db_session.add(notification_token)
    db_session.commit()

    current_notification_tokens_content = db_session.query(NotificationToken).all()
    expected_notification_tokens_content = [(1, 'token_abc123', 'iPhone')]

    compare_notification_tokens_contents(current_notification_tokens_content, expected_notification_tokens_content)



def test_notification_tokens_delete_notification_token(db_session: Session):
    notification_token = NotificationToken(account_id = 1, 
                                           token = 'token_abc123',
                                           device_name = 'iPhone')
    db_session.add(notification_token)
    db_session.commit()

    db_session.delete(notification_token)
    db_session.commit()

    current_notification_tokens_content = db_session.query(NotificationToken).all()
    expected_notification_tokens_content = []

    compare_notification_tokens_contents(current_notification_tokens_content, expected_notification_tokens_content)



def test_notification_tokens_update_notification_token(db_session: Session):
    notification_token = NotificationToken(token_id = 1,
                                           account_id = 1, 
                                           token = 'token_abc123',
                                           device_name = 'iPhone')
    db_session.add(notification_token)
    db_session.commit()

    db_session.query(NotificationToken).filter(NotificationToken.token_id == 1).update(
        {NotificationToken.device_name : 'iPad'}
    )
    db_session.commit()

    current_notification_tokens_content = db_session.query(NotificationToken).all()
    expected_notification_tokens_content = [(1, 'token_abc123', 'iPad')]

    compare_notification_tokens_contents(current_notification_tokens_content, expected_notification_tokens_content)



def test_notification_tokens_null_account_id(db_session: Session):
    notification_token = NotificationToken(account_id = None, 
                                           token = 'token_abc123',
                                           device_name = 'iPhone')
    
    db_session.add(notification_token)
    with pytest.raises(IntegrityError):
        db_session.commit()
        
    db_session.rollback()
    current_notification_tokens_content = db_session.query(NotificationToken).all()
    expected_notification_tokens_content = []

    compare_notification_tokens_contents(current_notification_tokens_content, expected_notification_tokens_content)



def test_notification_tokens_order_records(db_session: Session):
    notification_token1 = NotificationToken(account_id = 1, 
                                            token = 'token_xyz789',
                                            device_name = 'Android Phone')
    notification_token2 = NotificationToken(account_id = 1, 
                                            token = 'token_abc123',
                                            device_name = 'iPhone')
    db_session.add(notification_token1)
    db_session.add(notification_token2)
    db_session.commit()

    notification_tokens_ordered_by_token = db_session.query(NotificationToken).order_by(NotificationToken.token).all()
    expected_notification_tokens_content = [(1, 'token_abc123', 'iPhone'), (1, 'token_xyz789', 'Android Phone')]
    
    compare_notification_tokens_contents(notification_tokens_ordered_by_token, expected_notification_tokens_content)
    


def test_notification_tokens_filtered_by_device_name(db_session: Session):
    notification_token1 = NotificationToken(account_id = 1, 
                                            token = 'token_xyz789',
                                            device_name = 'Android Phone')
    notification_token2 = NotificationToken(account_id = 1, 
                                            token = 'token_abc123',
                                            device_name = 'iPhone')
    db_session.add(notification_token1)
    db_session.add(notification_token2)
    db_session.commit()

    notification_tokens_filtered_by_device = db_session.query(NotificationToken).where(NotificationToken.device_name.in_(['iPhone'])).all()
    expected_notification_tokens_content = [(1, 'token_abc123', 'iPhone')]
    
    compare_notification_tokens_contents(notification_tokens_filtered_by_device, expected_notification_tokens_content)
