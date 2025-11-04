# Multi-Repository Support for Intention MCP

## ✅ What Was Fixed

The intention MCP server now properly detects the workspace for each repository automatically, so you can use it across multiple projects without hardcoding paths.

### How It Works

The MCP server now uses intelligent workspace detection in this priority order:
1. `MCP_WORKSPACE` environment variable (if Cursor sets this)
2. `--workspace` command line argument (if provided)
3. Searches for project root (looks for `.git` or `package.json`)
4. Falls back to current working directory

## 🔧 Updated Configuration

Your `.cursor/mcp.json` should now look like this (no hardcoded path):

```json
{
  "mcpServers": {
    "intention": {
      "command": "intention-mcp"
    }
  }
}
```

## 🚀 Setup Steps

### 1. Restart the MCP Server
```bash
# Stop the current server (Ctrl+C)
# Start it again
intention-mcp
```

### 2. Restart Cursor
Completely quit and reopen Cursor to reload the MCP configuration.

### 3. Test in Different Repositories

Open different projects in Cursor and test that the `.intents` folder is created in each repository's root:

```bash
# In project A
cd ~/projects/project-a
# Make an edit through Cursor
# Check: ls -la .intents/

# In project B  
cd ~/projects/project-b
# Make an edit through Cursor
# Check: ls -la .intents/
```

## 🧪 Verification Tests

### Test 1: Check Workspace Detection
When the MCP server starts, it will log workspace information to stderr:
```
Workspace Detection:
  - Current working directory: /path/to/current/dir
  - Detected workspace root: /path/to/project/root
  - MCP_WORKSPACE env: not set
  - Command line args: 
```

### Test 2: Multi-Repo Test
1. Open Repository A in Cursor
2. Ask Cursor: "Create a test file hello.js with a greeting function"
3. Check: `ls -la .intents/` in Repository A
4. Switch to Repository B in Cursor
5. Ask Cursor: "Create a test file world.js with a world function"
6. Check: `ls -la .intents/` in Repository B

Both repositories should have their own `.intents` folders with tracked changes.

### Test 3: Verify Intent Files
```bash
# Check that intents are being created in the right place
find . -name ".intents" -type d 2>/dev/null

# View intent files
cat .intents/hello.js.json | jq .
```

## 🎯 Expected Behavior

- Each repository gets its own `.intents` folder in its root
- No need to change configuration when switching projects
- The MCP server automatically detects the correct workspace
- Intent files are created relative to each project's root

## ⚠️ Troubleshooting

### If `.intents` is created in the wrong location:

1. **Check workspace detection**: Look at the MCP server's stderr output for "Workspace Detection" info
2. **Verify Cursor is using MCP tools**: The `.cursorrules` file should instruct Cursor to use `intention_write` and `intention_edit`
3. **Test manually**: 
   ```bash
   cd /your/project/root
   intention-mcp
   # In another terminal, check where .intents is created
   ```

### If no `.intents` folder is created:

1. Ensure the MCP server is running
2. Check that Cursor is configured to use the intention MCP server
3. Verify the `.cursorrules` file is present and instructs use of MCP tools
4. Look for error messages in the MCP server output

## 📝 How to Add to New Projects

For any new project where you want intent tracking:

1. Copy the `.cursorrules` file to the project root
2. The MCP server will automatically work (no configuration needed)
3. The `.intents` folder will be created on first tracked edit

## 🔄 Reverting Changes

If you need to go back to a hardcoded path for any reason:

```json
{
  "mcpServers": {
    "intention": {
      "command": "intention-mcp",
      "args": ["--workspace", "/absolute/path/to/project"]
    }
  }
}
```

But this is NOT recommended as it defeats the multi-repo support.
