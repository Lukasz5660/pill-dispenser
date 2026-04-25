-- 1. Insert a Device Model
-- This defines a hardware type (e.g., a 4-chamber dispenser)
INSERT INTO device_models (model_name, chamber_number)
VALUES ('MedSmart-v1', 4);

-- 2. Insert an Account
-- The main owner of the hardware and subscription
INSERT INTO accounts (account_name, password_hash, email)
VALUES ('John Doe', 'pbkdf2:sha256:600000$hashedpasswordstring', 'john.doe@example.com');

-- 3. Insert a Device
-- Linking a specific serial number to the model and the account
-- Assumes model_id=1 and account_id=1 from previous steps
INSERT INTO devices (hardware_serial, model_id, account_id, last_heartbeat)
VALUES ('SN-IOT-2026-XYZ', 1, 1, CURRENT_TIMESTAMP);

-- 4. Insert a User
-- A specific person (e.g., a family member) who takes the medicine
INSERT INTO users (username, account_id)
VALUES ('Grandpa Joe', 1);

-- 5. Insert Medications
-- Medicine added to the account's digital inventory
INSERT INTO medications (account_id, med_name)
VALUES (1, 'Lisinopril (Blood Pressure)'),
       (1, 'Atorvastatin (Cholesterol)');

-- 6. Set up Chambers
-- Define the physical slots inside the device (Chamber 1 and 2)
INSERT INTO chambers (device_id, chamber_number)
VALUES (1, 1),
       (1, 2);

-- 7. Assign Medication to Chambers (Medications_Chambers)
-- Put Lisinopril (med_id 1) into Chamber 1 with 30 pills in stock
-- Put Atorvastatin (med_id 2) into Chamber 2 with 15 pills in stock
INSERT INTO medications_chambers (chamber_id, medication_id, stock)
VALUES (1, 1, 30),
       (2, 2, 15);

-- 8. Create a Dispense Time
-- Grandpa Joe takes medicine at 08:00:00 every morning
INSERT INTO dispense_times (user_id, "time")
VALUES (1, '08:00:00');