# 🎉 Your Package is Ready for Local Testing!

I've successfully set up `intention-mcp` for local testing using `npm link`.

## ✅ What's Ready Now

The following commands are now available globally on your system:
- `intention-mcp` - The main MCP server (located at `/opt/homebrew/bin/intention-mcp`)
- `intention-mcp-setup` - The setup wizard (located at `/opt/homebrew/bin/intention-mcp-setup`)

## 🧪 Quick Tests to Try

```bash
# 1. Test the MCP server starts
intention-mcp
# (Press Ctrl+C to stop)

# 2. Run the setup wizard (with specific flags to avoid permission issues)
intention-mcp-setup --cursor    # Just set up Cursor
intention-mcp-setup --claude    # Just set up Claude

# 3. Test direct execution
node /Users/nicholasliu/Documents/coretsu/intention/intention/dist/index.js
```

## 🔧 Development Workflow

```bash
# 1. Make changes to TypeScript files in src/

# 2. Rebuild the package
npm run build

# 3. Changes are immediately available (thanks to npm link)
# Test your changes right away with intention-mcp command

# 4. For continuous development, use watch mode:
npm run dev  # Auto-recompiles on changes
```

## 📦 Testing the Actual Package (What npm will publish)

```bash
# Create a package tarball (like what npm publish would create)
npm pack
# This creates intention-mcp-0.1.0.tgz

# Test installing it
cd /tmp
npm install /Users/nicholasliu/Documents/coretsu/intention/intention/intention-mcp-*.tgz
```

## 🔄 Uninstalling the Local Test Version

When you're done testing locally:

```bash
# Remove the global link
npm unlink -g intention-mcp

# Verify it's removed
which intention-mcp  # Should return "not found"
```

## 💡 Tips

1. The package is currently linked globally, so any changes you make (after rebuilding) will immediately be reflected
2. Test the package in a real Claude or Cursor project to ensure the MCP integration works
3. The `.intents` folder will be created wherever you run the command
4. Remember to increment the version in package.json before publishing to npm

## 🚀 Ready to Publish?

When you're satisfied with local testing:

```bash
# Login to npm (if not already)
npm login

# Publish using your simplified script
./publish.sh
# Or
npm publish
```

Your package is working locally! Test it thoroughly before publishing to npm.
