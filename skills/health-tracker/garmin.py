#!/usr/bin/env python3
"""
Garmin Connect Integration for Health Tracker Skill
Pulls daily health data: sleep, HRV, recovery, activity load, VO2 max
"""

import json
import os
import requests
from datetime import datetime, date
from pathlib import Path

# Paths
SKILL_DIR = Path(__file__).parent
WORKSPACE = Path("/home/clawd/.openclaw/workspace-ceo")
CREDS_FILE = WORKSPACE / "config/garmin-credentials.json"
DATA_DIR = WORKSPACE / "memory/health"
LOG_FILE = SKILL_DIR / "health-tracker.log"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)

def log(message):
    """Log with timestamp"""
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    msg = f"[{timestamp}] {message}"
    print(msg)
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")

def load_credentials():
    """Load Garmin credentials"""
    if not CREDS_FILE.exists():
        log("⚠️ No Garmin credentials file found")
        return None
    with open(CREDS_FILE, "r") as f:
        return json.load(f)

def save_credentials(creds):
    """Save updated credentials"""
    with open(CREDS_FILE, "w") as f:
        json.dump(creds, f, indent=2)

def get_garmin_client(creds):
    """Initialize Garmin Connect client"""
    try:
        from garmin_connect import GarminConnect
        return GarminConnect(creds["email"], creds["password"])
    except ImportError:
        log("❌ garmin-connect package not installed")
        return None
    except Exception as e:
        log(f"❌ Failed to init Garmin client: {e}")
        return None

def fetch_daily_summary(client, target_date=None):
    """Fetch daily health summary for a specific date"""
    if target_date is None:
        target_date = date.today()
    
    try:
        log(f"Fetching Garmin data for {target_date}...")
        summary = client.get_daily_summary_data(target_date)
        return summary
    except Exception as e:
        log(f"❌ Failed to fetch daily summary: {e}")
        return None

def fetch_sleep_data(client, target_date=None):
    """Fetch sleep data"""
    if target_date is None:
        target_date = date.today()
    
    try:
        sleep = client.get_sleep_data(target_date)
        return sleep
    except Exception as e:
        log(f"❌ Failed to fetch sleep data: {e}")
        return None

def fetch_body_battery(client, target_date=None):
    """Fetch body battery / recovery data"""
    if target_date is None:
        target_date = date.today()
    
    try:
        # Body battery data is often in stress details
        stress = client.get_stress_details(target_date)
        return stress
    except Exception as e:
        log(f"❌ Failed to fetch body battery: {e}")
        return None

def parse_garmin_data(summary, sleep, stress):
    """Parse Garmin data into standardized format"""
    data = {
        "date": str(date.today()),
        "source": "garmin",
        "sleep": {},
        "recovery": {},
        "activity": {},
        "vo2": None
    }
    
    # Parse sleep
    if sleep:
        try:
            data["sleep"] = {
                "duration_seconds": sleep.get("sleepDurationSeconds", 0),
                "deep_seconds": sleep.get("deepSleepDurationSeconds", 0),
                "light_seconds": sleep.get("lightSleepDurationSeconds", 0),
                "rem_seconds": sleep.get("remSleepDurationSeconds", 0),
                "awake_seconds": sleep.get("awakeDurationSeconds", 0),
                "score": sleep.get("sleepScore", 0)
            }
        except Exception as e:
            log(f"⚠️ Failed to parse sleep: {e}")
    
    # Parse daily summary for activity
    if summary:
        try:
            data["activity"] = {
                "steps": summary.get("steps", 0),
                "distance_meters": summary.get("distance", 0),
                "calories": summary.get("calories", 0),
                "active_minutes": summary.get("activeMinutes", 0)
            }
        except Exception as e:
            log(f"⚠️ Failed to parse activity: {e}")
    
    # Parse stress/body battery for recovery
    if stress:
        try:
            avg_stress = stress.get("averageStressLevel", 0)
            # Simple recovery approximation: 100 - avg_stress
            recovery = max(0, min(100, 100 - avg_stress))
            data["recovery"] = {
                "body_battery_avg": stress.get("bodyBatteryAverage", 0),
                "body_battery_max": stress.get("bodyBatteryMaximum", 0),
                "body_battery_min": stress.get("bodyBatteryMinimum", 0),
                "average_stress": avg_stress,
                "recovery_percent": recovery
            }
        except Exception as e:
            log(f"⚠️ Failed to parse recovery: {e}")
    
    return data

