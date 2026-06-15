from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError
from app.models import DispenseLog, MedicationChamber
from tests.db_objects_fixtures import pg_session, pg_setup, seed_base
import pytest



def test_dispense_medication_records_dispense_log(pg_session: Session):
    ids = seed_base(pg_session, stock = 30, dosage = 2)

    pg_session.execute(text('CALL dispense_medication(:id)'), {'id': ids['dts_id']})

    logs = (pg_session.query(DispenseLog)
            .filter(DispenseLog.dts_id == ids['dts_id'])
            .all())
    assert len(logs) == 1



def test_dispense_medication_unknown_dts_raises(pg_session: Session):
    seed_base(pg_session)

    with pytest.raises(DBAPIError, match = 'No dispense schedule'):
        pg_session.execute(text('CALL dispense_medication(:id)'), {'id': 999999})



def test_dispense_medication_insufficient_stock_raises(pg_session: Session):
    ids = seed_base(pg_session, stock = 1, dosage = 5)

    with pytest.raises(DBAPIError, match = 'Insufficient stock'):
        pg_session.execute(text('CALL dispense_medication(:id)'), {'id': ids['dts_id']})



def test_refill_chamber_increases_stock(pg_session: Session):
    ids = seed_base(pg_session, stock = 30)

    pg_session.execute(
        text('CALL refill_chamber(:chamber_id, :amount)'),
        {'chamber_id': ids['chamber_id'], 'amount': 20}
    )

    mc = (pg_session.query(MedicationChamber)
          .filter(MedicationChamber.mc_id == ids['mc_id'])
          .one())
    assert mc.stock == 50



def test_refill_chamber_non_positive_amount_raises(pg_session: Session):
    ids = seed_base(pg_session)

    with pytest.raises(DBAPIError, match = 'must be positive'):
        pg_session.execute(
            text('CALL refill_chamber(:chamber_id, :amount)'),
            {'chamber_id': ids['chamber_id'], 'amount': 0}
        )



def test_refill_chamber_unknown_chamber_raises(pg_session: Session):
    seed_base(pg_session)

    with pytest.raises(DBAPIError, match = 'No medication assigned'):
        pg_session.execute(
            text('CALL refill_chamber(:chamber_id, :amount)'),
            {'chamber_id': 999999, 'amount': 10}
        )
