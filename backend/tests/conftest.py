from sqlalchemy import create_engine, StaticPool
from sqlalchemy.orm import sessionmaker
import pytest
from app.models import db
import app.models


DATABASE_URL = 'sqlite:///:memory:'


engine = create_engine(DATABASE_URL, connect_args = {'check_same_thread' : False}, poolclass = StaticPool)
Session = sessionmaker(autocommit = False, autoflush = False, bind = engine)


@pytest.fixture(scope = 'session', autouse = True)
def create_tables():
    db.metadata.create_all(bind = engine)
    yield
    db.metadata.drop_all(bind = engine)


@pytest.fixture(scope = 'function')
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind = connection)

    #   checkpoint for tests with exception handling 
    savepoint = connection.begin_nested()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


