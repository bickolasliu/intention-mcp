# Intention Tracking - Standalone Version (No Server Needed!)

The simplest way to track AI-assisted code changes. Just one file, no configuration, no servers.

## Installation

### Option 1: Direct Download
```bash
curl -o .cursorrules https://raw.githubusercontent.com/[your-repo]/intention/main/standalone/.cursorrules
```

### Option 2: Manual Copy
Just copy the `.cursorrules` file to your project root.

## That's it! Seriously.

No NPM install. No server. No configuration. Just one file that instructs AI to track its changes.

## How It Works

When an AI assistant (Cursor, Claude, etc.) sees the `.cursorrules` file, it will:
1. Create files as normal
2. Also create tracking files in `.intents/` folder
3. Document what was done and why

## Example

You: "Create app.js with an express server"

AI creates:
- `app.js` - Your express server
- `.intents/app.js.json` - Record of why it was created

## Viewing History

```bash
# See all tracked files
find .intents -name "*.json"

# Read a specific file's history
cat .intents/app.js.json | python -m json.tool
```

## Why This Works

- AI assistants already know how to create files
- They just need instructions to create tracking files too
- No special tools or permissions needed
- Works with any AI that reads project instructions

## For Different AI Tools

- **Cursor**: Name it `.cursorrules`
- **Claude Desktop**: Name it `.claude_instructions`  
- **GitHub Copilot**: Name it `.github/copilot-instructions.md`
- **Others**: Check their documentation for instruction files

## FAQ

**Q: Do I need to install anything?**
No. Just the .cursorrules file.

**Q: Do I need the MCP server?**
No. This works without any server.

**Q: Will this work with [specific AI tool]?**
If it can read project instructions and create files, yes.

**Q: Can I customize the tracking format?**
Yes, just edit the .cursorrules file.

## The Power of Simplicity

This entire "system" is just one markdown file with instructions. That's it. No code, no server, no complexity. Just clear instructions that any AI can follow.

Sometimes the best solution is the simplest one. 🎯
