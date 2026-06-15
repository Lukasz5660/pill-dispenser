from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker
import pytest
import os
from datetime import date, time as dt_time, timedelta
from app.models import (db, Account, DeviceModel, Device, User, Medication,
                        Chamber, MedicationChamber, DispenseTime, Schedule,
                        DispenseTimeSchedule)


PG_DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql://admin:pudzian@localhost:5432/pill_dispenser_db'
)

DB_OBJECTS_PATH = os.path.join(
    os.path.dirname(__file__), '..', 'scripts', 'db_objects.sql'
)

pg_engine = create_engine(PG_DATABASE_URL)
PgSession = sessionmaker(autocommit = False, autoflush = False, bind = pg_engine)


@pytest.fixture(scope = 'session')
def pg_setup():
    try:
        conn = pg_engine.connect()
        conn.close()
    except OperationalError:
        pytest.skip('PostgreSQL not available')

    db.metadata.create_all(bind = pg_engine)

    with open(DB_OBJECTS_PATH, 'r') as f:
        sql_script = f.read()

    raw = pg_engine.raw_connection()
    try:
        cursor = raw.cursor()
        cursor.execute(sql_script)
        raw.commit()
    finally:
        raw.close()

    yield


@pytest.fixture(scope = 'function')
def pg_session(pg_setup):
    connection = pg_engine.connect()
    transaction = connection.begin()
    session = PgSession(bind = connection)

    #   checkpoint so anything the tested objects write is rolled back per test
    savepoint = connection.begin_nested()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


def seed_base(session, stock = 30, dosage = 2):
    today = date.today()

    account = Account(account_name = 'Seed Acc',
                      password_hash = 'x',
                      email = 'seed_test@example.com')
    session.add(account)
    session.flush()

    model = DeviceModel(model_name = 'SeedModel', chamber_number = 2)
    session.add(model)
    session.flush()

    device = Device(hardware_serial = 'SEED-TEST-SERIAL',
                    model_id = model.model_id,
                    account_id = account.account_id)
    session.add(device)
    session.flush()

    user = User(username = 'Seed User', account_id = account.account_id)
    session.add(user)
    session.flush()

    medication = Medication(account_id = account.account_id, med_name = 'SeedMed')
    session.add(medication)
    session.flush()

    chamber = Chamber(device_id = device.device_id, chamber_number = 1)
    session.add(chamber)
    session.flush()

    mc = MedicationChamber(chamber_id = chamber.chamber_id,
                           medication_id = medication.medication_id,
                           stock = stock)
    session.add(mc)
    session.flush()

    dispense_time = DispenseTime(user_id = user.user_id, time = dt_time(8, 0, 0))
    session.add(dispense_time)
    session.flush()

    schedule = Schedule(medication_id = medication.medication_id,
                        user_id = user.user_id,
                        start_time = today - timedelta(days = 1),
                        end_time = today + timedelta(days = 1))
    session.add(schedule)
    session.flush()

    dts = DispenseTimeSchedule(schedule_id = schedule.schedule_id,
                               dispense_time_id = dispense_time.dispense_time_id,
                               dosage = dosage)
    session.add(dts)
    session.flush()

    return {
        'account_id': account.account_id,
        'device_id': device.device_id,
        'user_id': user.user_id,
        'medication_id': medication.medication_id,
        'chamber_id': chamber.chamber_id,
        'mc_id': mc.mc_id,
        'dispense_time_id': dispense_time.dispense_time_id,
        'schedule_id': schedule.schedule_id,
        'dts_id': dts.dts_id,
        'stock': stock,
        'dosage': dosage,
        'med_name': 'SeedMed',
    }
