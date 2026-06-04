from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import DeviceModel
from tests.conftest import db_session
import pytest



def compare_devicemodels_contents(db_query_result: list, expected_result: list):
    for i in range(len(expected_result)):
        model_name, chamber_number = expected_result[i]
        assert ((db_query_result[i].model_name == model_name) and 
                (db_query_result[i].chamber_number == chamber_number))
        


def test_devicemodels_content(db_session: Session):
    device_model = DeviceModel(model_name = 'MedSmart-v1', chamber_number = 4)
    db_session.add(device_model)
    db_session.commit()

    current_devicemodels_content = db_session.query(DeviceModel).all()
    expected_devicemodels_content = [('MedSmart-v1', 4)]
    compare_devicemodels_contents(current_devicemodels_content, expected_devicemodels_content)



def test_devicemodels_insert_devicemodel(db_session: Session):
    device_model1 = DeviceModel(model_name = 'MedSmart-v1', chamber_number = 4)
    db_session.add(device_model1)
    db_session.commit()

    device_model2 = DeviceModel(model_name = 'MedSmart-v2', chamber_number = 3)
    db_session.add(device_model2)
    db_session.commit()

    current_devicemodels_content = db_session.query(DeviceModel).all()
    expected_devicemodels_content = [('MedSmart-v1', 4), ('MedSmart-v2', 3)]

    compare_devicemodels_contents(current_devicemodels_content, expected_devicemodels_content)



def test_devicemodels_delete_devicemodel(db_session: Session):
    device_model1 = DeviceModel(model_name = 'MedSmart-v1', chamber_number = 4)
    db_session.add(device_model1)
    db_session.commit()

    device_model2 = DeviceModel(model_name = 'MedSmart-v2', chamber_number = 3)
    db_session.add(device_model2)
    db_session.commit()

    db_session.delete(device_model2)
    db_session.commit()

    current_devicemodels_content = db_session.query(DeviceModel).all()
    expected_devicemodels_content = [('MedSmart-v1', 4)]

    compare_devicemodels_contents(current_devicemodels_content, expected_devicemodels_content)



def test_devicemodels_update_devicemodel(db_session: Session):
    device_model = DeviceModel(model_name = 'MedSmart-v1', chamber_number = 4)
    db_session.add(device_model)
    db_session.commit()

    db_session.query(DeviceModel).filter(DeviceModel.model_id == 1).update(
        {DeviceModel.model_name : 'SmartMed-v500', 
         DeviceModel.chamber_number : 8}
    )
    db_session.commit()

    current_devicemodels_content = db_session.query(DeviceModel).all()
    expected_devicemodels_content = [('SmartMed-v500', 8)]

    compare_devicemodels_contents(current_devicemodels_content, expected_devicemodels_content)



def test_devicemodels_null_data(db_session: Session):
    device_model1 = DeviceModel(model_name = 'MedSmart-v1', chamber_number = 4)
    db_session.add(device_model1)
    db_session.commit()

    db_session.query(DeviceModel).filter(DeviceModel.model_id == 1).update(
        {DeviceModel.model_name : 'MedSmartv1000', 
         DeviceModel.chamber_number : 5}
    )
    db_session.commit()

    devicemodel2 = DeviceModel(model_name = None, chamber_number = None)
    db_session.add(devicemodel2)
    with pytest.raises(IntegrityError):
        db_session.commit()
        
    db_session.rollback()
    current_devicemodels_content = db_session.query(DeviceModel).all()
    expected_devicemodels_content = [('MedSmartv1000', 5)]

    compare_devicemodels_contents(current_devicemodels_content, expected_devicemodels_content)



def test_devicemodels_order_records(db_session: Session):
    device_model1 = DeviceModel(model_name = 'MedSmart-v1', chamber_number = 4)
    db_session.add(device_model1)
    db_session.commit()
    db_session.query(DeviceModel).filter(DeviceModel.model_id == 1).update(
        {DeviceModel.model_name : 'MedSmartv1000', 
         DeviceModel.chamber_number : 5}
    )
    db_session.commit()

    devicemodel2 = DeviceModel(model_name = 'SmartMedv100', chamber_number = 3)
    devicemodel3 = DeviceModel(model_name = 'SmartSmartMedv100', chamber_number = 4)
    db_session.add(devicemodel2)
    db_session.add(devicemodel3)
    db_session.commit()

    devicemodels_ordered_by_name = db_session.query(DeviceModel).order_by(DeviceModel.model_name).all()
    expected_devicemodels_content = [('MedSmartv1000', 5), ('SmartMedv100', 3), ('SmartSmartMedv100', 4)]
    
    compare_devicemodels_contents(devicemodels_ordered_by_name, expected_devicemodels_content)
    


def test_accounts_filtered_by_name(db_session: Session):
    device_model1 = DeviceModel(model_name = 'MedSmart-v1', chamber_number = 4)
    db_session.add(device_model1)
    db_session.commit()

    db_session.query(DeviceModel).filter(DeviceModel.model_id == 1).update(
        {DeviceModel.model_name : 'MedSmartv1000', 
         DeviceModel.chamber_number : 5}
    )
    db_session.commit()

    devicemodel2 = DeviceModel(model_name = 'SmartMedv100', chamber_number = 3)
    devicemodel3 = DeviceModel(model_name = 'SmartSmartMedv100', chamber_number = 4)
    db_session.add(devicemodel2)
    db_session.add(devicemodel3)
    db_session.commit()

    devicemodels_filtered_by_name = db_session.query(DeviceModel).where(DeviceModel.model_name.in_(['MedSmartv1000', 'SmartSmartMedv100'])).all()
    expected_devicemodels_content = [('MedSmartv1000', 5),
                                     ('SmartSmartMedv100', 4)]
    
    compare_devicemodels_contents(devicemodels_filtered_by_name, expected_devicemodels_content)