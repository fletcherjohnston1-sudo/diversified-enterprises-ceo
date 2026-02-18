# Skill: health-tracker

## What It Does
Personal health intelligence layer. Connects to health APIs (Whoop, Apple Health, Garmin, Strava) to produce daily health summaries, log workouts via chat, track sleep/recovery trends, and proactively flag when recovery or sleep is below threshold.

## Inspired By
Real use cases from Reddit/X:
- Latenode blog: "Users connect health APIs (e.g. Whoop) so OpenClaw can produce daily health summaries: sleep, recovery, activity"
- Community reports of grocery ordering, weekly meal planning
- Strava-Garmin sync already running on this instance (cron job active)
- Users logging workouts by message: "log a 30 min run"

## How To Use
Trigger phrases:
- "How did I sleep last night?"
- "Log a 45 min run at 8:30am"
- "What's my Whoop recovery today?"
- "Give me my weekly health summary"
- "Am I okay to train hard today?"

## What It Does Step By Step
1. Pulls data from connected health APIs (Strava already integrated; Whoop/Garmin via API keys)
2. Parses sleep score, HRV, recovery %, activity load
3. Compares against user baseline (stored in memory)
4. Answers natural language questions about health data
5. Proactively alerts if recovery <30% or sleep <5h ("Chairman, rough night — recommend light day")
6. Logs manual entries (food, workouts, supplements) via chat message

## Output Format
```
💪 HEALTH BRIEF — [date]

Sleep: 7h 23m | Score: 82/100
Recovery: 74% (HRV: 58ms)
Activity: 4.2 miles run | 312 cal
Strain: 14.2/21

STATUS: ✅ Green — cleared for hard training today

TREND: Sleep quality up 12% this week
```

## Storage
- Baseline profile: `memory/health-baseline.json`
- Daily logs: `memory/health/YYYY-MM-DD.json`
- Manual entries: appended to daily log

## Implementation (as of Feb 17, 2026)

### Files Created
```
skills/health-tracker/
├── SKILL.md              # This file
├── garmin.py             # Garmin Connect API integration
├── health_tracker.py     # Main handler (queries, workout logging)
├── strava_adapter.py     # Strava fallback adapter
└── health-tracker.log   # Log file
```

### Setup Required
1. Add Garmin credentials to `/home/clawd/.openclaw/workspace-ceo/config/garmin-credentials.json`:
   ```json
   {"email": "your@email.com", "password": "yourpassword"}
   ```
2. Strava data syncs automatically (already configured)
3. Run `python3 garmin.py` to test Garmin connection

### Usage
- Query: `python3 health_tracker.py "how did I sleep?"`
- Log workout: `python3 health_tracker.py "log a 30 min run"`
- Full brief: `python3 health_tracker.py`

### Data Storage
- Daily health: `/home/clawd/.openclaw/workspace-ceo/memory/health/YYYY-MM-DD.json`
- Baseline: `/home/clawd/.openclaw/workspace-ceo/memory/health-baseline.json`

### Note on Garmin Package
The `garmin-connect` Python package isn't available on this system. Garmin.py includes the integration code but will need credentials and may require manual API testing.

### Cron Job (to be configured)
```json
{
  "schedule": { "kind": "cron", "expr": "0 7 * * *", "tz": "America/New_York" },
  "payload": { "kind": "agentTurn", "message": "Run health-tracker and send morning brief." }
}
```
