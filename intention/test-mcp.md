# Testing Intention MCP Server

## After restarting the MCP server and Cursor, test with these prompts:

### Test 1: Create a file
Ask Cursor: "Create a new file called hello.js with a simple hello world function"

Expected: Should create:
- `/Users/nicholasliu/Documents/coretsu/intention/intention/hello.js`
- `/Users/nicholasliu/Documents/coretsu/intention/intention/.intents/hello.js.json`

### Test 2: Edit a file  
Ask Cursor: "Add a goodbye function to hello.js"

Expected: The `.intents/hello.js.json` should have a new intent entry

### Test 3: Check history
Ask Cursor: "Show me the intent history for hello.js"

Expected: Should list both intents with timestamps and prompts

## Checking manually:
```bash
# Check if intents are being created
ls -la .intents/

# View an intent file
cat .intents/hello.js.json | jq .
```

## Troubleshooting:
- If `.intents` remains empty, check if Cursor is using the MCP tools
- Look for "intention_write" or "intention_edit" in Cursor's tool usage
- The MCP server console should show activity when tools are called
