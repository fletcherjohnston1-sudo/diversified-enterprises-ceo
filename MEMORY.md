# MEMORY.md - CEO Long-Term Memory

## Company: Diversified Enterprises

### Structure
- **Chairman:** Fletcher Johnston — Final authority on all major decisions
- **CEO:** (This agent) — Strategic leadership, coordinates executive team
- **CFO** — Finance, trading, treasury, risk management
- **Chief of Staff** — Operations, execution, project tracking
- **Director of Research** — Analysis, market intelligence, opportunities

### My Authority
- Day-to-day operational priorities
- Task assignments to executives
- Information requests and research direction
- Paper trading decisions under $10,000

### Escalate to Chairman
- Strategic pivots or new business directions
- Budget allocation over $1,000
- Live trading authorization (any amount)
- Hiring/removing agents
- External communications
- Significant risk decisions

---

## Active Projects

### Mission Control Dashboard
**Status:** Phase 1 complete ✅
**Location:** `/home/clawd/.openclaw/workspace-ceo/mission-control/`
**Purpose:** Modular web dashboard for managing OpenClaw interactions
**URL:** `http://76.13.113.211:3000`

**Tech Stack:**
- Next.js 14 (App Router, TypeScript)
- SQLite + better-sqlite3
- Tailwind CSS
- @dnd-kit/core, lucide-react

**Phase 1 Features:**
- Kanban-style task management
- Drag & drop between Backlog/In Progress/Done
- Dark theme UI
- Full CRUD with modal forms
- Responsive design (mobile-ready)

**Progress:**
- ✅ Steps 1-12 complete
- ✅ Drag-and-drop implemented (Feb 14, 2026)
- ✅ Final polish complete (Feb 14, 2026)

**Current State:**
- App running at `http://76.13.113.211:3000`
- Kanban board with 3 columns (Backlog, In Progress, Done)
- Create/Edit/Delete tasks via modal ✅
- Drag-and-drop between columns ✅
- Status persisted to database on drop ✅
- Loading skeletons, toast notifications, error handling ✅
- Mobile-responsive with collapsible sidebar ✅
- **Fixed:** White-on-white project names (Feb 19, 2026) — switched to inline styles

---

### Look-Through Portfolio Analysis
**Status:** Deployed ✅
**Location:** `/home/clawd/.openclaw/workspace/fund_holdings_updater.py`
**Config:** `/home/clawd/.openclaw/workspace/lookthrough_config.json`
**Output:** `/home/clawd/.openclaw/shared-data/investment/lookthrough-analysis.json`

**Purpose:** Decomposes ETFs/mutual funds into underlying stock holdings to see true stock-level concentration

**Cron:** Monthly on 1st at 2:00 PM ET (CFO agent runs it)

**Key Metrics:**
- 10 funds analyzed (VWUAX, VGT, VDADX, VOOV, VSIAX, VMGMX, VSGAX, XSD, SPGP, COPX)
- ~54.5% of portfolio in funds
- 16 stocks with cross-fund overlap

**Concentration Warnings (>5% true exposure):**
- AAPL: 12.3% ($447K) — $231K buried in funds
- NVDA: 9.1% ($331K)
- BRK.B: 7.3% ($266K)
- MSFT: 5.5% ($202K) — $190K via funds
- AMZN: 5.1% ($186K)

---

## Model Cost Notes
- **Opus 4.5** — $15/$75 per 1M tokens. Chairman's choice for CEO work.
- **MiniMax M2.5** — $0.30/$1.20 per 1M tokens. Good for routine coding, subagents.
- **Qwen 3.5 Plus** — $0.40/$2.40 per 1M tokens. 1M context window.
- Aliases configured: `/model MiniMax`, `/model Qwen`, `/model Sonnet`, etc.

## Executive Team
| Agent | Workspace | Model |
|-------|-----------|-------|
| @CEO | workspace-ceo | Sonnet 4.6 |
| @CTO | workspace-cto | MiniMax M2.5 |
| @CRO | workspace-research | MiniMax M2.5 |
| @COO | workspace-coo | MiniMax M2.5 |
| @CFO | workspace-cfo | MiniMax M2.5 |
| @Coach | workspace-coach | MiniMax M2.5 |

**Telegram group:** `-1003884162218`

### Agent Communication Protocol
- All agents have "Telegram Messaging Protocol" in their AGENTS.md
- Must use **@agent name** (not topic numbers) to send to specific topics
- Response Protocol: Acknowledge in own topic, then send to requested topic
- **Naming convention:** Always refer to agents by @name (e.g. @CEO, @CTO, @CFO, @COO, @CRO, @Coach) — never by topic number

## Preferences

### Communication Style
- Direct, concise, no corporate jargon
- Lead with decision/action needed
- When escalating: Situation → Options → Recommendation → Risk

### Alert Routing
- Price watch alerts → route through @CRO (not CEO directly)
- Sync/operational summaries → CEO can summarize only when noteworthy
- Routine background task completions → NO_REPLY unless actionable
