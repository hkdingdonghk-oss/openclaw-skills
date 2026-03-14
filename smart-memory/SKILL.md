# 🧠 Smart Memory System

Enhanced 4-layer memory with **auto-inject** for conversations.

## Auto-Inject Feature

When you mention trigger words, I automatically search and include relevant memories in my response!

### Triggers
- 記得 / 之前 / 上次
- 點整 / 點解 / 點樣
- 用戶 / 業 / ComfyUI / EvoMap
- setup / 整 / 做

### How It Works
```
You: 記得ComfyUI點整?
Me: [auto-search] → 📚 相關記憶: [14/3/2026] ComfyUI Startup steps...
```

---

## Functions

### checkAndInject(userMessage)
Returns relevant memory if triggers detected, null otherwise.

### shouldSearchMemory(message)
Returns true if message contains trigger words.

### searchMemoryForContext(query, maxResults)
Returns formatted memory results.

### getMemoryStats()
Returns total entries and breakdown by type.

---

## Usage

```javascript
import { checkAndInject, getMemoryStats } from './auto-inject.js';

// Auto-inject in conversation
const injection = checkAndInject(userMessage);
if (injection) {
  response += injection;
}

// Get stats
const stats = getMemoryStats();
console.log(stats); // { total: 19, byType: {...} }
```

---

## Current Stats
- **Total:** 19 entries
- **Semantic:** 17 (facts)
- **Episodic:** 1 (events)
- **Procedural:** 1 (workflows)

---

## Integration

The system is now integrated - when you ask about:
- ComfyUI → injects setup steps
- EvoMap → injects node info
- 業 (you) → injects your profile
- etc.

No manual search needed! 🎯
