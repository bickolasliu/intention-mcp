# 🔄 Intention MCP Redesign: Simpler & Better

## The Problem with Current Design
- MCP tools trying to do file I/O directly → permission issues
- Complex workspace detection → failures
- Fighting against Cursor/Claude's native capabilities
- Tool calls failing or being interrupted

## The Better Approach: MCP as a Guide, Not a Doer

### Core Principle
**MCP provides guidance → AI does the work with native tools**

Instead of:
```
MCP Tool: intention_write → writes file → writes JSON → returns result
```

We should have:
```
MCP Tool: get_intention_format → returns template → AI writes both files
```

## New Architecture

### 1. Simplified MCP Tools

```typescript
// Instead of complex file operations, just return guidance
interface SimplifiedTools {
  // Returns template for intent JSON
  'intention_template': (params: {
    action: 'create' | 'edit' | 'delete',
    filePath: string,
    prompt: string
  }) => IntentTemplate;

  // Returns list of recent intents for awareness
  'intention_history': (params: {
    filePath: string,
    days?: number
  }) => Intent[];

  // Returns guidance on potential conflicts
  'intention_check': (params: {
    filePath: string,
    proposedChange: string
  }) => ConflictGuidance;
}
```

### 2. .cursorrules Becomes Primary Driver

```markdown
# Intent Tracking System

This project tracks AI-assisted changes in .intents folder.

## For EVERY file operation:

1. **Before creating/editing a file:**
   - Check if `.intents/[filepath].json` exists
   - If it exists, read it to understand previous intents
   
2. **When creating a new file:**
   - Create the actual file using standard tools
   - Create `.intents/[filepath].json` with:
   ```json
   {
     "intents": [{
       "id": "[generate UUID]",
       "timestamp": "[ISO timestamp]",
       "action": "create",
       "prompt": "[user's request]",
       "model": "claude-3.5" // or current model
     }]
   }
   ```

3. **When editing an existing file:**
   - Edit the file using standard tools
   - Append to `.intents/[filepath].json`:
   ```json
   {
     "id": "[generate UUID]",
     "timestamp": "[ISO timestamp]",
     "action": "edit",
     "prompt": "[what was changed and why]",
     "model": "claude-3.5"
   }
   ```

4. **Structure:**
   - Mirror the file structure in .intents/
   - Example: `src/app.js` → `.intents/src/app.js.json`
```

### 3. MCP Server Becomes Minimal

The MCP server just:
- Provides templates/examples when asked
- Reads existing intents for context
- Suggests conflict resolution strategies
- NO file writing, NO complex operations

## Implementation Steps

### Step 1: Simplify MCP Server
```typescript
// New minimal MCP server
export const tools = {
  // Just return a template - let AI do the work
  'get_intent_template': async ({ action, filePath, prompt }) => {
    return {
      content: {
        intents: [{
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          action,
          prompt,
          model: 'unknown', // AI will fill this
          user: os.userInfo().username
        }]
      }
    };
  },

  // Just read and return - no complex logic
  'read_intent_history': async ({ filePath }) => {
    const intentPath = `.intents/${filePath}.json`;
    if (fs.existsSync(intentPath)) {
      return JSON.parse(fs.readFileSync(intentPath, 'utf8'));
    }
    return { intents: [] };
  }
};
```

### Step 2: Better .cursorrules
```markdown
# AI Intent Tracking

You are responsible for tracking all code changes in the .intents folder.

## Your Responsibilities:

1. **Create .intents folder** if it doesn't exist (use mkdir)
2. **For every file you create/edit**, also create/update the corresponding intent file
3. **Use your standard file operations** (write_file, search_replace, etc.)
4. **Track the intent** by creating/updating .intents/[filepath].json

## Intent JSON Format:
Each file in .intents mirrors the source structure with .json extension.
Contains an array of intents with: id, timestamp, action, prompt, model

## Example Workflow:
User: "Create app.js with an express server"
You: 
1. Use write_file to create app.js
2. Use write_file to create .intents/app.js.json with the intent record
```

## Benefits of This Approach

### ✅ Simplicity
- No complex MCP file operations
- No permission issues
- No workspace detection problems

### ✅ Reliability
- Uses Cursor/Claude's proven file operations
- No mysterious tool failures
- Clear, debuggable process

### ✅ Flexibility
- Works with any AI that can write files
- No special tools needed
- Easy to understand and modify

### ✅ Transparency
- AI explicitly creates intent files (visible to user)
- User can see exactly what's happening
- Easy to verify it's working

## Migration Path

1. **Keep existing MCP server** but simplify to just reading tools
2. **Update .cursorrules** to be explicit about intent tracking
3. **Let AI use its native tools** for all file operations
4. **MCP just provides context** when needed

## Example Interaction

**User:** Create a new file hello.js with a greeting function

**AI (following .cursorrules):**
I'll create hello.js with a greeting function and track this change in the intents system.

```javascript
// Creating hello.js
function greeting(name) {
  return `Hello, ${name}!`;
}

module.exports = { greeting };
```

I'll also create the intent tracking:

```json
// Creating .intents/hello.js.json
{
  "intents": [{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-11-04T20:45:00Z",
    "action": "create",
    "prompt": "Create a new file hello.js with a greeting function",
    "model": "claude-3.5-sonnet"
  }]
}
```

Both files have been created with intent tracking.

## This is SO Much Better Because:

1. **No permission prompts** - uses standard file operations
2. **Always works** - no mysterious MCP failures  
3. **Visible process** - user sees the AI creating intent files
4. **Simpler codebase** - less complexity in MCP server
5. **Better debugging** - clear what's happening at each step
