from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import time
from app.models import User
from tests.db_objects_fixtures import pg_session, pg_setup, seed_base



def test_get_active_schedules_returns_active_schedule(pg_session: Session):
    ids = seed_base(pg_session)

    rows = pg_session.execute(
        text('SELECT schedule_id, med_name, start_time, end_time '
             'FROM get_active_schedules(:uid)'),
        {'uid': ids['user_id']}
    ).fetchall()

    matching = [r for r in rows if r.schedule_id == ids['schedule_id']]
    assert len(matching) == 1
    assert matching[0].med_name == ids['med_name']



def test_get_active_schedules_empty_for_user_without_schedules(pg_session: Session):
    ids = seed_base(pg_session)

    lonely_user = User(username = 'No Schedules', account_id = ids['account_id'])
    pg_session.add(lonely_user)
    pg_session.flush()

    rows = pg_session.execute(
        text('SELECT * FROM get_active_schedules(:uid)'),
        {'uid': lonely_user.user_id}
    ).fetchall()

    assert rows == []



def test_get_todays_dispenses_returns_scheduled_dispense(pg_session: Session):
    ids = seed_base(pg_session, dosage = 2)

    rows = pg_session.execute(
        text('SELECT med_name, dispense_time, dosage '
             'FROM get_todays_dispenses(:uid)'),
        {'uid': ids['user_id']}
    ).fetchall()

    matching = [r for r in rows if r.med_name == ids['med_name']]
    assert len(matching) == 1
    assert matching[0].dispense_time == time(8, 0, 0)
    assert matching[0].dosage == 2



def test_get_stock_status_returns_chamber_stock(pg_session: Session):
    ids = seed_base(pg_session, stock = 30)

    rows = pg_session.execute(
        text('SELECT chamber_number, med_name, stock '
             'FROM get_stock_status(:device_id)'),
        {'device_id': ids['device_id']}
    ).fetchall()

    #   device_id is unique to the seeded scenario, so only its chamber is returned
    assert len(rows) == 1
    assert rows[0].chamber_number == 1
    assert rows[0].med_name == ids['med_name']
    assert rows[0].stock == 30
