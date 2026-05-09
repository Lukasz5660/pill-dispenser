from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String, TIMESTAMP, Time, Date, ForeignKey, UniqueConstraint, Index, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, time, date
from typing import List, Optional

db = SQLAlchemy()

class DeviceModel(db.Model):
    __tablename__ = "device_models"

    model_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    model_name: Mapped[str] = mapped_column(String(50), nullable=False)
    chamber_number: Mapped[int] = mapped_column(Integer, nullable=False)

    devices: Mapped[List["Device"]] = relationship(back_populates="model")

class Account(db.Model):
    __tablename__ = "accounts"

    account_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    account_name: Mapped[str] = mapped_column(String(50), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(256), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    devices: Mapped[List["Device"]] = relationship(back_populates="account")
    users: Mapped[List["User"]] = relationship(back_populates="account")
    medications: Mapped[List["Medication"]] = relationship(back_populates="account")
    notification_tokens: Mapped[List["NotificationToken"]] = relationship(back_populates="account")

class Device(db.Model):
    __tablename__ = "devices"

    device_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    hardware_serial: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    model_id: Mapped[int] = mapped_column(ForeignKey("device_models.model_id"), nullable=False)
    last_heartbeat: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.account_id"), nullable=False)

    model: Mapped["DeviceModel"] = relationship(back_populates="devices")
    account: Mapped["Account"] = relationship(back_populates="devices")
    chambers: Mapped[List["Chamber"]] = relationship(back_populates="device")

class User(db.Model):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.account_id"), nullable=False)

    account: Mapped["Account"] = relationship(back_populates="users")
    schedules: Mapped[List["Schedule"]] = relationship(back_populates="user")
    dispense_times: Mapped[List["DispenseTime"]] = relationship(back_populates="user")

class Medication(db.Model):
    __tablename__ = "medications"

    medication_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.account_id"), nullable=False)
    med_name: Mapped[str] = mapped_column(String(100), nullable=False)

    account: Mapped["Account"] = relationship(back_populates="medications")
    schedules: Mapped[List["Schedule"]] = relationship(back_populates="medication")
    chambers: Mapped[List["MedicationChamber"]] = relationship(back_populates="medication")

class Schedule(db.Model):
    __tablename__ = "schedules"

    schedule_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    medication_id: Mapped[int] = mapped_column(ForeignKey("medications.medication_id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    start_time: Mapped[date] = mapped_column(Date, nullable=False)
    end_time: Mapped[date] = mapped_column(Date, nullable=False)

    user: Mapped["User"] = relationship(back_populates="schedules")
    medication: Mapped["Medication"] = relationship(back_populates="schedules")
    dts_entries: Mapped[List["DispenseTimeSchedule"]] = relationship(back_populates="schedule")

class DispenseTime(db.Model):
    __tablename__ = "dispense_times"

    dispense_time_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    time: Mapped[time] = mapped_column(Time, nullable=False)

    user: Mapped["User"] = relationship(back_populates="dispense_times")
    dts_entries: Mapped[List["DispenseTimeSchedule"]] = relationship(back_populates="dispense_time")
    notification_logs: Mapped[List["NotificationLog"]] = relationship(back_populates="dispense_time")

class DispenseTimeSchedule(db.Model):
    __tablename__ = "dispense_times_schedules"

    dts_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    schedule_id: Mapped[int] = mapped_column(ForeignKey("schedules.schedule_id"), nullable=False)
    dispense_time_id: Mapped[int] = mapped_column(ForeignKey("dispense_times.dispense_time_id"), nullable=False)
    dosage: Mapped[int] = mapped_column(Integer, nullable=False)

    schedule: Mapped["Schedule"] = relationship(back_populates="dts_entries")
    dispense_time: Mapped["DispenseTime"] = relationship(back_populates="dts_entries")
    dispense_logs: Mapped[List["DispenseLog"]] = relationship(back_populates="dts")

class Chamber(db.Model):
    __tablename__ = "chambers"

    chamber_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("devices.device_id"), nullable=False)
    chamber_number: Mapped[int] = mapped_column(Integer, nullable=False)

    device: Mapped["Device"] = relationship(back_populates="chambers")
    medication_links: Mapped[List["MedicationChamber"]] = relationship(back_populates="chamber")

class MedicationChamber(db.Model):
    __tablename__ = "medications_chambers"

    mc_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    chamber_id: Mapped[int] = mapped_column(ForeignKey("chambers.chamber_id"), nullable=False)
    medication_id: Mapped[int] = mapped_column(ForeignKey("medications.medication_id"), nullable=False)
    stock: Mapped[int] = mapped_column(Integer, default=0)

    chamber: Mapped["Chamber"] = relationship(back_populates="medication_links")
    medication: Mapped["Medication"] = relationship(back_populates="chambers")

class NotificationToken(db.Model):
    __tablename__ = "notification_tokens"

    token_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.account_id"), nullable=False)
    token: Mapped[str] = mapped_column(String(256), nullable=False)
    device_name: Mapped[Optional[str]] = mapped_column(String(50))

    account: Mapped["Account"] = relationship(back_populates="notification_tokens")

class NotificationLog(db.Model):
    __tablename__ = "notification_logs"

    not_log_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dispense_time_id: Mapped[int] = mapped_column(ForeignKey("dispense_times.dispense_time_id"), nullable=False)
    actual_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[Optional[str]] = mapped_column(String(20))

    dispense_time: Mapped["DispenseTime"] = relationship(back_populates="notification_logs")

class DispenseLog(db.Model):
    __tablename__ = "dispense_logs"

    log_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dts_id: Mapped[int] = mapped_column(ForeignKey("dispense_times_schedules.dts_id"), nullable=False)
    actual_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[Optional[str]] = mapped_column(String(20))

    dts: Mapped["DispenseTimeSchedule"] = relationship(back_populates="dispense_logs")