def load_baseline():
    """Load health baseline from memory"""
    baseline_file = WORKSPACE / "memory/health-baseline.json"
    if baseline_file.exists():
        with open(baseline_file, "r") as f:
            return json.load(f)
    return None

def save_daily_health(data):
    """Save daily health data"""
    output_file = DATA_DIR / f"{data['date']}.json"
    with open(output_file, "w") as f:
        json.dump(data, f, indent=2)
    log(f"💾 Saved health data to {output_file}")
    return output_file

def generate_brief(data, baseline=None):
    """Generate morning health brief"""
    brief = []
    brief.append(f"💪 HEALTH BRIEF — {data['date']}")
    brief.append("")
    
    # Sleep
    if data.get("sleep"):
        s = data["sleep"]
        duration_h = s.get("duration_seconds", 0) / 3600
        duration_m = int((duration_h % 1) * 60)
        score = s.get("score", "N/A")
        brief.append(f"Sleep: {int(duration_h)}h {duration_m}m | Score: {score}/100")
    
    # Recovery
    if data.get("recovery"):
        r = data["recovery"]
        recovery_pct = r.get("recovery_percent", 0)
        hrv = r.get("body_battery_avg", "N/A")
        brief.append(f"Recovery: {recovery_pct}% (HRV: {hrv})")
    
    # Activity
    if data.get("activity"):
        a = data["activity"]
        steps = a.get("steps", 0)
        cal = a.get("calories", 0)
        brief.append(f"Activity: {steps:,} steps | {cal} cal")
    
    brief.append("")
    
    # Status
    if data.get("recovery"):
        recovery_pct = data["recovery"].get("recovery_percent", 0)
        if recovery_pct >= 70:
            status = "✅ Green — cleared for hard training"
        elif recovery_pct >= 40:
            status = "🟡 Yellow — moderate training recommended"
        else:
            status = "🔴 Red — light day / rest recommended"
        brief.append(f"STATUS: {status}")
    
    brief.append("")
    
    # Alerts
    alerts = []
    if data.get("sleep"):
        duration_h = data["sleep"].get("duration_seconds", 0) / 3600
        if duration_h < 5:
            alerts.append("⚠️ Less than 5h sleep detected")
    if data.get("recovery"):
        recovery_pct = data["recovery"].get("recovery_percent", 0)
        if recovery_pct < 30:
            alerts.append(f"⚠️ Recovery at {recovery_pct}% — recommend rest")
    
    if alerts:
        brief.append("ALERTS:")
        for alert in alerts:
            brief.append(alert)
    
    return "\n".join(brief)

def main():
    """Main fetch and brief generation"""
    log("=" * 50)
    log("Starting Garmin health sync...")
    
    # Load credentials
    creds = load_credentials()
    if not creds:
        log("❌ No Garmin credentials. Add to config/garmin-credentials.json:")
        log('{"email": "your@email.com", "password": "yourpassword"}')
        return
    
    # Get client
    client = get_garmin_client(creds)
    if not client:
        log("❌ Could not initialize Garmin client")
        return
    
    # Fetch data
    summary = fetch_daily_summary(client)
    sleep = fetch_sleep_data(client)
    stress = fetch_body_battery(client)
    
    # Parse
    data = parse_garmin_data(summary, sleep, stress)
    
    # Save
    save_daily_health(data)
    
    # Generate brief
    baseline = load_baseline()
    brief = generate_brief(data, baseline)
    print("\n" + brief)
    
    log("✅ Garmin sync complete!")

if __name__ == "__main__":
    main()
