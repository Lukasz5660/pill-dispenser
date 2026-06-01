import json
import os
import logging
from datetime import datetime, timezone
import paho.mqtt.client as mqtt

logger = logging.getLogger(__name__)
_client: mqtt.Client | None = None
_app = None


def init_mqtt(app=None) -> mqtt.Client:
    global _client, _app
    _app = app

    host = os.getenv("MQTT_BROKER_HOST", "localhost")
    port = int(os.getenv("MQTT_BROKER_PORT", 1883))

    _client = mqtt.Client(client_id="pill_dispenser_backend", clean_session=True)
    _client.on_connect = _on_connect
    _client.on_disconnect = _on_disconnect
    _client.on_message = _on_message

    try:
        _client.connect(host, port, keepalive=60)
        _client.loop_start() 
        logger.info("MQTT client connected to %s:%s", host, port)
    except Exception as exc:
        logger.warning("MQTT broker not reachable at startup (%s) — will retry on publish", exc)

    return _client


def _on_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info("MQTT connected (rc=0)")
        # Subscribe to confirmation topics
        client.subscribe("pill_dispenser/+/pub_confirmation")
        
        global _app
        if _app is not None:
            import threading
            def _publish_all():
                with _app.app_context():
                    try:
                        from app.models import db, Device
                        devices = db.session.query(Device).all()
                        for device in devices:
                            publish_sync(device.device_id, _app, wait=True)
                    except Exception as e:
                        logger.error("Failed to publish syncs on connect: %s", e)
            threading.Thread(target=_publish_all, daemon=True).start()
    else:
        logger.warning("MQTT connect failed with rc=%s", rc)


def _on_message(client, userdata, msg):
    global _app
    if _app is None:
        logger.warning("No app context available to process MQTT message")
        return

    topic = msg.topic
    if topic.startswith("pill_dispenser/") and topic.endswith("/pub_confirmation"):
        try:
            payload_str = msg.payload.decode("utf-8").strip()
            logger.info("Received confirmation on %s: %s", topic, payload_str)

            dts_ids = []
            payload = json.loads(payload_str)
            
            for med in payload.get("medications", []):
                for event in med.get("dispense_events", []):
                    if "dts_id" in event:
                        dts_ids.append(event["dts_id"])

            if not dts_ids:
                logger.warning("No dts_id found in confirmation payload on topic %s", topic)
                return

            with _app.app_context():
                from app.models import db, DispenseLog
                for dts_id in dts_ids:
                    # The presence of the log implies status=TAKEN.
                    log = DispenseLog(dts_id=dts_id)
                    db.session.add(log)
                db.session.commit()
                logger.info("Saved DispenseLogs for dts_ids: %s", dts_ids)

        except Exception as e:
            logger.error("Error processing MQTT message on %s: %s", topic, e)


def _on_disconnect(client, userdata, rc):
    if rc != 0:
        logger.warning("MQTT unexpected disconnect (rc=%s)", rc)



def _build_payload(device_id: int, app) -> dict:
    from app.models import Device, User, Schedule, DispenseTimeSchedule, MedicationChamber

    with app.app_context():
        from app.models import db

        device = db.session.get(Device, device_id)
        if not device:
            return {}

        account_id = device.account_id

        users = db.session.scalars(
            db.select(User).filter_by(account_id=account_id)
        ).all()

        users_payload = []
        for user in users:
            medications_payload = []

            for schedule in user.schedules:
                med = schedule.medication

                # Resolve chamber number via medications_chambers → chambers
                chamber_link = next(
                    (mc for mc in med.chambers), None
                )
                chamber_number = (
                    chamber_link.chamber.chamber_number if chamber_link else None
                )

                dispense_events = []
                for dts in schedule.dts_entries:
                    dispense_events.append({
                        "time": dts.dispense_time.time.strftime("%H:%M:%S"),
                        "dosage": dts.dosage,
                        "dts_id": dts.dts_id,
                    })

                medications_payload.append({
                    "schedule_id": schedule.schedule_id,
                    "med_name": med.med_name,
                    "chamber_number": chamber_number,
                    "start_date": schedule.start_time.isoformat(),
                    "end_date": schedule.end_time.isoformat(),
                    "dispense_events": dispense_events,
                })

            users_payload.append({
                "user_id": user.user_id,
                "username": user.username,
                "medications": medications_payload,
            })

        return {
            "sync_time": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "users": users_payload,
        }


def publish_sync(device_id: int, app, wait: bool = True) -> None:
    """
    Build and publish the schedule payload for a given device.

    Topic: pill_dispenser/<device_id>/sync
    QoS:   1
    Retain: True  (last-will semantics — device gets it on reconnect)
    """
    global _client

    if _client is None:
        logger.warning("MQTT client not initialised — skipping publish")
        return

    try:
        payload = _build_payload(device_id, app)
        if not payload:
            logger.warning("No payload built for device_id=%s", device_id)
            return

        topic = f"pill_dispenser/{device_id}/sync"
        message = json.dumps(payload, ensure_ascii=False)

        result = _client.publish(topic, message, qos=1, retain=True)
        if wait:
            result.wait_for_publish(timeout=5)
        logger.info("MQTT published to %s (mid=%s)", topic, result.mid)

    except Exception as exc:
        logger.error("Failed to publish MQTT message for device_id=%s: %s", device_id, exc)
