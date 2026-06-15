from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError
from datetime import datetime
from app.models import MedicationChamber, Device
from tests.db_objects_fixtures import pg_session, pg_setup, seed_base
import pytest



def test_trg_deduct_stock_reduces_stock_on_dispense(pg_session: Session):
    ids = seed_base(pg_session, stock = 30, dosage = 2)

    #   inserting a dispense log fires trg_deduct_stock
    pg_session.execute(
        text('INSERT INTO dispense_logs (dts_id, actual_time) VALUES (:id, NOW())'),
        {'id': ids['dts_id']}
    )

    mc = (pg_session.query(MedicationChamber)
          .filter(MedicationChamber.mc_id == ids['mc_id'])
          .one())
    pg_session.refresh(mc)
    assert mc.stock == 28



def test_trg_check_stock_rejects_negative_stock(pg_session: Session):
    ids = seed_base(pg_session, stock = 5)

    #   trg_check_stock (BEFORE UPDATE) must reject a negative result
    with pytest.raises(DBAPIError, match = 'Insufficient stock'):
        pg_session.execute(
            text('UPDATE medications_chambers SET stock = -5 WHERE mc_id = :id'),
            {'id': ids['mc_id']}
        )



def test_trg_heartbeat_updates_device_last_heartbeat(pg_session: Session):
    ids = seed_base(pg_session)

    old_heartbeat = datetime(2000, 1, 1, 0, 0, 0)
    pg_session.execute(
        text('UPDATE devices SET last_heartbeat = :ts WHERE device_id = :id'),
        {'ts': old_heartbeat, 'id': ids['device_id']}
    )

    #   inserting a dispense log fires trg_heartbeat
    pg_session.execute(
        text('INSERT INTO dispense_logs (dts_id, actual_time) VALUES (:id, NOW())'),
        {'id': ids['dts_id']}
    )

    device = (pg_session.query(Device)
              .filter(Device.device_id == ids['device_id'])
              .one())
    pg_session.refresh(device)
    assert device.last_heartbeat > old_heartbeat
