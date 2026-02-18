---
name: investment-radar
description: Synthesizes portfolio and theme data into strategic investment briefings
---

# Investment Radar Skill

## Purpose
Produce weekly and monthly investment briefings by synthesizing pre-digested data from CFO (portfolio snapshots) and CRO (theme reports). The CEO never pulls raw Google Sheet data directly.

## Input Files (in data/investment/shared/)
- weekly-portfolio-snapshot.json (from CFO)
- weekly-theme-report.json (from CRO)
- monthly-portfolio-snapshot.json (from CFO, monthly cycle)
- monthly-research.json (from CRO, monthly cycle)

## Weekly Briefing Sections
1. PORTFOLIO SNAPSHOT: total value, per-sleeve breakdown (from CFO)
2. THEME SCORECARD: sorted by score, highest first (from CRO)
3. CONVERGENCE ALERTS: themes validated by multiple sources (from CRO)
4. SILENCE ALERTS: holdings whose themes have zero mentions in 60+ days (CEO cross-reference)
5. PIPELINE MOVEMENT: themes that crossed tier thresholds (from CRO)
6. NEW WATCHLIST CANDIDATES: first-time company mentions (from CRO)
7. PORTFOLIO GAPS: high-scoring themes (7+) with zero portfolio exposure (CEO cross-reference)

## Monthly Report Additional Sections
- Allocation drift: actual vs target (from CFO)
- New research theses: bull/bear/timing for newly Research-tier themes (from CRO)
- Trim candidates: holdings with 60+ days theme silence (CEO analysis)
- Opportunity gaps with priority ranking (CEO analysis)

## CEO Value-Add
The CEO exists to do what downstream agents cannot:
- Strategic judgment on trim vs hold decisions
- Priority ranking of opportunity gaps
- Qualitative assessment of thesis strength
- Cross-referencing portfolio positions against theme momentum
- Final editorial voice on all briefings

## Portfolio Context
Three thematic sleeves: AI Infrastructure, Blockchain, China
Investment philosophy: toll roads, power plants, and banks — not speculative plays
Google Sheet ID: 11kk1KNHHxNNLgglS52mZt7-P5b-cH9ZPtv3FJHt8Dq0
