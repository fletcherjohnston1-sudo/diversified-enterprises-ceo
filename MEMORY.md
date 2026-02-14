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
**Status:** Phase 1 in progress
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

**Progress:**
- ✅ Steps 1-7 complete (scaffold, database, API, UI components, layout)
- ✅ Step 8 complete (hooks: useTasks, useProjects)
- ✅ Step 9 complete (task components: KanbanBoard, KanbanColumn, TaskCard, TaskModal)
- ✅ Step 10 complete (pages: /tasks page wired up)
- 🔄 Remaining: Drag-and-drop implementation, final styling polish

**Current State:**
- App running at `http://76.13.113.211:3000`
- API functional: `/api/tasks`, `/api/projects` returning data
- Kanban UI renders with 3 columns (Backlog, In Progress, Done)
- Create/Edit/Delete tasks working via modal
- Drag-and-drop NOT yet implemented (using @dnd-kit/core)

---

## Preferences

### Communication Style
- Direct, concise, no corporate jargon
- Lead with decision/action needed
- When escalating: Situation → Options → Recommendation → Risk
