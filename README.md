# OpenClaw Skills Package

Custom skills and memory system for OpenClaw AI Assistant.

## Included Skills

### smart-memory
Four-layer memory architecture:
- Working Memory - Current conversation buffer
- Episodic Memory - Timeline events
- Semantic Memory - Facts & Knowledge Graph
- Procedural Memory - Success patterns

### workspace-memory
Simplified file-based memory system.

### comfyui-workflows
ComfyUI workflow templates:
- Virtual Try-On V3
- Image Generation API

## Memory Structure

```
memory/
├── episodes/        # Timeline logs
├── graph/          # Knowledge graph
│   └── entities/
└── procedures/     # Success patterns
```

## Usage

Copy to your OpenClaw workspace:
```bash
cp -r openclaw-skills/* ~/.openclaw/workspace/skills/
```

## Credits

Built by 小蕉 for 業's OpenClaw assistant
