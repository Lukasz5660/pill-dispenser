from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import Account
from tests.test_session import db_session
import pytest


def compare_contents(db_query_result: list, expected_result: list):
    for i in range(len(expected_result)):
        account_name, password_hash, email = expected_result[i]
        assert ((db_query_result[i].account_name == account_name) and 
                (db_query_result[i].password_hash == password_hash) and 
                (db_query_result[i].email == email)) 



def test_accounts_content(db_session: Session):
    current_accounts_content = db_session.query(Account).all()
    expected_accounts_content = [('John Doe', 'pbkdf2:sha256:600000$hashedpasswordstring', 'john.doe@example.com')]
    compare_contents(current_accounts_content, expected_accounts_content)



def test_accounts_insert_account(db_session: Session):
    account = Account(account_name = 'Wojciech Fiedoruk', 
                      password_hash = 'pbkdf2:sha256:600001$hashedpasswordstring', 
                      email = 'wojciech.fiedoruk@example.com')
    db_session.add(account)
    db_session.commit()

    current_accounts_content = db_session.query(Account).all()
    expected_accounts_content = [('John Doe', 'pbkdf2:sha256:600000$hashedpasswordstring', 'john.doe@example.com'),
                               ('Wojciech Fiedoruk', 'pbkdf2:sha256:600001$hashedpasswordstring', 'wojciech.fiedoruk@example.com')]

    compare_contents(current_accounts_content, expected_accounts_content)



def test_accounts_delete_account(db_session: Session):
    account = Account(account_name = 'Wojciech Fiedoruk', 
                      password_hash = 'pbkdf2:sha256:600001$hashedpasswordstring', 
                      email = 'wojciech.fiedoruk@example.com')
    db_session.add(account)
    db_session.commit()

    db_session.delete(account)
    db_session.commit()
    current_accounts_content = db_session.query(Account).all()

    expected_accounts_content = [('John Doe', 'pbkdf2:sha256:600000$hashedpasswordstring', 'john.doe@example.com')]

    compare_contents(current_accounts_content, expected_accounts_content)



def test_accounts_update_account(db_session: Session):
    db_session.query(Account).filter(Account.account_id == 1).update(
        {Account.account_name : 'Kamil Troszczyński', 
         Account.password_hash : 'pbf2:sha256:600000$hashedpasordsing', 
         Account.email : 'troszczkamil@o2.com'}
    )
    db_session.commit()

    current_accounts_content = db_session.query(Account).all()
    expected_accounts_content = [('Kamil Troszczyński', 'pbf2:sha256:600000$hashedpasordsing', 'troszczkamil@o2.com')]

    compare_contents(current_accounts_content, expected_accounts_content)
    


def test_accounts_repeated_emails(db_session: Session):
    db_session.query(Account).filter(Account.account_id == 1).update(
        {Account.account_name : 'Kamil Troszczyński', 
         Account.password_hash : 'pbf2:sha256:600000$hashedpasordsing', 
         Account.email : 'troszczkamil@o2.com'}
    )
    db_session.commit()

    account = Account(account_name = 'Wojciech Fiedoruk', 
                      password_hash = 'pbkdf2:sha256:600001$hashedpasswordstring', 
                      email = 'troszczkamil@o2.com')
    db_session.add(account)
    with pytest.raises(IntegrityError):
        db_session.commit()
    
    db_session.rollback()
    current_accounts_content = db_session.query(Account).all()
    expected_accounts_content = [('Kamil Troszczyński', 'pbf2:sha256:600000$hashedpasordsing', 'troszczkamil@o2.com')]

    compare_contents(current_accounts_content, expected_accounts_content)



def test_accounts_null_data(db_session: Session):
    db_session.query(Account).filter(Account.account_id == 1).update(
        {Account.account_name : 'Kamil Troszczyński', 
         Account.password_hash : 'pbf2:sha256:600000$hashedpasordsing', 
         Account.email : 'troszczkamil@o2.com'}
    )
    db_session.commit()
    account = Account(account_name = None, 
                      password_hash = None, 
                      email = None)
    db_session.add(account)
    with pytest.raises(IntegrityError):
        db_session.commit()
        
    db_session.rollback()
    current_accounts_content = db_session.query(Account).all()
    expected_accounts_content = [('Kamil Troszczyński', 'pbf2:sha256:600000$hashedpasordsing', 'troszczkamil@o2.com')]

    compare_contents(current_accounts_content, expected_accounts_content)



def test_accounts_order_records(db_session: Session):
    db_session.query(Account).filter(Account.account_id == 1).update(
        {Account.account_name : 'Kamil Troszczyński', 
         Account.password_hash : 'pbf2:sha256:600000$hashedpasordsing', 
         Account.email : 'troszczkamil@o2.com'}
    )
    db_session.commit()

    account1 = Account(account_name = 'Wojciech Fiedoruk', 
                      password_hash = 'pbkdf2:sha226:600001$hashedpasswordstring', 
                      email = 'wojciech.fiedoruk@examples.com')
    account2 = Account(account_name = 'Jan Kowalski', 
                      password_hash = 'pbkdf1:sha156:600001$hashedpasswordstring', 
                      email = 'jan.kowalski@examples.com')
    db_session.add(account1)
    db_session.add(account2)
    db_session.commit()

    accounts_ordered_by_name = db_session.query(Account).order_by(Account.account_name).all()
    expected_accounts_content = [('Jan Kowalski', 'pbkdf1:sha156:600001$hashedpasswordstring', 'jan.kowalski@examples.com'), 
                                 ('Kamil Troszczyński', 'pbf2:sha256:600000$hashedpasordsing', 'troszczkamil@o2.com'),
                                 ('Wojciech Fiedoruk', 'pbkdf2:sha226:600001$hashedpasswordstring', 'wojciech.fiedoruk@examples.com')]
    
    compare_contents(accounts_ordered_by_name, expected_accounts_content)
    


def test_accounts_filtered_by_name(db_session: Session):
    db_session.query(Account).filter(Account.account_id == 1).update(
        {Account.account_name : 'Kamil Troszczyński', 
         Account.password_hash : 'pbf2:sha256:600000$hashedpasordsing', 
         Account.email : 'troszczkamil@o2.com'}
    )
    db_session.commit()

    account1 = Account(account_name = 'Wojciech Fiedoruk', 
                      password_hash = 'pbkdf2:sha226:600001$hashedpasswordstring', 
                      email = 'wojciech.fiedoruk@examples.com')
    account2 = Account(account_name = 'Jan Kowalski', 
                      password_hash = 'pbkdf1:sha156:600001$hashedpasswordstring', 
                      email = 'jan.kowalski@examples.com')
    db_session.add(account1)
    db_session.add(account2)
    db_session.commit()

    accounts_filtered_by_name = db_session.query(Account).where(Account.account_name.in_(['Wojciech Fiedoruk', 'Jan Kowalski'])).all()
    expected_accounts_content = [('Wojciech Fiedoruk', 'pbkdf2:sha226:600001$hashedpasswordstring', 'wojciech.fiedoruk@examples.com'),
                                 ('Jan Kowalski', 'pbkdf1:sha156:600001$hashedpasswordstring', 'jan.kowalski@examples.com')]
    
    compare_contents(accounts_filtered_by_name, expected_accounts_content)
