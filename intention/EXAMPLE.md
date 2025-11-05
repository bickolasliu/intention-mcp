# Example: How Intention Works

## Step 1: Run Setup

```bash
npx setup-intention
```

Output:
```
🎯 Intention - Simple Intent Tracking for AI Development

Detecting AI assistant configurations...

Found existing configurations for:
  • Cursor

Add intent tracking to these? (y/n): y

Configuring intent tracking...

  ✓ Cursor: Added intent tracking to existing .cursorrules
  ✓ Created .intents folder
  ✓ Created .intents/README.md

✅ Intent tracking configured successfully!
```

## Step 2: Use Your AI Assistant Normally

In Cursor, ask: "Create a hello.js file with a greeting function"

## Step 3: AI Creates Both Files

**hello.js:**
```javascript
function greeting(name) {
  return `Hello, ${name}!`;
}

module.exports = { greeting };
```

**.intents/hello.js.json:**
```json
{
  "intents": [{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-11-05T10:30:00Z",
    "action": "create",
    "prompt": "Create a hello.js file with a greeting function",
    "summary": "Created greeting function that accepts name parameter and returns greeting string",
    "model": "claude-3-5-sonnet-20241022"
  }]
}
```

## Step 4: View History

```bash
cat .intents/hello.js.json | python -m json.tool
```

## Step 5: Commit to Version Control

```bash
git add .intents/
git commit -m "Add intent tracking for hello.js"
```

The `.intents` folder should be committed to your repository so your team can understand the evolution of AI-assisted code.

## That's It!

No servers. No configuration. No complexity. Just automatic tracking of why code was written, shared with your team through version control.
