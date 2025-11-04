# Intention MCP Server

Track and manage AI-assisted code changes with intelligent intent conflict detection.

## Overview

Intention is an MCP (Model Context Protocol) server that tracks the intent behind every AI-assisted code change. It creates a `.intents` folder that mirrors your repository structure, storing JSON files with the reasoning and context behind each modification. This enables better team collaboration by preventing conflicting changes and preserving the decision-making history of your codebase.

### Key Features

- 🎯 **Intent Tracking**: Automatically logs the reasoning behind every AI-assisted file edit
- 🤖 **LLM-Based Conflict Detection**: Uses Claude/Cursor's intelligence to analyze potential conflicts
- 👥 **Team Collaboration**: Share intent history via git for better coordination
- 📝 **Comprehensive History**: Track who changed what, when, and why
- 🔍 **Intent Search**: Find past decisions across your entire codebase
- ⚡ **Seamless Integration**: Works transparently with Claude Code and Cursor

## How It Works

1. When you edit a file using AI assistance, Intention captures your prompt/intent
2. Before making changes, it checks for recent intents from other team members
3. If potential conflicts are detected, the AI analyzes them to determine severity
4. All intents are stored in `.intents/` folder that mirrors your project structure
5. The `.intents` folder is tracked in git for team-wide visibility

## Installation

### Prerequisites

- Node.js 14+ and npm
- Claude Code or Cursor IDE
- Git (for user detection and collaboration)

### Quick Install

```bash
# Install globally via npm
npm install -g intention-mcp

# Run automatic setup for both Claude Code and Cursor
intention-mcp setup

# Or configure individually
intention-mcp setup --claude
intention-mcp setup --cursor
```

### Manual Configuration

#### Claude Code (`~/.claude.json`)

```json
{
  "mcpServers": {
    "intention": {
      "command": "intention-mcp",
      "args": ["--workspace", "."]
    }
  }
}
```

#### Cursor

1. Add to Cursor's MCP configuration (similar to Claude)
2. Create/update `.cursorrules` in your repository:

```
# Intent Tracking Enabled
When editing files in this repository:
- Use intention_edit for file modifications (captures reasoning)
- Use intention_write for new files
- Use intention_analyze to check for conflicts before changes
- Use intention_search to understand previous implementation decisions
- If using standard file operations, call intention_log afterwards
```

## Usage

Once installed, Intention provides these tools to Claude/Cursor:

### Core Tools

#### `intention_write`
Create or overwrite files while tracking intent.

```
Parameters:
- filePath: Path to the file
- content: File content
- prompt: Your reasoning/intent for this change
- force: Override conflicts (optional)
- skipConflictCheck: Skip after LLM analysis (optional)
```

#### `intention_edit`
Edit existing files with intent tracking.

```
Parameters:
- filePath: Path to the file
- oldContent: Text to replace
- newContent: New text
- prompt: Your reasoning for the change
- replaceAll: Replace all occurrences (optional)
- force: Override conflicts (optional)
- skipConflictCheck: Skip after LLM analysis (optional)
```

#### `intention_analyze`
Analyze potential conflicts using LLM intelligence.

```
Parameters:
- filePath: Path to analyze
- prompt: The intended change
- windowDays: How many days back to check (default: 7)
```

### Query Tools

#### `intention_check`
Check for recent intents before making changes.

```
Parameters:
- filePath: Path to check
- prompt: Your intended change (optional, for conflict analysis)
```

#### `intention_history`
View intent history for a file.

```
Parameters:
- filePath: Path to the file
- limit: Maximum results (default: 10)
```

#### `intention_search`
Search intents across all files.

```
Parameters:
- query: Search term
- limit: Maximum results (default: 20)
```

#### `intention_explain`
Get AI analysis of a file's evolution.

```
Parameters:
- filePath: Path to analyze
```

#### `intention_log`
Log intent after using standard file operations.

```
Parameters:
- filePath: Path that was modified
- prompt: The reasoning behind the change
```

## Example Workflow

### 1. Making a Change

