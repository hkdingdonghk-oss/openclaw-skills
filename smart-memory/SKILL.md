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

## Layer 1: Working Memory (Buffer)

**Purpose:** Current conversation context, prevents "what did user just say?"

**Implementation:**
- Keep last N messages in rolling buffer
- Extract "TODO", "intent", "variables" each turn
- Re-inject if context gets truncated

**Usage:**
```
Automatic - no manual trigger needed
```

---

## Layer 2: Episodic Memory (Timeline)

**Purpose:** "What happened when" - time-indexed event log

**File:** `memory/episodes/YYYY-MM-DD.md`

**Entry Format:**
```markdown
## YYYY-MM-DD HH:MM

### Event
- User intent: [what they wanted]
- Action taken: [what I did]
- Outcome: [result]

### Summary
Brief what happened

### Tags
[session, task-type, success/fail]
```

**Trigger:** End of each significant interaction

---

## Layer 3: Semantic Memory (Knowledge Graph)

**Purpose:** Facts, preferences, relationships - not time-dependent

**File:** `memory/graph/`

```
memory/graph/
├── entities/          # Individual facts
│   ├── user_preferences.md
│   ├── project_context.md
│   └── tools_setup.md
├── relations.md       # Entity relationships
└── index.md           # Quick lookup
```

**Entity Format:**
```markdown
# Entity: [Name]

## Facts
- [Fact 1]
- [Fact 2]

## Relations
- [Entity A] -> [relation] -> [Entity B]

## Source
- When learned: YYYY-MM-DD
- Context: ...

## Last Accessed
YYYY-MM-DD
```

**Example Relations:**
```
業 (user) -> prefers -> 簡潔直接的溝通風格
ComfyUI (tool) -> located at -> ~/ComfyUI
OpenClaw (system) -> runs on -> Tailscale 100.83.22.58
```

---

## Layer 4: Procedural Memory (Skills)

**Purpose:** "How to succeed" - successful patterns

**File:** `memory/procedures/`

**Format:**
```markdown
# Procedure: [Task Name]

## When to Use
- Scenario: [when this pattern applies]
- Trigger: [keywords that hint this pattern]

## Steps
1. Step 1
2. Step 2
3. Step 3

## Why It Works
[Reasoning behind success]

## Success Rate
[High/Medium/Low]

## Example
```
User: ...
Agent: ...
```
```

---

## Tools

### search_memory
```javascript
// Search across all memory layers
search_memory({
  query: "what did user say about ComfyUI",
  timeRange: "today|week|month|all",
  type: "episodic|semantic|procedural|all"
})
```

### save_key_fact
```javascript
// Explicitly save important fact
save_key_fact({
  fact: "用戶prefer簡潔直接的風格",
  category: "preferences" // preferences|project_info|user_profile|tools
})
```

### save_procedure
```javascript
// Save successful pattern
save_procedure({
  name: "ComfyUI Setup",
  scenario: "首次設置ComfyUI環境",
  steps: ["1. Activate conda", "2. Run main.py", "3. Install custom nodes"],
  success_rate: "high"
})
```

---

## Workflow

### Pre-Request (Automatic)
```
1. Parse user query
2. Search episodic + semantic memory
3. Inject relevant context into prompt
```

### Post-Response (Background)
```
1. Extract new facts from conversation
2. Update knowledge graph
3. If task succeeded → save to procedural
4. Archive to episodic
```

### Memory Maintenance (Weekly)
```
1. Review episodic entries
2. Update semantic graph
3. Prune old/irrelevant data
4. Consolidate patterns
```

---

## Storage (File-Based)

For simplicity, use file-based storage:

```
workspace/
├── memory/
│   ├── episodes/
│   │   ├── 2026-03-14.md
│   │   └── 2026-03-15.md
│   ├── graph/
│   │   ├── entities/
│   │   └── relations.md
│   ├── procedures/
│   │   └── comfyui-setup.md
│   └── .index.json     # For fast search
└── .memory.db          # SQLite FTS (optional upgrade)
```

---

## Example Usage

### Remember Preference
```
User: 我中意用中文溝通
→ save_key_fact({ fact: "用戶偏好中文", category: "preferences" })
```

### Recall Context
```
User:琴日整既ComfyUI workflow點樣?
→ search_memory({ query: "ComfyUI workflow", timeRange: "week" })
→ Returns: episodic entry from yesterday
```

### Learn Pattern
```
[Task completed successfully]
→ save_procedure({ 
    name: "Virtual Try-On Setup", 
    steps: [...], 
    success_rate: "high" 
  })
```

---

## Key Principles

1. **Explicit > Implicit** - When in doubt, save it
2. **Time-indexed** - Can find anything by date
3. **Relation-aware** - Knows how facts connect
4. **Pattern-learned** - Doesn't repeat mistakes
5. **Self-maintaining** - Weekly cleanup

---

## Future Upgrades (Optional)

- Vector embedding for semantic search (sqlite-vss)
- Graph database for complex relations (Neo4j)
- Multi-modal memory (images, files)
