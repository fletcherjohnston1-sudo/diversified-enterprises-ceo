#!/usr/bin/env python3
"""
Health Tracker Skill - Main Handler
Handles natural language queries and workout logging
"""

import json
import re
import os
from datetime import datetime, date, timedelta
from pathlib import Path
from difflib import SequenceMatcher

# Paths
WORKSPACE = Path("/home/clawd/.openclaw/workspace-ceo")
DATA_DIR = WORKSPACE / "memory/health"
BASELINE_FILE = WORKSPACE / "memory/health-baseline.json"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)

def log(message):
    print(f"[health-tracker] {message}")

def load_daily_health(target_date=None):
    """Load health data for a specific date"""
    if target_date is None:
        target_date = date.today()
    
    file_path = DATA_DIR / f"{target_date}.json"
    if file_path.exists():
        with open(file_path, "r") as f:
            return json.load(f)
    return None

def load_baseline():
    """Load health baseline"""
    if BASELINE_FILE.exists():
        with open(BASELINE_FILE, "r") as f:
            return json.load(f)
    return None

def save_baseline(baseline):
    """Save health baseline"""
    with open(BASELINE_FILE, "w") as f:
        json.dump(baseline, f, indent=2)

def load_weekly_data():
    """Load last 7 days of health data"""
    data = []
    for i in range(7):
        d = date.today() - timedelta(days=i)
        day_data = load_daily_health(d)
        if day_data:
            data.append(day_data)
    return data

def parse_workout_log(message):
    """Parse workout from natural language message"""
    # Patterns to match:
    # "log a 30 min run"
    # "log 45 min bike"
    # "logged 1 hour swim"
    
    patterns = [
        r"log(?:ged)?\s+(?:a\s+)?(\d+(?:\.\d+)?)\s*(min|minute|minutes|hour|hr|hours)\s+(\w+)",
        r"(\d+(?:\.\d+)?)\s*(min|minute|minutes|hour|hr|hours)\s+(\w+)",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, message.lower())
        if match:
            duration_val = float(match.group(1))
            unit = match.group(2)
            activity = match.group(3)
            
            # Convert to minutes
            if unit.startswith("hour") or unit.startswith("hr"):
                duration = int(duration_val * 60)
            else:
                duration = int(duration_val)
            
            # Normalize activity
            activity = activity.lower().strip()
            if "run" in activity:
                activity_type = "Run"
            elif "bike" in activity or "cycling" in activity:
                activity_type = "Bike"
            elif "swim" in activity:
                activity_type = "Swim"
            elif "walk" in activity:
                activity_type = "Walk"
            elif "lift" in activity or "weight" in activity:
                activity_type = "Strength"
            else:
                activity_type = activity.capitalize()
            
            return {
                "type": activity_type,
                "duration_min": duration,
                "timestamp": datetime.now().isoformat()
            }
    
    return None

def save_workout(workout):
    """Save workout to today's log"""
    today = date.today()
    log_file = DATA_DIR / f"{today}.json"
    
    # Load existing or create new
    if log_file.exists():
        with open(log_file, "r") as f:
            data = json.load(f)
    else:
        data = {"date": str(today), "source": "manual", "workouts": []}
    
    if "workouts" not in data:
        data["workouts"] = []
    
    data["workouts"].append(workout)
    
    with open(log_file, "w") as f:
        json.dump(data, f, indent=2)
    
    return workout

def format_sleep_response(data):
    """Format sleep data for response"""
    if not data.get("sleep"):
        return "No sleep data available."
    
    s = data["sleep"]
    duration_s = s.get("duration_seconds", 0)
    hours = duration_s // 3600
    minutes = (duration_s % 3600) // 60
    score = s.get("score", "N/A")
    
    response = f"💤 Sleep: {hours}h {minutes}m"
    if score != "N/A":
        response += f" | Score: {score}/100"
    
    return response

