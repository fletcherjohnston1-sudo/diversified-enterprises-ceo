# Google Calendar Skill

Use this skill when Fletcher asks you to add, schedule, or create a calendar event.

## How to add an event

Run this Python command via bash:

```bash
python3 /home/clawd/.openclaw/shared-data/gcal/gcal_client.py \
  --summary "EVENT TITLE" \
  --start "YYYY-MM-DDTHH:MM:00-05:00" \
  --end "YYYY-MM-DDTHH:MM:00-05:00" \
  --description "OPTIONAL DESCRIPTION"
```

## Rules

- Always confirm the event title, date, and time with Fletcher before creating
- Default duration is 1 hour if not specified
- Always use America/New_York timezone offset (-05:00 EST or -04:00 EDT)
- Report back the event link after creation