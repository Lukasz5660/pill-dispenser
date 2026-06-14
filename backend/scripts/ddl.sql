CREATE TABLE IF NOT EXISTS device_models (
    model_id SERIAL PRIMARY KEY,
    model_name VARCHAR(50) NOT NULL,
    chamber_number INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
    account_id SERIAL PRIMARY KEY,
    account_name VARCHAR(50) NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
    device_id SERIAL PRIMARY KEY,
    hardware_serial VARCHAR(100) UNIQUE NOT NULL,
    model_id INTEGER NOT NULL,
    last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_id INTEGER NOT NULL,
    CONSTRAINT fk_device_model FOREIGN KEY (model_id) REFERENCES device_models (model_id),
    CONSTRAINT fk_device_account FOREIGN KEY (account_id) REFERENCES accounts (account_id)
);

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    account_id INTEGER NOT NULL,
    CONSTRAINT fk_user_account FOREIGN KEY (account_id) REFERENCES accounts (account_id)
);

CREATE TABLE IF NOT EXISTS medications (
    medication_id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL,
    med_name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_medication_account FOREIGN KEY (account_id) REFERENCES accounts (account_id)
);

CREATE TABLE IF NOT EXISTS notification_tokens (
    token_id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL,
    token VARCHAR(256) NOT NULL,
    device_name VARCHAR(50),
    CONSTRAINT fk_token_account FOREIGN KEY (account_id) REFERENCES accounts (account_id)
);

CREATE TABLE IF NOT EXISTS chambers (
    chamber_id SERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL,
    chamber_number INTEGER NOT NULL,
    CONSTRAINT fk_chamber_device FOREIGN KEY (device_id) REFERENCES devices (device_id)
);

CREATE TABLE IF NOT EXISTS schedules (
    schedule_id SERIAL PRIMARY KEY,
    medication_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    start_time DATE NOT NULL,
    end_time DATE NOT NULL,
    CONSTRAINT fk_schedule_medication FOREIGN KEY (medication_id) REFERENCES medications (medication_id),
    CONSTRAINT fk_schedule_user FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE IF NOT EXISTS dispense_times (
    dispense_time_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    time TIME NOT NULL,
    CONSTRAINT fk_dispense_time_user FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE IF NOT EXISTS medications_chambers (
    mc_id SERIAL PRIMARY KEY,
    chamber_id INTEGER NOT NULL,
    medication_id INTEGER NOT NULL,
    stock INTEGER DEFAULT 0,
    CONSTRAINT fk_mc_chamber FOREIGN KEY (chamber_id) REFERENCES chambers (chamber_id),
    CONSTRAINT fk_mc_medication FOREIGN KEY (medication_id) REFERENCES medications (medication_id)
);

CREATE TABLE IF NOT EXISTS dispense_times_schedules (
    dts_id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL,
    dispense_time_id INTEGER NOT NULL,
    dosage INTEGER NOT NULL,
    CONSTRAINT fk_dts_schedule FOREIGN KEY (schedule_id) REFERENCES schedules (schedule_id),
    CONSTRAINT fk_dts_dispense_time FOREIGN KEY (dispense_time_id) REFERENCES dispense_times (dispense_time_id)
);

CREATE TABLE IF NOT EXISTS notification_logs (
    not_log_id SERIAL PRIMARY KEY,
    dispense_time_id INTEGER NOT NULL,
    actual_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20),
    CONSTRAINT fk_not_log_dispense_time FOREIGN KEY (dispense_time_id) REFERENCES dispense_times (dispense_time_id)
);

CREATE TABLE IF NOT EXISTS dispense_logs (
    log_id SERIAL PRIMARY KEY,
    dts_id INTEGER NOT NULL,
    actual_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dispense_log_dts FOREIGN KEY (dts_id) REFERENCES dispense_times_schedules (dts_id)
);