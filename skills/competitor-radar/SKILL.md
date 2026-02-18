# Skill: competitor-radar

## What It Does
Overnight competitor intelligence agent. Scans X (Twitter), Reddit, YouTube, and competitor websites for outlier content, product launches, pricing changes, and trending posts. Delivers a morning briefing with actionable insights.

## Inspired By
Real use cases from Reddit/X:
- Users running overnight competitor scans and waking up to briefings
- Solo founders using OpenClaw marketing agents for competitor analysis
- Jason Calacanis team using OpenClaw for automated research operations
- r/ThinkingDeeplyAI guide: "scan YouTube or X overnight, identify outlier content from competitors that is performing unusually well"

## How To Use
Trigger phrases:
- "Run competitor scan on [company/topic]"
- "What's my competition doing?"
- "Morning competitor brief"
- "Monitor [competitor] for changes"

## What It Does Step By Step
1. Accepts a list of competitors (domains, X handles, subreddits)
2. Uses `web_search` to find recent posts, product pages, pricing pages
3. Identifies outlier/viral content (high engagement signals)
4. Checks for pricing or feature changes vs. last scan (stored in memory)
5. Compiles a ranked briefing: Top threats, Top opportunities, Notable moves
6. Stores delta notes in `memory/competitor-state.json` for future comparison

## Output Format
```
🔍 COMPETITOR RADAR — [date]

TOP MOVES:
• [Competitor A]: Launched [feature] — [why it matters]
• [Competitor B]: Viral post ([X engagements]) on [topic]

OPPORTUNITIES:
• [Gap observed] — [what we could do]

PRICING CHANGES:
• [None detected] / [Change noted]

RECOMMENDED ACTION: [1-line CEO recommendation]
```

## Storage
- Competitor list: `memory/competitor-list.json`
- Last scan state: `memory/competitor-state.json`
- Output log: `memory/competitor-briefings/YYYY-MM-DD.md`

## Cron Suggestion
Run nightly at 2:00 AM so briefing is ready by morning.
```json
{
  "schedule": { "kind": "cron", "expr": "0 2 * * *", "tz": "America/New_York" },
  "payload": { "kind": "agentTurn", "message": "Run competitor radar scan and deliver morning briefing to Chairman." }
}
```
