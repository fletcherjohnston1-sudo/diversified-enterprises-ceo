# OpenClaw Context Document

Use this to understand Fletcher Johnston's OpenClaw setup when helping craft prompts, troubleshoot issues, or design workflows.

---

## Who is Fletcher Johnston

- **Age:** 53
- **Location:** Cape Carteret, NC
- **Vibe:** Optimizer, systems thinker, engineering approach to hobbies
- **Communication Style:** Direct, concise, no corporate jargon. Lead with decision/action needed.

### Hobbies & Gear
- **Moto:** Stark Varg EX (Electric Enduro) — VIN: UDUEX1AE4SA004455
- **Boats:** 17' Ankona Native SUV, 23' Sea Craft
- **Fishing:** Sight-fishing, fly fishing
- **Cooking:** Outdoor cooking on Breeo fire pit

---

## OpenClaw Infrastructure

### Server
- **Host:** VPS srv1312116
- **IP:** 76.13.113.211
- **Local Machine:** Mac (when specifying commands, clarify "VPS" vs "Mac")

### Telegram Group: Diversified Enterprises
- **Group ID:** `-1003884162218`
- Each agent has a dedicated topic (forum thread)
- Messages to topics require `threadId` parameter

---

## Agent Architecture

Fletcher runs a virtual "company" called **Diversified Enterprises** with AI agents as executives.

### Hierarchy
```
Chairman (Fletcher Johnston) — Final authority
    │
    └── CEO Agent — Strategic leadership, coordinates team
            │
            ├── CFO — Finance, trading, portfolio management
            ├── COO — Operations, execution, project tracking  
            ├── CRO — Research, market intelligence, theme analysis
            ├── CTO — Technical implementation, coding tasks
            └── Coach — Fitness programming, workout tracking
```

### Agent Details

| Agent | ID | Topic | Model | Workspace | Mentions |
|-------|-----|-------|-------|-----------|----------|
| CEO | ceo | 39 | Opus 4.5 | workspace-ceo | @ceo, @CEO |
| COO | coo | 37 | MiniMax M2.5 | workspace-coo | @coo, @COO |
| CRO | director_research | 36 | MiniMax M2.5 | workspace-research | @research, @Research |
| CFO | cfo | 38 | MiniMax M2.5 | workspace-cfo | @cfo, @CFO |
| CTO | cto | 67 | MiniMax M2.5 | workspace-cto | @cto, @CTO |
| Coach | coach | 746 | Sonnet 4.5 | workspace-coach | @coach, @Coach |

### Model Costs (per 1M tokens)
- **Opus 4.5:** $15 input / $75 output — Used for CEO (strategic decisions)
- **Sonnet 4.5:** $3 input / $15 output — Used for Coach (nuanced fitness programming)
- **MiniMax M2.5:** $0.30 input / $1.20 output — Used for routine tasks (CTO, CFO, COO, CRO)

### CEO Authority
**Can decide independently:**
- Day-to-day priorities
- Task assignments to executives
- Research direction
- Paper trading under $10,000

**Must escalate to Chairman:**
- Strategic pivots
- Budget over $1,000
- Live trading (any amount)
- Hiring/removing agents
- External communications

---

## Communication Protocols

### Telegram Message Tool Syntax
```
message(
  action="send",
  channel="telegram", 
  target="-1003884162218",
  threadId="39",  # REQUIRED for topics!
  message="Your message"
)
```

**Critical:** Without `threadId`, messages go to General (topic 1) instead of the intended topic.

### Task Delegation Protocol
When CEO delegates to an agent:
1. Agent acknowledges in topic 39: "[Role] acknowledging: [task summary]. On it."
2. Agent does the work
3. Agent reports completion to topic 39

### Response Protocol
When agent sends to another topic:
1. First acknowledge in OWN topic
2. Then send to requested topic

This keeps each topic's history visible to Chairman.

### Cross-Agent Communication
```
sessions_send(
  sessionKey="agent:ceo:telegram:group:-1003884162218:topic:39",
  message="..."
)
```

---

## Investment System

### Philosophy
- **Time Horizon:** Long-term (3-5+ years)
- **Strategy:** Structural trends, not short-term moves
- **Focus:** "Toll roads, power plants, and banks" — own the atoms that enable AI/agent proliferation
- **Attitude:** Doesn't mind crowded trades if thesis is intact

### Three Portfolio Sleeves
1. **AI Infrastructure** — Power, cooling, data centers
2. **Blockchain** — Crypto infrastructure plays
3. **China** — Structural China exposure

### Google Sheets Portfolio Tracker
- **URL:** https://docs.google.com/spreadsheets/d/11kk1KNHHxNNLgglS52mZt7-P5b-cH9ZPtv3FJHt8Dq0/edit
- **Service Account:** openclaw-sheets@openclaw-sheets-486216.iam.gserviceaccount.com

