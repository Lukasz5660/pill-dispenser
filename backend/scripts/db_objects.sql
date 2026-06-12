-- Sequences

CREATE SEQUENCE IF NOT EXISTS device_models_model_id_seq
    START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;

CREATE SEQUENCE IF NOT EXISTS accounts_account_id_seq
    START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;

CREATE SEQUENCE IF NOT EXISTS devices_device_id_seq
    START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;

CREATE SEQUENCE IF NOT EXISTS users_user_id_seq
    START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;

CREATE SEQUENCE IF NOT EXISTS medications_medication_id_seq
    START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;

CREATE SEQUENCE IF NOT EXISTS schedules_schedule_id_seq
    START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;

CREATE SEQUENCE IF NOT EXISTS dispense_times_dispense_time_id_seq
    START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;

CREATE SEQUENCE IF NOT EXISTS dispense_times_schedules_dts_id_seq
    START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;

CREATE SEQUENCE IF NOT EXISTS chambers_chamber_id_seq
    START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;

CREATE SEQUENCE IF NOT EXISTS medications_chambers_mc_id_seq
    START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;

CREATE SEQUENCE IF NOT EXISTS notification_tokens_token_id_seq
    START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;

CREATE SEQUENCE IF NOT EXISTS notification_logs_not_log_id_seq
    START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;

CREATE SEQUENCE IF NOT EXISTS dispense_logs_log_id_seq
    START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;


-- Triggers

-- After a dispense log is inserted, deduct stock from medications_chambers.
CREATE OR REPLACE FUNCTION trg_deduct_stock_on_dispense()
RETURNS TRIGGER AS $$
DECLARE
    v_dosage      INT;
    v_medication_id INT;
BEGIN
    SELECT dts.dosage, s.medication_id
    INTO   v_dosage, v_medication_id
    FROM   dispense_times_schedules dts
    JOIN   schedules s ON s.schedule_id = dts.schedule_id
    WHERE  dts.dts_id = NEW.dts_id;

    UPDATE medications_chambers
    SET    stock = stock - v_dosage
    WHERE  medication_id = v_medication_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deduct_stock ON dispense_logs;
CREATE TRIGGER trg_deduct_stock
    AFTER INSERT ON dispense_logs
    FOR EACH ROW
    EXECUTE FUNCTION trg_deduct_stock_on_dispense();

-- Before updating medications_chambers, reject any update that would set stock below zero (guard against over-dispensing).
CREATE OR REPLACE FUNCTION trg_prevent_negative_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock < 0 THEN
        RAISE EXCEPTION
            'Insufficient stock in chamber % for medication %: would become %',
            NEW.chamber_id, NEW.medication_id, NEW.stock;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_stock ON medications_chambers;
CREATE TRIGGER trg_check_stock
    BEFORE UPDATE ON medications_chambers
    FOR EACH ROW
    EXECUTE FUNCTION trg_prevent_negative_stock();


-- After a dispense log is inserted, update last_heartbeat on the device that physically holds the medication being dispensed.
CREATE OR REPLACE FUNCTION trg_update_device_heartbeat()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE devices d
    SET    last_heartbeat = NOW()
    FROM   dispense_times_schedules dts
    JOIN   schedules s   ON s.schedule_id    = dts.schedule_id
    JOIN   medications m ON m.medication_id  = s.medication_id
    JOIN   medications_chambers mc ON mc.medication_id = m.medication_id
    JOIN   chambers c    ON c.chamber_id     = mc.chamber_id
    WHERE  dts.dts_id = NEW.dts_id
      AND  c.device_id = d.device_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_heartbeat ON dispense_logs;
CREATE TRIGGER trg_heartbeat
    AFTER INSERT ON dispense_logs
    FOR EACH ROW
    EXECUTE FUNCTION trg_update_device_heartbeat();


-- procedures

-- Validates that there is sufficient stock for the given dispense_times_schedules row, then records a dispense log entry.
CREATE OR REPLACE PROCEDURE dispense_medication(p_dts_id INT)
LANGUAGE plpgsql AS $$
DECLARE
    v_dosage        INT;
    v_medication_id INT;
    v_current_stock INT;
BEGIN
    SELECT dts.dosage, s.medication_id
    INTO   v_dosage, v_medication_id
    FROM   dispense_times_schedules dts
    JOIN   schedules s ON s.schedule_id = dts.schedule_id
    WHERE  dts.dts_id = p_dts_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No dispense schedule found with dts_id = %', p_dts_id;
    END IF;

    SELECT stock
    INTO   v_current_stock
    FROM   medications_chambers
    WHERE  medication_id = v_medication_id;

    IF v_current_stock < v_dosage THEN
        RAISE EXCEPTION
            'Insufficient stock: required %, available %', v_dosage, v_current_stock;
    END IF;

    INSERT INTO dispense_logs (dts_id, actual_time)
    VALUES (p_dts_id, NOW());
END;
$$;

-- Adds p_amount pills to the stock of the medication assigned to the given chamber.
CREATE OR REPLACE PROCEDURE refill_chamber(p_chamber_id INT, p_amount INT)
LANGUAGE plpgsql AS $$
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Refill amount must be positive, got %', p_amount;
    END IF;

    UPDATE medications_chambers
    SET    stock = stock + p_amount
    WHERE  chamber_id = p_chamber_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No medication assigned to chamber_id = %', p_chamber_id;
    END IF;
END;
$$;



-- functions

-- Returns all schedules currently active (today falls between start_time
CREATE OR REPLACE FUNCTION get_active_schedules(p_user_id INT)
RETURNS TABLE (
    schedule_id   INT,
    med_name      VARCHAR,
    start_time    DATE,
    end_time      DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.schedule_id,
           m.med_name,
           s.start_time,
           s.end_time
    FROM   schedules s
    JOIN   medications m ON m.medication_id = s.medication_id
    WHERE  s.user_id    = p_user_id
      AND  CURRENT_DATE BETWEEN s.start_time AND s.end_time;
END;
$$ LANGUAGE plpgsql;

-- Returns the chamber number, medication name, and current stock for every
CREATE OR REPLACE FUNCTION get_stock_status(p_device_id INT)
RETURNS TABLE (
    chamber_number INT,
    med_name       VARCHAR,
    stock          INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.chamber_number,
           m.med_name,
           mc.stock
    FROM   chambers c
    JOIN   medications_chambers mc ON mc.chamber_id    = c.chamber_id
    JOIN   medications m           ON m.medication_id  = mc.medication_id
    WHERE  c.device_id = p_device_id
    ORDER  BY c.chamber_number;
END;
$$ LANGUAGE plpgsql;

-- Returns every scheduled dispense for today: medication name, dispense
CREATE OR REPLACE FUNCTION get_todays_dispenses(p_user_id INT)
RETURNS TABLE (
    med_name      VARCHAR,
    dispense_time TIME,
    dosage        INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.med_name,
           dt.time         AS dispense_time,
           dts.dosage
    FROM   schedules s
    JOIN   medications m              ON m.medication_id       = s.medication_id
    JOIN   dispense_times_schedules dts ON dts.schedule_id     = s.schedule_id
    JOIN   dispense_times dt          ON dt.dispense_time_id   = dts.dispense_time_id
    WHERE  s.user_id    = p_user_id
      AND  CURRENT_DATE BETWEEN s.start_time AND s.end_time
    ORDER  BY dt.time;
END;
$$ LANGUAGE plpgsql;
