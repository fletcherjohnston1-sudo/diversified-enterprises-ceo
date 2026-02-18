# Price Watcher Skill

## Purpose
Monitor Mac Mini M4 16GB/512GB pricing on Amazon and alert when price meets target.

## Configuration
- **Product:** Mac Mini M4 16GB/512GB
- **Amazon URL:** https://www.amazon.com/Apple-2024-Desktop-Computer-10%E2%80%91core/dp/B0DLBX4B1K
- **Target Price:** $690 or less
- **Check Frequency:** Daily at 8 AM ET

## How It Works

### 1. Check Price
Use web search to find current price:
```
Mac Mini M4 16GB 512GB Amazon price
```

### 2. Compare to Target
- If price ≤ $690 → SEND ALERT
- If price > $690 → LOG to file

### 3. Alert (If At or Below Target)
Send Telegram message to CEO with:
- Current price
- Target price  
- Product link
- Recommendation: "BUY NOW!" or "WAIT"

### 4. Log (If Above Target)
Append to `shared-data/price-watch.json`:
```json
{
  "date": "2026-02-17",
  "price": 699,
  "target": 690,
  "status": "above-target"
}
```

## Files
- **Skill:** `~/.openclaw/workspace-ceo/skills/price-watcher/SKILL.md`
- **Log:** `~/.openclaw/workspace-ceo/shared-data/price-watch.json`
- **Script:** Can use web_search for price discovery
