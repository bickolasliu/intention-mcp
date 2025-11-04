# Intention MCP Server v2.0 (Simplified)

A lightweight MCP server that helps AI assistants track intent behind code changes, creating a clear history of AI-assisted development.

## 🎯 What's New in v2.0

**Completely redesigned for simplicity and reliability:**
- AI uses standard file operations (no complex MCP tools)
- No permission prompts or failures
- Works reliably across all projects
- Transparent intent tracking you can see

## 🚀 Quick Start

### Install

```bash
npm install -g intention-mcp
```

### Configure for Cursor

```bash
# Add to ~/.cursor/mcp.json
{
  "mcpServers": {
    "intention": {
      "command": "intention-mcp"
    }
  }
}
```

### Configure for Claude Desktop

```bash
# Add to ~/.claude.json
{
  "mcpServers": {
    "intention": {
      "command": "intention-mcp"
    }
  }
}
```

### Add to Your Project

Copy `.cursorrules` to your project root:

```bash
curl -o .cursorrules https://raw.githubusercontent.com/your-repo/intention-mcp/main/.cursorrules
```

That's it! The AI will now track all code changes in `.intents` folder.

## 📁 How It Works

The AI creates intent records for every file operation:

```
your-project/
├── src/
│   └── app.js          (your code)
└── .intents/
    └── src/
        └── app.js.json (intent history)
```

Each intent record includes:
- **id**: Unique identifier
- **timestamp**: When the change was made
- **action**: create/edit/delete
- **prompt**: What the user requested
- **summary**: What was actually done
- **model**: Which AI model made the change

## 🤖 For AI Assistants

When working in a project with intention tracking:

1. **Check for `.cursorrules`** - Follow the intent tracking instructions
2. **Use standard tools** - `write_file`, `search_replace`, etc.
3. **Create intent records** - Mirror structure in `.intents` folder
4. **Be consistent** - Track EVERY file operation

## 💡 Example

User: "Create a hello.js file with a greeting function"

AI creates two files:

**hello.js:**
```javascript
function greeting(name) {
  return `Hello, ${name}!`;
}

module.exports = { greeting };
```

**.intents/hello.js.json:**
```json
{
  "intents": [{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-11-04T20:45:00Z",
    "action": "create",
    "prompt": "Create a hello.js file with a greeting function",
    "summary": "Created greeting function that accepts name parameter and returns personalized message",
    "model": "claude-3.5-sonnet"
  }]
}
```

## 🛠️ MCP Tools (Optional Helpers)

The MCP server provides optional guidance tools:

- **`intention_get_template`** - Returns a template for intent records
- **`intention_read_history`** - Reads existing intent history
- **`intention_get_instructions`** - Returns tracking instructions

These are helpers only - the AI does all the actual file operations.

## 📊 Viewing Intent History

```bash
# See all tracked files
find .intents -name "*.json"

# View intents for a specific file
cat .intents/src/app.js.json | jq .

# Count changes per file
for f in .intents/**/*.json; do
  echo "$f: $(jq '.intents | length' $f) changes"
done
```

## 🔄 Migration from v1.x

Version 2.0 is a complete redesign. To migrate:

1. **Update the package**: `npm update -g intention-mcp`
2. **Update `.cursorrules`** in your projects
3. **Remove old MCP tools** from any custom configurations
4. **Existing `.intents` folders** remain compatible

## ⭐ Why This Approach?

### Reliability
- No complex file operations in MCP
- No permission issues
- No mysterious failures

### Simplicity
- AI uses tools it already knows
- Clear, visible process
- Easy to debug

### Transparency
- See exactly what's being tracked
- Standard JSON files you can read
- No hidden complexity

## 🤝 Contributing

We welcome contributions! The codebase is now much simpler:
- `src/index.ts` - Main MCP server (guidance only)
- `src/types.ts` - TypeScript definitions
- `.cursorrules` - Instructions for AI

## 📄 License

MIT

## 🙏 Acknowledgments

Thanks to the Anthropic team for MCP and to all users who provided feedback that led to this simpler, better design.

---

**Remember**: The best tools are invisible. Intention v2.0 lets AI assistants naturally track their work without complex APIs or permissions. Just simple, reliable intent tracking that works.