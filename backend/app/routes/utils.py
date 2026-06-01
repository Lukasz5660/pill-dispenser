from app.models import db,Device

def _get_device_id_for_account(account_id: int) -> int | None:
    device = db.session.scalar(db.select(Device).filter_by(account_id=account_id).limit(1))
    return device.device_id if device else None