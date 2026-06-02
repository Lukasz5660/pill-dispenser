from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
import pytest
import os


DATABASE_URL = 'postgresql://admin:pudzian@localhost:5432/pill_dispenser_db'


engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind = engine)


@pytest.fixture(scope='function')
def db_session():
    connection = engine.connect()
    transaction = connection.begin()

    session = Session(bind = connection)

    nested = connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(sess, trans):
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


