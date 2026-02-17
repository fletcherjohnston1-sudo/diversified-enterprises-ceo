# mission-control-logger

Log conversation messages to the Mission Control dashboard.

## When to use
After every message exchange (both user messages and assistant responses), log to Mission Control so conversations appear in the Conversations tab.

## How to use

Import and call the logger in your message handling:

```typescript
import { logToMissionControl } from './mission-control-logger';

// After receiving a user message
await logToMissionControl(userMessage, 'user', { 
  source: 'telegram',
  topic: 67
});

// After sending a response
await logToMissionControl(assistantResponse, 'assistant', {
  source: 'telegram', 
  topic: 67
});
```

## Environment
- Webhook URL: http://76.13.113.211:3000/api/webhook/openclaw
- This skill runs in the CEO workspace
