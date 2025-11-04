# 🚀 MCP Server Auto-Start Guide

## The Good News: You DON'T Need to Manually Run `intention-mcp`!

Both Cursor and Claude Desktop **automatically start MCP servers** when they launch. You've been manually running it unnecessarily!

## How MCP Auto-Start Works

### 🎯 For Cursor
- **Config Location**: `~/.cursor/mcp.json`
- **Auto-Start**: ✅ YES - Cursor automatically starts all configured MCP servers
- **When**: Every time you open Cursor
- **Process**: Runs in background, managed by Cursor

### 🤖 For Claude Desktop
- **Config Location**: `~/.claude.json` 
- **Auto-Start**: ✅ YES - Claude Desktop automatically starts all configured MCP servers
- **When**: Every time you open Claude Desktop
- **Process**: Runs in background, managed by Claude

## ✅ Your Configuration is Now Ready

Both configs are set to:
```json
"intention": {
  "command": "intention-mcp"
}
```

This tells both apps to:
1. Find `intention-mcp` in your PATH (`/opt/homebrew/bin/intention-mcp`)
2. Start it automatically when the app launches
3. Keep it running in the background
4. Restart it if it crashes

## 🔧 How to Use It (The RIGHT Way)

### Step 1: Stop Any Manual Servers
If you have `intention-mcp` running in a terminal:
```bash
# Find and kill any manual instances
pkill -f intention-mcp
```

### Step 2: Restart Your Apps
1. **Quit Cursor completely** (Cmd+Q on Mac)
2. **Quit Claude Desktop completely** (Cmd+Q on Mac)
3. **Reopen them**

### Step 3: Verify It's Working

#### In Cursor:
1. Open any project
2. Create a test file through chat: "Create test.js with a hello function"
3. Check if `.intents/test.js.json` was created
4. You should NOT see any terminal window running intention-mcp

#### In Claude Desktop:
1. Open any project
2. Use the intention tools (they should just work)
3. Check the `.intents` folder for tracking files

### Step 4: Check Running Processes (Optional)
```bash
# See if the MCP servers are running (managed by apps)
ps aux | grep intention-mcp

# You should see processes like:
# /opt/homebrew/bin/intention-mcp (started by Cursor or Claude)
```

## ❌ Common Mistakes to Avoid

### DON'T:
- ❌ Run `intention-mcp` manually in a terminal
- ❌ Use tmux/screen to keep it running
- ❌ Create systemd services or launchd daemons
- ❌ Run it before opening Cursor/Claude

### DO:
- ✅ Let Cursor/Claude manage the server lifecycle
- ✅ Just configure it in mcp.json/.claude.json
- ✅ Trust that it's running (check `.intents` folder for proof)

## 🔍 Troubleshooting

### If `.intents` folder isn't being created:

1. **Check if MCP server is recognized**:
   - In Claude Desktop: Look for "intention" in the MCP section of project settings
   - In Cursor: The tools should be available to the AI

2. **Verify the command works**:
   ```bash
   # Test that the command runs
   intention-mcp
   # Should show: "Intention MCP server started"
   # Press Ctrl+C to stop
   ```

3. **Check logs**:
   - Claude Desktop logs: `~/Library/Logs/Claude`
   - The MCP server outputs to stderr which both apps capture

### If tools aren't being used:

Make sure `.cursorrules` exists in your project:
```bash
cat .cursorrules
# Should show instructions to use intention_write, intention_edit, etc.
```

## 📊 How to Tell It's Working

### Signs of Success:
- ✅ `.intents` folder appears in your project (after first edit)
- ✅ JSON files appear in `.intents` when you make changes
- ✅ No terminal window needed
- ✅ Works across multiple projects
- ✅ Survives app restarts

### What You Should See:

When working normally:
1. Open Cursor/Claude → MCP server auto-starts silently
2. Edit files through AI → `.intents` folder gets populated
3. Close app → MCP server auto-stops
4. Reopen app → MCP server auto-starts again

## 🎉 Summary

**You're all set!** Just:
1. Quit and reopen Cursor/Claude Desktop
2. Start coding normally
3. The MCP server runs automatically in the background
4. Check `.intents` folder to see it working

**No manual terminal commands needed ever again!**
