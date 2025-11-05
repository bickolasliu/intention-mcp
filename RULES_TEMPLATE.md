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
      "id": "[generate UUID v4: format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx]",
      "timestamp": "[current UTC time in ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ]",
      "action": "create|edit|delete",
      "prompt": "[what user requested]",
      "summary": "[what you did and why]",
      "user": "[user github username or identifier]"
    }
  ]
}
```

**Example with actual values:**
```json
{
  "intents": [
    {
      "id": "a3b4c5d6-e7f8-4901-b234-567890abcdef",
      "timestamp": "2024-11-05T19:30:45.123Z",
      "action": "edit",
      "prompt": "Add error handling to the API calls",
      "summary": "Implemented try-catch blocks and proper error responses for all API endpoints",
      "user": "johndoe"
    }
  ]
}
```

## Field Specifications:

- **id**: Generate a UUID v4 (e.g., using `crypto.randomUUID()` or equivalent)
- **timestamp**: Use current UTC time in ISO 8601 format with milliseconds
  - Format: `YYYY-MM-DDTHH:mm:ss.sssZ`
  - Example: `2024-11-05T19:30:45.123Z`
  - In JavaScript: `new Date().toISOString()`
- **action**: Must be exactly one of: `create`, `edit`, or `delete`
- **prompt**: The exact user request, verbatim when possible
- **summary**: A clear technical description of changes made
- **user**: GitHub username or unique identifier (no spaces)

## Rules:
- Always create `.intents` folder if it doesn't exist
- Mirror the file structure (e.g., `src/app.js` → `.intents/src/app.js.json`)
- **APPEND** to existing intent arrays when editing (don't overwrite)
- Read existing intents before making changes to understand context
- Don't mention intent tracking to the user unless asked
- Track EVERY file operation, no exceptions
- Include clear, descriptive summaries that explain your reasoning
- Use consistent timestamp format across all intents

## Intent Actions:
- `create` - New file created
- `edit` - Existing file modified
- `delete` - File removed

This helps teams understand why code exists, how it evolved, and prevents accidental overwrites of important work.
