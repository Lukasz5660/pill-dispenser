from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String, TIMESTAMP, Time, Date, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, time, date
from typing import List, Optional

db = SQLAlchemy()

# 1. Device Models
class DeviceModel(db.Model):
    __tablename__ = 'device_models'
    model_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    model_name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    chamber_number: Mapped[int] = mapped_column(Integer, nullable=False)

    devices: Mapped[List["Device"]] = relationship(back_populates="model")

# 2. Accounts
class Account(db.Model):
    __tablename__ = 'accounts'
    account_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    account_name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(256), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    users: Mapped[List["User"]] = relationship(back_populates="account")
    devices: Mapped[List["Device"]] = relationship(back_populates="account")
    medications: Mapped[List["Medication"]] = relationship(back_populates="account")
    tokens: Mapped[List["NotificationToken"]] = relationship(back_populates="account")

# 3. Devices
class Device(db.Model):
    __tablename__ = 'devices'
    device_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    hardware_serial: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    model_id: Mapped[int] = mapped_column(ForeignKey('device_models.model_id'))
    account_id: Mapped[int] = mapped_column(ForeignKey('accounts.account_id'))
    last_heartbeat: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True))

    model: Mapped["DeviceModel"] = relationship(back_populates="devices")
    account: Mapped["Account"] = relationship(back_populates="devices")

# 4. Users
class User(db.Model):
    __tablename__ = 'users'
    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False) # Not unique
    account_id: Mapped[int] = mapped_column(ForeignKey('accounts.account_id'))

    account: Mapped["Account"] = relationship(back_populates="users")
    schedules: Mapped[List["Schedule"]] = relationship(back_populates="user")
    dispense_times: Mapped[List["DispenseTime"]] = relationship(back_populates="user")

# 5. Medications
class Medication(db.Model):
    __tablename__ = 'medications'
    medication_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey('accounts.account_id'))
    med_name: Mapped[str] = mapped_column(String(100), nullable=False)
    total_stock: Mapped[int] = mapped_column(Integer, default=0)
    chamber: Mapped[Optional[int]] = mapped_column(Integer)

    account: Mapped["Account"] = relationship(back_populates="medications")
    
    __table_args__ = (
        UniqueConstraint('account_id', 'med_name', name='uq_med_account_name'),
        Index('idx_med_account', 'account_id'), # Manual index for faster lookups
    )

# 6. Schedules
class Schedule(db.Model):
    __tablename__ = 'schedules'
    schedule_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    medication_id: Mapped[int] = mapped_column(ForeignKey('medications.medication_id'))
    user_id: Mapped[int] = mapped_column(ForeignKey('users.user_id'))
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)

    user: Mapped["User"] = relationship(back_populates="schedules")

# 7. Dispense Times
class DispenseTime(db.Model):
    __tablename__ = 'dispense_times'
    dispense_time_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.user_id'))
    time_of_day: Mapped[time] = mapped_column(Time, nullable=False)

    user: Mapped["User"] = relationship(back_populates="dispense_times")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'time_of_day', name='uq_user_time'),
    )

# 8. Dispense Times Schedules (Linker)
class DispenseTimesSchedule(db.Model):
    __tablename__ = 'dispense_times_schedules'
    dts_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    schedule_id: Mapped[int] = mapped_column(ForeignKey('schedules.schedule_id'))
    dispense_time_id: Mapped[int] = mapped_column(ForeignKey('dispense_times.dispense_time_id'))
    dosage: Mapped[int] = mapped_column(Integer, nullable=False)

# 9. Dispense Logs
class DispenseLog(db.Model):
    __tablename__ = 'dispense_logs'
    log_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    dts_id: Mapped[int] = mapped_column(ForeignKey('dispense_times_schedules.dts_id'))
    actual_time: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(20), nullable=False)

    __table_args__ = (
        Index('idx_log_dts', 'dts_id'), # Manual index for FK
    )

# 10. Notification Tokens
class NotificationToken(db.Model):
    __tablename__ = 'notification_tokens'
    token_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey('accounts.account_id'))
    token: Mapped[str] = mapped_column(String(256), unique=True, nullable=False)
    device_name: Mapped[Optional[str]] = mapped_column(String(50))

    account: Mapped["Account"] = relationship(back_populates="tokens")

# 11. Notification Logs
class NotificationLog(db.Model):
    __tablename__ = 'notification_logs'
    not_log_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    dispense_time_id: Mapped[int] = mapped_column(ForeignKey('dispense_times.dispense_time_id'))
    actual_time: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(20))