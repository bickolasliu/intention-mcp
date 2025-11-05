# Intention - Simple Intent Tracking for Collaborative Vibe Coding

Track why code was written and how it evolved when using Cursor or Claude Code.

## Installation

Run in the repository root:
```bash
npx setup-intention
```

The script will:
1. Detect which AI assistants you use
2. Add intent tracking instructions to their config files
3. Create a `.intents` folder for tracking

## How it Works

After setup, whenever a coding agent creates or modifies files, it will also create a corresponding file in `.intents/` documenting:
- **What** was requested (the prompt)
- **When** it happened (timestamp)
- **Why** it was done (summary)
- **Who** requested it (if available)

### Example

When you ask: "Create an Express server in app.js"

The coding agent creates:
- `app.js` - Your Express server
- `.intents/app.js.json` - Documentation of why it was created

```json
{
  "intents": [{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-11-05T10:30:00Z",
    "action": "create",
    "prompt": "Create an Express server in app.js",
    "summary": "Created Express server with basic routing and middleware setup"
  }]
}
```

## Supported AI Assistants

- **Cursor** - `.cursorrules`
- **Claude Code** - `.claude/instructions.md` (Desktop IDE)


## Viewing Intent History

```bash
# See all tracked files
find .intents -name "*.json"

# View specific file history
cat .intents/src/app.js.json | python -m json.tool

# Count changes per file
for f in .intents/**/*.json; do
  echo "$f: $(grep -c '"id"' $f) changes"
done
```

## Version Control

**Important:** The `.intents` folder should be committed to your repository. This allows your team to:
- Understand why code was written
- See the evolution of AI-assisted changes
- Review AI decisions
- Maintain accountability

Don't add `.intents` to `.gitignore` - it's meant for collaboration.


## Why Intent Tracking?

- **Understand decisions** - Know why code was written a certain way
- **Team collaboration** - Share context about AI-assisted changes
- **Code archaeology** - Understand historical decisions
- **Quality assurance** - Review AI-generated code more effectively
- **Knowledge transfer** - New team members understand the codebase faster