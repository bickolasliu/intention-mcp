#!/bin/bash

# Quick publish script for intention-mcp with simple version input

echo "🚀 Preparing to publish intention-mcp to npm..."

# Check if logged into npm
echo "Checking npm login status..."
npm whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged into npm. Please run: npm login"
    exit 1
fi

echo "✅ Logged in as: $(npm whoami)"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo ""
echo "📌 Current version: $CURRENT_VERSION"
echo ""

# Ask for new version
read -p "Enter new version (or press Enter to cancel): " NEW_VERSION_INPUT

# Check if user wants to cancel
if [ -z "$NEW_VERSION_INPUT" ]; then
    echo "❌ Publishing cancelled"
    exit 0
fi

# Try to update version
echo "Updating to version $NEW_VERSION_INPUT..."
NEW_VERSION=$(npm version $NEW_VERSION_INPUT --no-git-tag-version 2>&1)
if [ $? -ne 0 ]; then
    echo "❌ Invalid version format: $NEW_VERSION_INPUT"
    echo "$NEW_VERSION"
    echo ""
    echo "Valid formats: 1.0.0, 2.1.3, 3.0.0-beta.1, etc."
    exit 1
fi

echo "📦 Version updated to: $NEW_VERSION"

# Build the project
echo ""
echo "Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    # Revert version change if build failed
    git checkout -- package.json package-lock.json 2>/dev/null
    echo "Version change reverted due to build failure"
    exit 1
fi

echo "✅ Build successful"

# Show what will be published
echo ""
echo "📦 Files to be published:"
npm pack --dry-run

echo ""
echo "Ready to publish version $NEW_VERSION"
echo "This will make the package available globally as: intention-mcp"
echo ""
read -p "Do you want to publish to npm? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm publish
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully published version $NEW_VERSION!"
        echo "📦 Package available at: https://www.npmjs.com/package/intention-mcp"
        echo ""
        echo "Users can now install with:"
        echo "  npm install -g intention-mcp"
        echo ""
        
        # Optionally commit and tag if in a git repo
        if [ -d .git ]; then
            echo "📝 Version was updated to $NEW_VERSION"
            read -p "Create git commit and tag for this release? (y/n) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git add package.json package-lock.json
                git commit -m "Release version $NEW_VERSION"
                git tag "v$NEW_VERSION"
                echo "✅ Git commit and tag created"
                echo "📌 Don't forget to push: git push && git push --tags"
            fi
        fi
    else
        echo "❌ Publishing failed"
        # Revert version change if publishing failed
        git checkout -- package.json package-lock.json 2>/dev/null
        echo "Version change reverted due to publish failure"
        exit 1
    fi
else
    echo "Publishing cancelled"
    # Revert version change if cancelled
    git checkout -- package.json package-lock.json 2>/dev/null
    echo "Version change reverted"
fi