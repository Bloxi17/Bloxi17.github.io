import os
import sys

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from auto_master_scheduler import run_autonomous_pipeline

def run_automated_upload_slot(slot_name="morning", count=3, privacy="public"):
    """
    Direct delegate to the Master Autonomous Engine:
    - morning -> slot1 (12:30 PM)
    - evening -> slot2 (7:30 PM)
    - special -> Sunday Extra Special (Top 10 Beauties)
    """
    slot_map = {
        "morning": "slot1",
        "evening": "slot2",
        "special": "special",
        "slot1": "slot1",
        "slot2": "slot2"
    }
    target_slot = slot_map.get(slot_name.lower(), "slot1")
    return run_autonomous_pipeline(slot=target_slot, privacy=privacy)

if __name__ == "__main__":
    slot = sys.argv[1] if len(sys.argv) > 1 else "morning"
    priv = sys.argv[2] if len(sys.argv) > 2 else "public"
    run_automated_upload_slot(slot_name=slot, privacy=priv)