def format_recovery_response(data):
    """Format recovery data for response"""
    if not data.get("recovery"):
        return "No recovery data available."
    
    r = data["recovery"]
    recovery_pct = r.get("recovery_percent", 0)
    hrv = r.get("body_battery_avg", "N/A")
    
    if recovery_pct >= 70:
        status = "✅ Green"
    elif recovery_pct >= 40:
        status = "🟡 Yellow"
    else:
        status = "🔴 Red"
    
    response = f"🔋 Recovery: {recovery_pct}% ({status})"
    if hrv != "N/A":
        response += f" | Body Battery: {hrv}"
    
    return response

def format_training_clearance(data):
    """Determine if cleared for hard training"""
    if not data.get("recovery"):
        return "No recovery data to determine clearance."
    
    recovery_pct = data["recovery"].get("recovery_percent", 0)
    sleep_h = data.get("sleep", {}).get("duration_seconds", 0) / 3600
    
    if recovery_pct >= 70 and sleep_h >= 6:
        return "✅ **CLEARED** for hard training today."
    elif recovery_pct >= 40 or sleep_h >= 5:
        return "🟡 **MODERATE** training recommended."
    else:
        return "🔴 **REST** or light activity only recommended."

def format_weekly_summary():
    """Format weekly health summary"""
    data = load_weekly_data()
    
    if not data:
        return "No health data available for this week."
    
    summary = ["📊 WEEKLY HEALTH SUMMARY", ""]
    
    # Average sleep
    sleep_scores = [d.get("sleep", {}).get("score", 0) for d in data if d.get("sleep")]
    if sleep_scores:
        avg_sleep = sum(sleep_scores) / len(sleep_scores)
        summary.append(f"Avg Sleep Score: {avg_sleep:.0f}/100")
    
    # Average recovery
    recovery_scores = [d.get("recovery", {}).get("recovery_percent", 0) for d in data if d.get("recovery")]
    if recovery_scores:
        avg_recovery = sum(recovery_scores) / len(recovery_scores)
        summary.append(f"Avg Recovery: {avg_recovery:.0f}%")
    
    # Total workouts logged
    total_workouts = sum(len(d.get("workouts", [])) for d in data)
    summary.append(f"Workouts Logged: {total_workouts}")
    
    return "\n".join(summary)

def handle_query(message):
    """Handle natural language health query"""
    message_lower = message.lower()
    
    # Check for workout logging first
    workout = parse_workout_log(message)
    if workout:
        save_workout(workout)
        return f"✅ Logged: {workout['type']} {workout['duration_min']} min"
    
    # Load today's data
    today_data = load_daily_health()
    
    # Sleep queries
    if "sleep" in message_lower:
        if today_data:
            return format_sleep_response(today_data)
        return "No sleep data available. Connect Garmin or Strava."
    
    # Recovery / HRV queries
    if "recovery" in message_lower or "hrv" in message_lower or "body battery" in message_lower:
        if today_data:
            return format_recovery_response(today_data)
        return "No recovery data available."
    
    # Training clearance
    if "clear" in message_lower or "train" in message_lower or "hard" in message_lower:
        if today_data:
            return format_training_clearance(today_data)
        return "No data to determine training clearance."
    
    # Weekly summary
    if "week" in message_lower or "weekly" in message_lower:
        return format_weekly_summary()
    
    # General health brief
    if "health" in message_lower or "brief" in message_lower or "how am i" in message_lower:
        if today_data:
            parts = []
            parts.append(format_sleep_response(today_data))
            parts.append(format_recovery_response(today_data))
            parts.append(format_training_clearance(today_data))
            return "\n".join(parts)
        return "No health data available today."
    
    return "I didn't understand that. Try: 'how did I sleep?', 'what's my recovery?', 'log a 30 min run', or 'am I cleared for hard training?'"

def run_health_check():
    """Run full health check and return brief"""
    today_data = load_daily_health()
    
    if not today_data:
        return "No health data available. Run Garmin sync first."
    
    parts = []
    parts.append(f"💪 HEALTH BRIEF — {today_data.get('date', 'Today')}")
    parts.append("")
    parts.append(format_sleep_response(today_data))
    parts.append(format_recovery_response(today_data))
    parts.append("")
    parts.append(format_training_clearance(today_data))
    
    return "\n".join(parts)

# CLI entry point
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Treat remaining args as query
        query = " ".join(sys.argv[1:])
        print(handle_query(query))
    else:
        # Run full health check
        print(run_health_check())
