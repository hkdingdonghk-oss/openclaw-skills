# 🧠 Smart Memory Skill

Enhanced 4-layer memory system for OpenClaw.

## Installation

```bash
# Local install (for development)
# Copy to ~/.openclaw/workspace/skills/smart-memory/
# Or reference in config
```

## Usage

This skill provides memory functions:

- `saveFact(fact, category)` - Save to semantic memory
- `recordEvent(event, tags)` - Record to episodic memory  
- `saveProcedure(name, steps, scenario)` - Save successful patterns
- `searchMemory(query, type)` - Search across memory
- `getMemorySummary()` - Get memory stats

## Memory Structure

```
memory/
├── episodes/           # Timeline logs
│   └── YYYY-MM-DD.md
├── graph/
│   └── entities/      # Facts
│       └── *.md
└── procedures/        # Success patterns
    └── *.md
```

## Automatic Maintenance

Set up a cron job for daily maintenance:
- Review recent episodes
- Update semantic graph
- Consolidate to MEMORY.md
