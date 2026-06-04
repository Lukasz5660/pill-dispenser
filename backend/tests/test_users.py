from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import User
from tests.conftest import db_session
import pytest



def compare_users_contents(db_query_result: list, expected_result: list):
    for i in range(len(expected_result)):
        username, account_id = expected_result[i]
        assert ((db_query_result[i].username == username) and 
                (db_query_result[i].account_id == account_id))
        


def test_users_content(db_session: Session):
    user = User(username = 'Grandpa Joe', 
                account_id = 1)
    db_session.add(user)
    db_session.commit()

    current_users_content = db_session.query(User).all()
    expected_users_content = [('Grandpa Joe', 1)]
    compare_users_contents(current_users_content, expected_users_content)



def test_users_insert_user(db_session: Session):
    user1 = User(username = 'Grandpa Joe', 
                account_id = 1)
    db_session.add(user1)
    db_session.commit()

    user2 = User(username = 'Granny Agatha', 
                account_id = 1)
    db_session.add(user2)
    db_session.commit()

    current_users_content = db_session.query(User).all()
    expected_users_content = [('Grandpa Joe', 1), ('Granny Agatha', 1)]

    compare_users_contents(current_users_content, expected_users_content)



def test_users_delete_user(db_session: Session):
    user1 = User(username = 'Grandpa Joe', 
                account_id = 1)
    db_session.add(user1)
    db_session.commit()

    user2 = User(username = 'Granny Agatha', 
                account_id = 1)
    db_session.add(user2)
    db_session.commit()

    db_session.delete(user2)
    db_session.commit()

    current_users_content = db_session.query(User).all()
    expected_users_content = [('Grandpa Joe', 1)]

    compare_users_contents(current_users_content, expected_users_content)



def test_users_update_user(db_session: Session):
    user = User(username = 'Grandpa Joe', 
                account_id = 1)
    db_session.add(user)
    db_session.commit()

    db_session.query(User).filter(User.user_id == 1).update(
        {User.username : 'Granny Agatha', 
         User.account_id : 1}
    )
    db_session.commit()

    current_users_content = db_session.query(User).all()
    expected_users_content = [('Granny Agatha', 1)]

    compare_users_contents(current_users_content, expected_users_content)



def test_users_null_data(db_session: Session):
    user1 = User(username = 'Grandpa Joe', 
                account_id = 1)
    db_session.add(user1)
    db_session.commit()

    db_session.query(User).filter(User.user_id == 1).update(
        {User.username : 'Granny Agatha', 
         User.account_id : 1}
    )
    db_session.commit()

    user2 = User(username = None, 
                account_id = None)
    
    db_session.add(user2)
    with pytest.raises(IntegrityError):
        db_session.commit()
        
    db_session.rollback()
    current_users_content = db_session.query(User).all()
    expected_users_content = [('Granny Agatha', 1)]

    compare_users_contents(current_users_content, expected_users_content)



def test_users_order_records(db_session: Session):
    user1 = User(username = 'Grandpa Joe', 
                account_id = 1)
    db_session.add(user1)
    db_session.commit()

    db_session.query(User).filter(User.user_id == 1).update(
        {User.username : 'Granny Agatha', 
         User.account_id : 1}
    )
    db_session.commit()

    user2 = User(username = 'John Doe', 
                account_id = 1)
    user3 = User(username = 'Martha Monroe', 
                account_id = 1)
    db_session.add(user2)
    db_session.add(user3)
    db_session.commit()

    users_ordered_by_name = db_session.query(User).order_by(User.username).all()
    expected_users_content = [('Granny Agatha', 1), ('John Doe', 1), ('Martha Monroe', 1)]
    
    compare_users_contents(users_ordered_by_name, expected_users_content)
    


def test_users_filtered_by_name(db_session: Session):
    user1 = User(username = 'Grandpa Joe', 
                account_id = 1)
    db_session.add(user1)
    db_session.commit()

    db_session.query(User).filter(User.user_id == 1).update(
        {User.username : 'Granny Agatha', 
         User.account_id : 1}
    )
    db_session.commit()

    user2 = User(username = 'John Doe', 
                account_id = 1)
    user3 = User(username = 'Martha Monroe', 
                account_id = 1)
    db_session.add(user2)
    db_session.add(user3)
    db_session.commit()

    users_filtered_by_name = db_session.query(User).where(User.username.in_(['Granny Agatha', 'Martha Monroe'])).all()
    expected_users_content = [('Granny Agatha', 1), ('Martha Monroe', 1)]
    
    compare_users_contents(users_filtered_by_name, expected_users_content)