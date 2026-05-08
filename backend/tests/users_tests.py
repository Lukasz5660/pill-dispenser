from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import User
from tests.test_session import db_session
import pytest



def compare_users_contents(db_query_result: list, expected_result: list):
    for i in range(len(expected_result)):
        username, account_id = expected_result[i]
        assert ((db_query_result[i].username == username) and 
                (db_query_result[i].account_id == account_id))
        


def test_users_content(db_session: Session):
    current_users_content = db_session.query(User).all()
    expected_users_content = [('Grandpa Joe', 1)]
    compare_users_contents(current_users_content, expected_users_content)



def test_users_insert_user(db_session: Session):
    user = User(username = 'Granny Agatha', 
                account_id = 1)
    db_session.add(user)
    db_session.commit()

    current_users_content = db_session.query(User).all()
    expected_users_content = [('Grandpa Joe', 1), ('Granny Agatha', 1)]

    compare_users_contents(current_users_content, expected_users_content)



def test_users_delete_user(db_session: Session):
    user = User(username = 'Granny Agatha', 
                account_id = 1)
    db_session.add(user)
    db_session.commit()

    db_session.delete(user)
    db_session.commit()

    current_users_content = db_session.query(User).all()
    expected_users_content = [('Grandpa Joe', 1)]

    compare_users_contents(current_users_content, expected_users_content)