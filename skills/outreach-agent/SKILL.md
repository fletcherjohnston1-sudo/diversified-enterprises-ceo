# Skill: outreach-agent

## What It Does
End-to-end outreach automation. Handles the full workflow of finding contacts, drafting personalized emails, sending, tracking replies, and following up — for podcast guest booking, partnership outreach, sales prospecting, or investor contact.

## Inspired By
Real use cases from Reddit/X:
- r/ThinkingDeeplyAI: "handle the entire multi-step process of booking podcast guests, from researching potential guests and using APIs to find their contact information to sending outreach emails and managing calendar invites"
- Jason Calacanis's OpenClaw ULTRON: "guest booking automation (high impact)" replacing ~20 entry-level roles
- OpenClaw showcase: solo founders using agents for marketing and business operations 24/7
- X post: bot used 11 Labs API to place a voice call to a restaurant when OpenTable failed

## How To Use
Trigger phrases:
- "Book a podcast guest from [niche/topic]"
- "Send outreach to [list of targets]"
- "Follow up on any unanswered outreach"
- "Find 5 [industry] founders to reach out to"
- "Draft a cold email to [name/company]"

## What It Does Step By Step
1. **Target Discovery**: Web searches for ideal contacts based on criteria (industry, follower count, recent activity)
2. **Research**: Pulls bio, recent content, social proof for each target
3. **Email Draft**: Generates personalized cold outreach using research context
4. **Send** (requires Gmail/gog skill): Sends via configured email account
5. **Track**: Logs all outreach in `memory/outreach/` with status (sent/replied/booked)
6. **Follow-up**: Checks for replies at configurable intervals; auto-drafts follow-up if no response in N days
7. **Calendar**: Books confirmed meetings via Google Calendar (requires gog skill)

## Output Format
```
📬 OUTREACH REPORT — [date]

SENT TODAY: 5 emails
• [Name] @ [Company] — personalized on: [hook used]
• ...

REPLIES RECEIVED: 2
• [Name]: Interested — FOLLOW UP NEEDED ⚡
• [Name]: Not interested

UPCOMING FOLLOW-UPS: 3 (due in 2 days)

BOOKED: 1 call — [Name] on [date/time]
```

## Storage
- Outreach queue: `memory/outreach/queue.json`
- Sent log: `memory/outreach/sent-log.json`
- Templates: `memory/outreach/templates/`

## Dependencies
- `gog` skill: Gmail send + Google Calendar booking
- Optional: `voice-call` skill for phone fallback (like the restaurant example)
- Optional: Apollo.io / Hunter.io API keys for email finding

## Cron Suggestion
Run daily to check for follow-up triggers.
```json
{
  "schedule": { "kind": "cron", "expr": "0 9 * * 1-5", "tz": "America/New_York" },
  "payload": { "kind": "agentTurn", "message": "Check outreach queue, send any pending follow-ups, report status to Chairman." }
}
```
