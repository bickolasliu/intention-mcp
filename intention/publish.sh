#!/bin/bash

# Quick publish script for intention-mcp

echo "🚀 Preparing to publish intention-mcp to npm..."

# Check if logged into npm
echo "Checking npm login status..."
npm whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged into npm. Please run: npm login"
    exit 1
fi

echo "✅ Logged in as: $(npm whoami)"

# Build the project
echo "Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Show what will be published
echo ""
echo "📦 Files to be published:"
npm pack --dry-run

echo ""
echo "Ready to publish version $(node -p "require('./package.json').version")"
echo "This will make the package available globally as: intention-mcp"
echo ""
read -p "Do you want to publish to npm? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm publish
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully published!"
        echo "📦 Package available at: https://www.npmjs.com/package/intention-mcp"
        echo ""
        echo "Users can now install with:"
        echo "  npm install -g intention-mcp"
        echo ""
    fi
else
    echo "Publishing cancelled"
fi
