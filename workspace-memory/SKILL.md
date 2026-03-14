# Workspace Memory System

Simple file-based memory for OpenClaw workspace.

## Files

| File | Purpose | When to Update |
|------|---------|----------------|
| `MEMORY.md` | Long-term memory | Significant learnings, decisions |
| `memory/YYYY-MM-DD.md` | Daily logs | Every session |
| `USER.md` | User info | When preferences change |
| `IDENTITY.md` | Your identity | When you evolve |
| `TOOLS.md` | Tool configs | Setup new tools |

## Triggers

### Remember (auto-save)
- "remember that..."
- "keep in mind..."
- "note: ..."
- Important decisions
- User preferences discovered

### Forget
- "forget about..."
- "never mind..."

## Workflow

### 1. Daily Session Start
```
Read: memory/YYYY-MM-DD.md (today + yesterday)
Read: MEMORY.md (if main session)
```

### 2. During Conversation
- Capture: decisions, preferences, tasks, insights
- Write to: memory/YYYY-MM-DD.md immediately

### 3. Session End (if long/productive)
- Flush key points to memory/YYYY-MM-DD.md
- Update MEMORY.md if significant

### 4. Memory Maintenance (weekly via heartbeat)
- Review recent daily notes
- Distill to MEMORY.md
- Remove outdated

## Format

### Daily Note Entry
```markdown
## YYYY-MM-DD

### Key Decisions
- [Topic]: Decision made

### Tasks
- [ ] Task to follow up

### Insights
- Learned something about user/preference

### Open Threads
- Topic to continue next time
```

### Memory Entry
```markdown
## [Topic]

### What I Know
- Fact 1
- Fact 2

### Source
- How I learned this

### Last Updated
YYYY-MM-DD
```

## Best Practices

- **Write it down** - Don't trust memory, files persist
- **Be concise** - MEMORY.md capped at ~3000 tokens
- **Date everything** - Makes decay/tracking easier
- **Separate** - Daily notes raw, MEMORY.md curated
- **Review** - Weekly maintenance keeps it fresh
