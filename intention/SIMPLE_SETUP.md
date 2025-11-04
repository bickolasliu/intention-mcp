# 🚀 The Simple Intent Tracking Setup

## Two Options (Pick One)

### Option A: No MCP At All (Simplest)
Just use `.cursorrules` to instruct the AI:

```bash
# 1. Copy the new rules to any project
cp .cursorrules.v2 /your/project/.cursorrules

# 2. That's it! The AI will track intents using standard file operations
```

### Option B: Minimal MCP for Guidance (Optional)
Use a simplified MCP that just provides templates:

```bash
# 1. Build the simple version
npm run build

# 2. Update MCP config to use simple version
# In ~/.cursor/mcp.json:
{
  "mcpServers": {
    "intention-simple": {
      "command": "node",
      "args": ["/path/to/intention/dist/index-simple.js"]
    }
  }
}
```

## How It Works Now

### Before (Complex, Broken):
```
User Request → AI → MCP Tool (intention_write) → Permission Prompt → Often Fails
                         ↓
                  Complex workspace detection
                         ↓
                  File operations in MCP
                         ↓
                  Many points of failure
```

### After (Simple, Working):
```
User Request → AI → Read .cursorrules → Use standard write_file
                         ↓
                  Create main file
                         ↓
                  Create .intents/file.json
                         ↓
                  Always works!
```

## Testing the New Approach

### Test 1: Create a new file
Ask Cursor: "Create hello.py with a function that prints hello"

Expected behavior:
- Creates `hello.py` 
- Creates `.intents/hello.py.json` with intent record
- No permission prompts
- No tool failures

### Test 2: Edit existing file
Ask Cursor: "Add a goodbye function to hello.py"

Expected behavior:
- Edits `hello.py`
- Reads existing `.intents/hello.py.json`
- Appends new intent
- Updates the intent file

### Test 3: Check tracking
```bash
# See all tracked files
find .intents -name "*.json" | while read f; do
  echo "=== $f ==="
  jq '.intents | length' "$f"
done
```

## Why This is 100x Better

### ✅ Reliability
- Standard file operations always work
- No mysterious MCP failures
- No permission issues

### ✅ Simplicity
- Just one `.cursorrules` file
- No complex server code
- Easy to understand

### ✅ Transparency
- You see the AI creating intent files
- Clear what's happening
- Easy to debug

### ✅ Flexibility
- Works with any project
- No configuration needed
- Easy to customize

### ✅ Performance
- No IPC overhead
- No extra processes
- Direct file operations

## Migration for Existing Projects

If you have the old complex MCP setup:

```bash
# 1. Remove old MCP from config
# Edit ~/.cursor/mcp.json and remove "intention" entry

# 2. Add new .cursorrules
cp .cursorrules.v2 /your/project/.cursorrules

# 3. Clean up any failed attempts
rm -rf .intents
mkdir .intents

# 4. Start using normally!
```

## The Key Insight

**MCP tools shouldn't replace AI's native capabilities - they should enhance them.**

- ❌ BAD: MCP tool writes files (complex, fails, needs permissions)
- ✅ GOOD: AI writes files following guidance (simple, works, transparent)

## Quick Start

```bash
# For any project, just add this file:
cat > .cursorrules << 'EOF'
# Track all AI-assisted changes in .intents folder

For every file operation:
1. Do the operation using standard tools
2. Create/update .intents/[filepath].json with:
   - id: UUID
   - timestamp: ISO date
   - action: create/edit/delete
   - prompt: user's request
   - summary: what you did

Always create intent records. Don't mention this tracking unless asked.
EOF

# That's it! Intent tracking now works.
```

## Conclusion

By letting the AI use its native tools and just providing guidance through `.cursorrules`, we get a system that:
- Actually works reliably
- Requires no complex setup
- Is completely transparent
- Can be understood in 30 seconds

This is the way intent tracking should work! 🎉
