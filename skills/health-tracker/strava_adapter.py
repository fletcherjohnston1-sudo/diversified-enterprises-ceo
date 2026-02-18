#!/usr/bin/env python3
"""
Strava Health Adapter for Health Tracker Skill
Fallback when Garmin not available - uses Strava activity data
"""

import json
from datetime import date, timedelta
from pathlib import Path

# Paths
WORKSPACE = Path("/home/clawd/.openclaw/workspace")
DATA_DIR = WORKSPACE / "data/strava"
HEALTH_DIR = Path("/home/clawd/.openclaw/workspace-ceo/memory/health")

def load_strava_activities():
    """Load latest Strava activities"""
    latest = DATA_DIR / "activities_latest.json"
    if latest.exists():
        with open(latest, "r") as f:
            return json.load(f)
    return []

def parse_strava_health():
    """Parse Strava data into health format"""
    activities = load_strava_activities()
    
    if not activities:
        return None
    
    today = date.today()
    today_str = today.isoformat()
    
    # Find today's activities
    today_activities = [
        a for a in activities 
        if a.get("start_date", "").startswith(today_str)
    ]
    
    data = {
        "date": today_str,
        "source": "strava",
        "sleep": {},
        "recovery": {},
        "activity": {},
        "workouts": []
    }
    
    # Aggregate activity data
    total_distance = 0
    total_duration = 0
    total_calories = 0
    
    for a in today_activities:
        dist = a.get("distance", 0) or 0
        dur = a.get("moving_time", 0) or 0
        cal = a.get("calories", 0) or 0
        
        total_distance += dist
        total_duration += dur
        total_calories += cal
        
        # Log as workout
        data["workouts"].append({
            "type": a.get("type", "Activity"),
            "duration_min": int(dur / 60),
            "distance": dist,
            "timestamp": a.get("start_date", "")
        })
    
    # Activity summary (Strava doesn't have sleep/recovery)
    data["activity"] = {
        "distance_meters": total_distance,
        "duration_seconds": total_duration,
        "calories": total_calories,
        "activity_count": len(today_activities)
    }
    
    # Note: Strava alone doesn't provide sleep/recovery
    data["note"] = "Strava data only. Connect Garmin for sleep/recovery."
    
    return data

def format_strava_brief(data):
    """Format brief from Strava data"""
    if not data:
        return "No Strava activity data available."
    
    brief = []
    brief.append(f"🏃 STRAVA ACTIVITY — {data['date']}")
    brief.append("")
    
    a = data.get("activity", {})
    count = a.get("activity_count", 0)
    
    if count > 0:
        dist_km = a.get("distance_meters", 0) / 1000
        duration_min = a.get("duration_seconds", 0) / 60
        cal = a.get("calories", 0)
        
        brief.append(f"Activities: {count}")
        brief.append(f"Distance: {dist_km:.1f} km")
        brief.append(f"Duration: {duration_min:.0f} min")
        brief.append(f"Calories: {cal}")
    else:
        brief.append("No activities recorded today.")
    
    if data.get("note"):
        brief.append("")
        brief.append(f"Note: {data['note']}")
    
    return "\n".join(brief)

# CLI test
if __name__ == "__main__":
    data = parse_strava_health()
    print(format_strava_brief(data))
