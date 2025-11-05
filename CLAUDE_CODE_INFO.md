# Claude Code Configuration

Claude Code (the Desktop IDE) looks for configuration in these locations:

## Primary Configuration Files

1. **`.claude/instructions.md`** - Project-specific instructions (what we use)
2. **`.clauderc`** - Alternative custom instructions file
3. **`.claude/commands/`** - Custom slash commands
4. **`.claudeignore`** - Files to exclude

## Our Setup

We configure Claude Code using **`.claude/instructions.md`** which contains the intent tracking rules.

When you run `npx setup-intention`, it will:
1. Create `.claude/` directory
2. Add `instructions.md` with intent tracking rules
3. Claude Code will automatically read these instructions

## Alternative: .clauderc

If you prefer, you can also use `.clauderc` in the project root instead of `.claude/instructions.md`. Both work the same way.

## Testing

To verify Claude Code is using the instructions:
1. Open your project in Claude Code
2. Make a file change
3. Check if `.intents/[filename].json` was created
4. Verify the intent tracking is working

## What Claude Code Does NOT Use

- `.claude-project.yaml` - This is for Claude CLI, not the desktop IDE
- `.claude_instructions` - This was for an older version

## Key Difference from Cursor

- Cursor uses `.cursorrules` in the project root
- Claude Code uses `.claude/instructions.md` in a subdirectory
