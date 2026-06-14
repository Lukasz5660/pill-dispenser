INSERT INTO device_models (model_name, chamber_number)
VALUES ('MedSmart-v1', 4);

INSERT INTO accounts (account_name, password_hash, email)
VALUES ('John Doe', 'pbkdf2:sha256:600000$hashedpasswordstring', 'john.doe@example.com');

INSERT INTO devices (hardware_serial, model_id, account_id, last_heartbeat)
VALUES ('SN-IOT-2026-XYZ', 1, 1, CURRENT_TIMESTAMP);

INSERT INTO users (username, account_id)
VALUES ('Grandpa Joe', 1);

INSERT INTO medications (account_id, med_name)
VALUES (1, 'Lisinopril'),
       (1, 'Atorvastatin');

INSERT INTO chambers (chamber_id, device_id, chamber_number)
VALUES (1, 1, 1),
       (2, 1, 2);

INSERT INTO medications_chambers (chamber_id, medication_id, stock)
VALUES (1, 1, 30),
       (2, 2, 15);

INSERT INTO dispense_times (dispense_time_id, user_id, "time")
VALUES (1, 1, '08:00:00');

INSERT INTO schedules (schedule_id, medication_id, user_id, start_time, end_time)
VALUES (1, 1, 1, '2026-01-01', '2026-12-31'),
       (2, 2, 1, '2026-01-01', '2026-12-31');

INSERT INTO dispense_times_schedules (dts_id, schedule_id, dispense_time_id, dosage)
VALUES (1, 1, 1, 1),
       (2, 2, 1, 2);

SELECT setval('chambers_chamber_id_seq', (SELECT MAX(chamber_id) FROM chambers));
SELECT setval('dispense_times_dispense_time_id_seq', (SELECT MAX(dispense_time_id) FROM dispense_times));
SELECT setval('schedules_schedule_id_seq', (SELECT MAX(schedule_id) FROM schedules));
SELECT setval('dispense_times_schedules_dts_id_seq', (SELECT MAX(dts_id) FROM dispense_times_schedules));
