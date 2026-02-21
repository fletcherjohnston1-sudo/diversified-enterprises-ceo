# Skill: market-data

## What It Does
Pulls reliable, authoritative market data from FRED (Federal Reserve Bank of St. Louis) — the source you recommended. Always shows historical context: weekly, monthly, and quarterly trends, not just intraday numbers.

## Primary Data Source
- **FRED (fred.stlouisfed.org)** — Federal Reserve economic data, same source used by Bloomberg, Reuters, and major financial institutions
- Direct CSV download: `https://fred.stlouisfed.org/graph/fredgraph.csv?id=SP500&cosd=YYYY-MM-DD&coed=YYYY-MM-DD`

## Supported Indexes
| Symbol | FRED ID | Description |
|--------|---------|-------------|
| S&P 500 | SP500 | S&P 500 Index |
| Nasdaq Composite | NASDAQCOM | Nasdaq Composite |
| Dow Jones | DJIA | Dow Jones Industrial Average |
| VIX | VIXCLS | CBOE Volatility Index |
| 10-Year Treasury | DGS10 | 10-Year Treasury Yield |

## How To Use
Trigger phrases:
- "What's the S&P doing?"
- "Show me the market today"
- "How are futures trading?"
- "Is the market up or down this week?"
- "What's the 3-week trend for Nasdaq?"

## Output Format
Always includes:
1. **Current close** (from most recent FRED data)
2. **Weekly change** (% and points)
3. **Monthly change** (% and points)
4. **Quarter-to-date change** (% and points)
5. **3-week trend summary** (for long-running requests)
6. **Key context** (resistance levels, volatility, notable moves)

## What It Does Step By Step
1. Determine which index(es) the user is asking about
2. Fetch last 90 days of data from FRED CSV API
3. Calculate: current close, weekly change, monthly change, quarterly change
4. Identify trend direction (up/down/consolidating)
5. Generate concise briefing with context
6. For futures requests: use TradingView as secondary source but flag as "futures (delayed)"

## Error Handling
- If FRED is down: use Yahoo Finance as backup, but clearly flag the source
- If data is stale (>1 day): warn user and show last known close
- If index not supported: say "I don't have reliable data for that — can you specify S&P, Nasdaq, or Dow?"

## Storage
- No persistent storage needed — always pull fresh from FRED
- Optional: cache last fetch in `memory/market-cache.json` for fail-fast on repeated requests

## Cron Suggestion
For a morning market brief:
```json
{
  "schedule": { "kind": "cron", "expr": "0 8 * * 1-5", "tz": "America/New_York" },
  "payload": { "kind": "agentTurn", "message": "Pull today's market data (S&P, Nasdaq, Dow, VIX) from FRED and send morning market brief to Chairman in topic 39." }
}
```
