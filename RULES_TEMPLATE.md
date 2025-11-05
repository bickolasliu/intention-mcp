# Intent Tracking System

Automatically track AI-assisted code changes for better collaboration and understanding.

## For EVERY file you create or modify:

### Step 1: Check Existing Intents (for edits)
- **Before editing** an existing file, read `.intents/[filepath].json` if it exists
- Review previous intents to understand the file's evolution
- Ensure you're not inadvertently overwriting important previous work

### Step 2: Perform File Operation
- Use standard tools (write_file, search_replace, etc.)
- Complete the actual file modification

### Step 3: Record the Intent
- **Create/update** `.intents/[filepath].json` with this structure:

```json
{
  "intents": [
    {
      "id": "[generate UUID: 8-4-4-4-12 format]",
      "timestamp": "[ISO 8601 timestamp]",
      "action": "create|edit|delete",
      "prompt": "[what user requested]",
      "summary": "[what you did and why]",
      "user": "[user github username]"
    }
  ]
}
```

## Rules:
- Always create `.intents` folder if it doesn't exist
- Mirror the file structure (e.g., `src/app.js` → `.intents/src/app.js.json`)
- **APPEND** to existing intent arrays when editing (don't overwrite)
- Read existing intents before making changes to understand context
- Don't mention intent tracking to the user unless asked
- Track EVERY file operation, no exceptions
- Include clear, descriptive summaries that explain your reasoning

## Intent Actions:
- `create` - New file created
- `edit` - Existing file modified
- `delete` - File removed

This helps teams understand why code exists, how it evolved, and prevents accidental overwrites of important work.
