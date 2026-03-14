# 🧠 Smart Memory System

Enhanced 4-layer memory architecture for OpenClaw.

## Four-Layer Memory Model

```
┌─────────────────────────────────────────────────────────┐
│                    CONTEXT WINDOW                        │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ Working     │  │  Session    │  │  LLM Context  │  │
│  │ Memory      │  │  History    │  │  (real-time)  │  │
│  │ (Buffer)    │  │             │  │               │  │
│  └─────────────┘  └─────────────┘  └───────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    LONG-TERM STORAGE                     │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ Episodic    │  │ Semantic    │  │ Procedural    │  │
│  │ (Timeline)  │  │ (Knowledge  │  │ (Skills/      │  │
│  │ What        │  │  Graph)     │  │  Patterns)    │  │
│  │ happened    │  │  Facts +    │  │  How to       │  │
│  │             │  │  Relations  │  │  succeed      │  │
│  └─────────────┘  └─────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Auto-Inject Feature

When you mention these triggers, I automatically search memory:
- 記得 / remember / 之前
- 點整 / how to / 點解
- 用戶名 / preferences
- ComfyUI / EvoMap / tools

### Usage

```javascript
import { searchMemoryForContext, checkAndInjectContext } from './memory-hook.js';

// Manual search
const context = searchMemoryForContext('ComfyUI', 3);
console.log(context);

// Auto-check (returns null if no triggers detected)
const relevant = checkAndInjectContext('記得ComfyUI點整?');
```

---

## Functions

### saveKeyFact(fact, category)
Save important fact to semantic memory.

### recordEvent(event, intent, outcome)
Record episodic event with timestamp.

### saveProcedure(name, steps, scenario)
Save successful workflow pattern.

### searchMemory(query, timeRange, limit)
Search across all memory layers.

### searchMemoryForContext(query, maxResults)
Format results for conversation context.

### checkAndInjectContext(userMessage)
Auto-detect triggers and return relevant memory.

---

## Memory Structure

```
memory/
├── .db.json              # Main database
├── episodes/             # Timeline logs
│   └── YYYY-MM-DD.md
├── graph/
│   └── entities/       # Facts
└── procedures/         # Success patterns
```

## Cron Job

Daily maintenance at 21:00 Hong Kong time.

---

## Example

**User:** 記得之前整既ComfyUI workflow?

**System auto-searches:**
```
[14/3/2026] # ComfyUI Startup
Scenario: Starting ComfyUI server
Steps:
1. source ~/miniconda3/bin/activate ai_env
2. cd ~/ComfyUI
3. python main.py --listen 0.0.0.0 --port 8188
```

Then includes this in the response automatically.
