# 🔍 Debugging MCP Tools Not Working in Cursor

## The Problem
- MCP servers are running (confirmed via `ps aux`)
- Configuration looks correct
- But MCP tools aren't being invoked by Cursor's AI
- No `.intents` folder is being created

## Step-by-Step Debug Process

### 1. Test if MCP Server is Actually Accessible

First, let's create a simple test to see if Cursor can even see the MCP tools:

**In Cursor chat, ask:**
```
What MCP tools do you have available? List all MCP tools you can see.
```

**Expected:** Should list intention_write, intention_edit, etc.
**If not:** MCP server isn't connected to Cursor properly

### 2. Check Cursor's MCP Connection

**Look for MCP indicator in Cursor:**
- In Cursor, check the bottom status bar
- Look for any MCP-related indicators or icons
- Some versions show connected MCP servers

### 3. Test with Explicit MCP Tool Request

**In a NEW Cursor chat window, try:**
```
Use the MCP tool intention_write to create a file called test.txt with content "Hello World". Do NOT use write_file or any other tool - specifically use intention_write.
```

**Check results:**
```bash
ls -la .intents/
# Should show test.txt.json if it worked
```

### 4. Verify MCP Server is in Correct Directory

The MCP server needs to detect the workspace correctly:

```bash
# Check where MCP thinks the workspace is
# When you see the MCP server output, it should show:
# Workspace Detection:
#   - Current working directory: /path/to/your/project
#   - Detected workspace root: /path/to/your/project
```

### 5. Test in a Fresh Project

Create a completely new test project:

```bash
# Create fresh test directory
mkdir ~/test-intention-mcp
cd ~/test-intention-mcp

# Add .cursorrules
cat > .cursorrules << 'EOF'
# Intent Tracking Enabled
IMPORTANT: You MUST use MCP tools in this project:
- Use intention_write for new files
- Use intention_edit for modifications
- Do NOT use standard file operations
EOF

# Open in Cursor
cursor .
```

Then in Cursor chat:
```
Create a file hello.js with a simple hello world function
```

### 6. Check MCP Server Logs

The MCP server outputs to stderr. To see detailed logs:

```bash
# Kill existing MCP servers
pkill -f intention-mcp

# Run manually with visible output
intention-mcp 2>&1 | tee mcp-debug.log

# In another terminal, watch the log
tail -f mcp-debug.log
```

Now use Cursor and watch for any tool invocations in the log.

### 7. Verify Tool Names Match

The tools MUST be called with exact names:
- `intention_write` (with underscore)
- `intention_edit` (with underscore)
- NOT `intention-write` (with hyphen)

### 8. Test Direct MCP Protocol

Create a test request file `test-mcp-request.json`:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

Then test:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | intention-mcp
```

Should return a list of available tools.

## Common Issues & Solutions

### Issue 1: MCP Server Not in PATH
```bash
# Check if intention-mcp is accessible
which intention-mcp
# Should return: /opt/homebrew/bin/intention-mcp

# If not found, reinstall:
cd /Users/nicholasliu/Documents/coretsu/intention/intention
npm link
```

### Issue 2: Wrong Working Directory
The MCP server might be starting in the wrong directory. Try:

```json
{
  "mcpServers": {
    "intention": {
      "command": "intention-mcp",
      "env": {
        "MCP_WORKSPACE": "."
      }
    }
  }
}
```

### Issue 3: Cursor Not Recognizing MCP Tools
Sometimes Cursor caches MCP configurations. Try:
1. Quit Cursor completely
2. Delete any Cursor cache:
   ```bash
   rm -rf ~/Library/Application\ Support/Cursor/Cache/*
   ```
3. Restart Cursor

### Issue 4: Permission Issues
Make sure the MCP executable has correct permissions:
```bash
ls -la /opt/homebrew/bin/intention-mcp
# Should be executable (rwxr-xr-x)

# If not:
chmod +x /opt/homebrew/bin/intention-mcp
```

## Nuclear Option: Full Reset

If nothing works, do a complete reset:

```bash
# 1. Uninstall global package
npm unlink -g intention-mcp

# 2. Rebuild and reinstall
cd /Users/nicholasliu/Documents/coretsu/intention/intention
npm run build
npm link

# 3. Clear Cursor config and restart
mv ~/.cursor/mcp.json ~/.cursor/mcp.json.backup
cursor .

# 4. Reconfigure
cat > ~/.cursor/mcp.json << 'EOF'
{
  "mcpServers": {
    "intention": {
      "command": "intention-mcp"
    }
  }
}
EOF

# 5. Restart Cursor
```

## Testing Script

Save this as `test-intention.sh`:
```bash
#!/bin/bash
echo "Testing Intention MCP Setup..."

# Check if MCP is in PATH
echo "1. Checking PATH..."
which intention-mcp || echo "ERROR: intention-mcp not in PATH"

# Check if processes are running
echo "2. Checking running processes..."
ps aux | grep intention-mcp | grep -v grep || echo "No MCP servers running"

# Test MCP server directly
echo "3. Testing MCP server..."
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | intention-mcp 2>&1 | head -20

# Check for .intents folder
echo "4. Checking for .intents folder..."
ls -la .intents 2>/dev/null || echo "No .intents folder found"

echo "Test complete!"
```

## Get Help

If none of this works, gather this info:

```bash
# System info
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "OS: $(uname -a)"
echo "Cursor version: [Check in Cursor > About]"

# MCP info
which intention-mcp
npm list -g intention-mcp

# Config files
cat ~/.cursor/mcp.json
cat .cursorrules

# Test output
intention-mcp 2>&1 | head -50
```

Share this output to get help debugging the issue.