When you ask Claude/Cursor to modify a file:

```
You: "Add error handling to the login function in auth.js"

Claude/Cursor: 
1. Calls intention_analyze to check for conflicts
2. If conflicts found, analyzes them using LLM
3. If safe, proceeds with intention_edit
4. Logs: "Add error handling to the login function"
```

### 2. Conflict Detection

```
You: "Remove authentication from the API"

Claude/Cursor:
1. Detects recent intent: "Add OAuth2 authentication" (2 hours ago)
2. Returns conflict analysis for your review
3. Asks: "This conflicts with recent work. Override?"
```

### 3. Understanding Past Changes

```
You: "Why was this function implemented this way?"

Claude/Cursor:
1. Calls intention_explain on the file
2. Returns: "3 intents found over 2 weeks:
   - Initial implementation for user login
   - Added session management for security
   - Refactored for OAuth2 compliance"
```

## Intent Storage Format

Intents are stored in `.intents/[file-path].json`:

```json
{
  "intents": [
    {
      "id": "unique-id",
      "timestamp": "2024-11-04T10:30:00Z",
      "user": "developer@example.com",
      "prompt": "Add input validation to prevent SQL injection",
      "model": "claude-3.5-sonnet",
      "overrides": []
    }
  ]
}
```

## LLM-Based Conflict Analysis

Unlike simple keyword matching, Intention uses Claude/Cursor's intelligence to understand semantic conflicts:

- **Contradictory Changes**: "Add authentication" vs "Remove authentication"
- **Overlapping Features**: Multiple developers working on the same functionality
- **Breaking Changes**: Modifications that undo recent work
- **Compatibility Issues**: Changes that affect the same code differently

The AI evaluates severity as:
- **HIGH**: Direct contradiction or breaking changes
- **MEDIUM**: Overlapping changes needing coordination
- **LOW**: Related but compatible changes
- **NONE**: No conflict detected

## Configuration

### Environment Variables

- `INTENTION_USER`: Override detected username
- `INTENTION_WINDOW_DAYS`: Conflict detection window (default: 7)
- `GIT_AUTHOR_NAME`: Used for user detection
- `GIT_COMMITTER_NAME`: Fallback for user detection

### User Detection Priority

1. `INTENTION_USER` environment variable
2. Git config `user.name`
3. Git config `user.email`
4. System username

## Best Practices

1. **Always Include Clear Intents**: Write descriptive prompts explaining WHY you're making changes
2. **Review Conflicts Carefully**: Don't automatically override - understand the context
3. **Commit .intents Folder**: Share intent history with your team via git
4. **Use intention_analyze**: Let the AI analyze conflicts rather than forcing changes
5. **Regular Intent Reviews**: Use intention_explain to understand file evolution

## Troubleshooting

### MCP Server Not Found

```bash
# Verify installation
which intention-mcp

# Reinstall if needed
npm install -g intention-mcp
```

### Conflicts Not Detected

- Check `.intents` folder exists
- Verify intent files are being created
- Ensure proper timestamps in intent files
- Use intention_analyze for explicit conflict checking

### User Not Detected Correctly

```bash
# Set explicitly
export INTENTION_USER="your-name"

# Or configure git
git config --global user.name "Your Name"
```

## Development

### Building from Source

```bash
git clone https://github.com/yourusername/intention-mcp
cd intention-mcp
npm install
npm run build
npm link  # Makes 'intention-mcp' available globally
```

### Running Tests

```bash
npm test
```

### Project Structure

```
intention/
├── src/
│   ├── index.ts           # MCP server entry
│   ├── tools/             # Tool implementations
│   ├── intents/           # Intent storage logic
│   └── utils/             # Utilities
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - See [LICENSE](LICENSE) file for details

## Roadmap

- [ ] Web UI for viewing intent history
- [ ] Intent analytics and insights
- [ ] Team conflict resolution workflows
- [ ] Integration with git hooks
- [ ] Support for intent templates
- [ ] Cross-repository intent tracking

---

Built to make AI-assisted development more collaborative and transparent.
