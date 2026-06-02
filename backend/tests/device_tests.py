from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import Device
from tests.test_session import db_session
import pytest
from datetime import datetime



def compare_devices_contents(db_query_result: list, expected_result: list):
    for i in range(len(expected_result)):
        hardware_serial, model_id, account_id = expected_result[i]
        assert ((db_query_result[i].hardware_serial == hardware_serial) and 
                (db_query_result[i].model_id == model_id) and 
                (db_query_result[i].account_id == account_id))
        


def test_devices_content(db_session: Session):
    current_devices_content = db_session.query(Device).all()
    expected_devices_content = [('SN-IOT-2026-XYZ', 1, 1)]
    compare_devices_contents(current_devices_content, expected_devices_content)



def test_devices_insert_device(db_session: Session):
    device = Device(hardware_serial = 'SN-IOT-2026-ABC', 
                    model_id = 1,
                    account_id = 1)
    db_session.add(device)
    db_session.commit()

    current_devices_content = db_session.query(Device).all()
    expected_devices_content = [('SN-IOT-2026-XYZ', 1, 1), ('SN-IOT-2026-ABC', 1, 1)]

    compare_devices_contents(current_devices_content, expected_devices_content)



def test_devices_delete_device(db_session: Session):
    device = Device(hardware_serial = 'SN-IOT-2026-ABC', 
                    model_id = 1,
                    account_id = 1)
    db_session.add(device)
    db_session.commit()

    db_session.delete(device)
    db_session.commit()

    current_devices_content = db_session.query(Device).all()
    expected_devices_content = [('SN-IOT-2026-XYZ', 1, 1)]

    compare_devices_contents(current_devices_content, expected_devices_content)



def test_devices_update_device(db_session: Session):
    db_session.query(Device).filter(Device.device_id == 1).update(
        {Device.hardware_serial : 'SN-IOT-2026-UPDATED', 
         Device.model_id : 1,
         Device.account_id : 1}
    )
    db_session.commit()

    current_devices_content = db_session.query(Device).all()
    expected_devices_content = [('SN-IOT-2026-UPDATED', 1, 1)]

    compare_devices_contents(current_devices_content, expected_devices_content)



def test_devices_null_data(db_session: Session):
    db_session.query(Device).filter(Device.device_id == 1).update(
        {Device.hardware_serial : 'SN-IOT-2026-TEST'}
    )
    db_session.commit()

    device = Device(hardware_serial = None, 
                    model_id = None,
                    account_id = None)
    
    db_session.add(device)
    with pytest.raises(IntegrityError):
        db_session.commit()
        
    db_session.rollback()
    current_devices_content = db_session.query(Device).all()
    expected_devices_content = [('SN-IOT-2026-TEST', 1, 1)]

    compare_devices_contents(current_devices_content, expected_devices_content)



def test_devices_duplicate_serial(db_session: Session):
    device = Device(hardware_serial = 'SN-IOT-2026-XYZ',
                    model_id = 1,
                    account_id = 1)
    
    db_session.add(device)
    with pytest.raises(IntegrityError):
        db_session.commit()
    
    db_session.rollback()
    current_devices_content = db_session.query(Device).all()
    expected_devices_content = [('SN-IOT-2026-XYZ', 1, 1)]

    compare_devices_contents(current_devices_content, expected_devices_content)



def test_devices_order_records(db_session: Session):
    db_session.query(Device).filter(Device.device_id == 1).update(
        {Device.hardware_serial : 'SN-IOT-2026-AAA'}
    )
    db_session.commit()

    device1 = Device(hardware_serial = 'SN-IOT-2026-ZZZ', 
                     model_id = 1,
                     account_id = 1)
    device2 = Device(hardware_serial = 'SN-IOT-2026-MMM', 
                     model_id = 1,
                     account_id = 1)
    db_session.add(device1)
    db_session.add(device2)
    db_session.commit()

    devices_ordered_by_serial = db_session.query(Device).order_by(Device.hardware_serial).all()
    expected_devices_content = [('SN-IOT-2026-AAA', 1, 1), ('SN-IOT-2026-MMM', 1, 1), ('SN-IOT-2026-ZZZ', 1, 1)]
    
    compare_devices_contents(devices_ordered_by_serial, expected_devices_content)
    


def test_devices_filtered_by_serial(db_session: Session):
    db_session.query(Device).filter(Device.device_id == 1).update(
        {Device.hardware_serial : 'SN-IOT-2026-AAA'}
    )
    db_session.commit()

    device1 = Device(hardware_serial = 'SN-IOT-2026-ZZZ', 
                     model_id = 1,
                     account_id = 1)
    device2 = Device(hardware_serial = 'SN-IOT-2026-MMM', 
                     model_id = 1,
                     account_id = 1)
    db_session.add(device1)
    db_session.add(device2)
    db_session.commit()

    devices_filtered_by_serial = db_session.query(Device).where(Device.hardware_serial.in_(['SN-IOT-2026-AAA', 'SN-IOT-2026-MMM'])).all()
    expected_devices_content = [('SN-IOT-2026-AAA', 1, 1), ('SN-IOT-2026-MMM', 1, 1)]
    
    compare_devices_contents(devices_filtered_by_serial, expected_devices_content)