### Investment Radar Skill (CEO)
Weekly briefing sections:
1. Portfolio Snapshot (from CFO)
2. Theme Scorecard (from CRO)
3. Convergence Alerts — themes validated by multiple sources
4. Silence Alerts — holdings with zero mentions in 60+ days
5. Pipeline Movement — themes crossing tier thresholds
6. New Watchlist Candidates
7. Portfolio Gaps — high-scoring themes with no exposure

**Key principle:** CEO synthesizes pre-digested data from CFO + CRO. Never pulls raw Google Sheets directly.

---

## Fitness System

### Training Philosophy: "Absolute Mode"
Data-driven, zero fluff. Prioritizes moto-specific adaptations:
- Thermoregulation (heat adaptation)
- Grip endurance (sustained grip for motorcycle)
- High-intensity repeatability

### 2026 Goals
- Bench Press: 5x5 @ 225 lbs (current: 205 lbs)
- VO2 Max Intervals: 4x4 min @ 8.5 mph
- Max HR: ~155-160 bpm (Garmin set too high)

### Weekly Structure
| Day | Focus | Recovery |
|-----|-------|----------|
| Mon | Z2 Run | Sauna |
| Tue | Z2 Bike | Hot Tub |
| Wed | Upper Power (Bench) | — |
| Thu | VO2 Max Intervals | Sauna |
| Fri | Lower Power | Hot Tub |
| Sat | Moto/Accessories | — |
| Sun | Rest | — |

### Recovery Protocols
- **Sauna:** 15-20 min @ 175-195°F (post-cardio) — heat adaptation
- **Hot Tub:** 10-15 min @ 100-104°F (post-leg) — hydrostatic flush

### Workout Format Preference
**Always provide:** sets × reps @ weight, including ALL warm-up sets AND working sets.

Example:
```
Bench: 10@45, 8@95, 5@135, 5x5@185
Overhead Press: 3x8@65
```

### Injury Notes
- Left tricep/forearm nerve issue — RESOLVED
- Hanging knee raises cause shoulder discomfort — use lying knee raises instead

---

## Active Projects

### Mission Control Dashboard
- **URL:** http://76.13.113.211:3000
- **Location:** `/home/clawd/.openclaw/workspace-ceo/mission-control/`
- **Stack:** Next.js 14, SQLite + better-sqlite3, TypeScript, Tailwind

**Technical Gotchas:**
- Next.js 16: `params` is a Promise, must `await` before accessing
- SQLite: Use integers (1/0), not booleans (true/false)
- Status values: Must be capitalized ('Backlog', 'In Progress', 'Done')

### Kanban Dashboard (Legacy)
- **File:** `/home/clawd/.openclaw/workspace/kanban-dashboard.html`
- When Fletcher says "dashboard" without context, he means this kanban dashboard

---

## Useful Patterns for Prompts

### Delegating a Task
```
"Have the CTO [task description]. Report back to topic 39 when complete."
```

### Checking Agent Status
```
"Ping all agents and have them respond in topic 39."
```

### Running Investment Briefing
```
"Run the weekly investment briefing using the investment-radar skill."
```

### Getting a Workout
```
"Ask Coach for today's workout based on the weekly schedule."
```

### Model Switching (for a session)
```
/model MiniMax   # Switch to cheap model for routine work
/model Opus      # Switch back to Opus for strategic work
```

---

## Key Files & Locations

| Purpose | Path |
|---------|------|
| OpenClaw config | `/home/clawd/.openclaw/openclaw.json` |
| CEO workspace | `/home/clawd/.openclaw/workspace-ceo/` |
| CEO memory | `/home/clawd/.openclaw/workspace-ceo/MEMORY.md` |
| Daily logs | `/home/clawd/.openclaw/workspace-ceo/memory/YYYY-MM-DD.md` |
| Investment skill | `/home/clawd/.openclaw/workspace-ceo/skills/investment-radar/SKILL.md` |
| Mission Control | `/home/clawd/.openclaw/workspace-ceo/mission-control/` |
| Shared data | `/home/clawd/.openclaw/shared-data/` |
| Portfolio snapshots | `/home/clawd/.openclaw/shared-data/investment/` |

---

## Common Issues & Solutions

### Agent not responding to topic
- Check `threadId` is included in message tool call
- Verify binding exists in openclaw.json for that topic

### Agent not acknowledging tasks
- Check AGENTS.md has Task Delegation Protocol
- Verify agent-to-agent allowlist includes the agent

### Message going to wrong topic
- `threadId` must be a string: `"39"` not `39`
- Target must be the group ID: `"-1003884162218"`

### Model too expensive
- Switch routine tasks to MiniMax agents
- Use `/model MiniMax` for session override
- Reserve Opus for strategic CEO decisions

---

## Investment Email (for newsletter automation)
- **Email:** claudiusjohnston1@gmail.com
- **Purpose:** Fletcher forwards investment newsletters here for automated processing
