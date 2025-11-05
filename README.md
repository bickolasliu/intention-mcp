# Intention - Simple Intent Tracking for AI Development

Track why code was written and how it evolved when using Cursor or Claude Code.

## What is this?

A dead-simple tool that configures AI assistants to automatically track their code changes. No servers, no complex setup - just a script that adds tracking instructions to your project.

## Installation

```bash
npx setup-intention
```

That's it. The script will:
1. Detect which AI assistants you use
2. Add intent tracking instructions to their config files
3. Create a `.intents` folder for tracking

## How it Works

After setup, whenever an AI assistant creates or modifies files, it will also create a corresponding file in `.intents/` documenting:
- **What** was requested (the prompt)
- **When** it happened (timestamp)
- **Why** it was done (summary)
- **Who** requested it (if available)

### Example

When you ask: "Create an Express server in app.js"

The AI creates:
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

- ✅ **Cursor** - `.cursorrules`
- ✅ **Claude Code** - `.claude/instructions.md` (Desktop IDE)

## Manual Setup

If you prefer manual setup or want to customize, just add these instructions to your AI assistant's config file:

```markdown
# Intent Tracking

For every file operation:
1. Perform the operation using standard tools
2. Create/update `.intents/[filepath].json` with:
   - id: unique identifier
   - timestamp: ISO 8601 timestamp
   - action: create/edit/delete
   - prompt: what was requested
   - summary: what was done and why
```

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

**Important:** The `.intents` folder should be committed to your repository! This allows your team to:
- Understand why code was written
- See the evolution of AI-assisted changes
- Review AI decisions
- Maintain accountability

Don't add `.intents` to `.gitignore` - it's meant for collaboration.

## FAQ

**Q: Do I need a server running?**  
No! This is just configuration. The AI assistants do all the work using their existing file operations.

**Q: Will this slow down the AI?**  
No. It's just one extra file write, which is negligible.

**Q: Can I customize the tracking format?**  
Yes! Just edit the instructions in your AI assistant's config file.

**Q: What if I don't want to track certain files?**  
The AI will respect your requests. Just tell it not to track specific operations.

**Q: Is my code being sent anywhere?**  
No. Everything stays local in your `.intents` folder.

## Why Intent Tracking?

- **Understand decisions** - Know why code was written a certain way
- **Team collaboration** - Share context about AI-assisted changes
- **Code archaeology** - Understand historical decisions
- **Quality assurance** - Review AI-generated code more effectively
- **Knowledge transfer** - New team members understand the codebase faster

## The Philosophy

The best tools are invisible. Instead of complex servers and APIs, this tool just adds a simple instruction: "Hey AI, also write down what you did and why."

That's it. Simple, effective, and it just works.

## Contributing

This tool is intentionally simple. If you have ideas for improvements:
- Keep it simple
- No servers or complex dependencies
- Must work with standard AI file operations

## License

MIT - Use it however you want!

## Changelog

### v3.0.0
- Complete rewrite: removed MCP server entirely
- Now just a simple setup script
- Supports multiple AI assistants
- Zero dependencies, zero complexity

### v2.0.0
- Simplified MCP approach (still too complex)

### v1.0.0
- Initial MCP server (overly complex)

---

*Sometimes the best solution is barely a solution at all - just a good instruction.*