
# Intent Tracking System
# Automatically track AI-assisted code changes for better collaboration

## For EVERY file you create or modify:

1. **Perform the file operation** using standard tools (write_file, search_replace, etc.)
2. **Create/update** `.intents/[filepath].json` with this structure:

```json
{
  "intents": [
    {
      "id": "[generate UUID: 8-4-4-4-12 format]",
      "timestamp": "[ISO 8601 timestamp]",
      "action": "create|edit|delete",
      "prompt": "[what user requested]",
      "summary": "[what you did and why]",
      "user": "[your username]"
    }
  ]
}
```

## Rules:
- Always create `.intents` folder if it doesn't exist
- Mirror the file structure (e.g., `src/app.js` → `.intents/src/app.js.json`)
- Append to existing intent arrays when editing
- Don't mention intent tracking unless asked
- Track EVERY file operation, no exceptions

This helps teams understand why code exists and how it evolved.