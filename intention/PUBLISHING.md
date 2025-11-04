# Publishing Intention MCP to npm

## Pre-publish Checklist

- [ ] Update version in package.json
- [ ] Update repository URLs in package.json
- [ ] Test the package locally
- [ ] Build the project
- [ ] Check what will be published
- [ ] Login to npm
- [ ] Publish to npm

## Step-by-Step Publishing Guide

### 1. Update package.json

Replace placeholder URLs with your actual GitHub repository:

```json
"repository": {
  "type": "git", 
  "url": "https://github.com/YOUR_USERNAME/intention-mcp.git"
},
"bugs": {
  "url": "https://github.com/YOUR_USERNAME/intention-mcp/issues"
},
"homepage": "https://github.com/YOUR_USERNAME/intention-mcp#readme"
```

### 2. Test Locally

```bash
# Build the project
npm run build

# Test the package locally
npm link

# In another terminal/directory, test installation
npm link intention-mcp
intention-mcp setup --help

# Unlink when done testing
npm unlink intention-mcp
```

### 3. Check Package Contents

```bash
# See what will be published
npm pack --dry-run

# Or check files that will be included
npm publish --dry-run
```

### 4. Login to npm

```bash
npm login
# Enter your username, password, and email
# May require 2FA if enabled
```

### 5. Publish to npm

```bash
# For first-time publishing
npm publish

# For updates (after changing version)
npm version patch  # or minor/major
npm publish
```

## Version Management

Use semantic versioning:
- `npm version patch` - for bug fixes (0.1.0 → 0.1.1)
- `npm version minor` - for new features (0.1.0 → 0.2.0)  
- `npm version major` - for breaking changes (0.1.0 → 1.0.0)

## Alternative: Scoped Package

If "intention-mcp" is taken, use a scoped package:

```bash
# In package.json, change name to:
"name": "@YOUR_USERNAME/intention-mcp"

# Publish publicly (scoped packages are private by default)
npm publish --access public
```

Users would then install with:
```bash
npm install -g @YOUR_USERNAME/intention-mcp
```

## Post-Publishing

Once published, users can immediately:

```bash
# Install globally
npm install -g intention-mcp

# Run setup
intention-mcp setup

# The package will be available at:
# https://www.npmjs.com/package/intention-mcp
```

## Updating the Package

For updates:

1. Make changes
2. Build: `npm run build`
3. Update version: `npm version patch/minor/major`
4. Publish: `npm publish`

npm will automatically:
- Upload your package to the registry
- Make it available globally
- Handle all dependencies
- Serve it via CDN worldwide

## Troubleshooting

### Name Already Taken
- Use a scoped package: `@username/intention-mcp`
- Or choose a different name: `intention-tracker-mcp`

### Permission Denied
- Make sure you're logged in: `npm whoami`
- Check npm authentication: `npm login`

### Files Missing in Published Package
- Check `.npmignore` and `files` in package.json
- Use `npm pack` to create a tarball and inspect contents

### Binary Not Working
- Ensure `bin` field in package.json is correct
- File must have shebang: `#!/usr/bin/env node`
- File must be executable

## GitHub Integration

After publishing to npm:

1. Create GitHub repository
2. Push code:
```bash
git init
git add .
git commit -m "Initial release"
git remote add origin https://github.com/YOUR_USERNAME/intention-mcp.git
git push -u origin main
```

3. Create GitHub release:
```bash
git tag v0.1.0
git push --tags
```

4. Add GitHub Actions for automated publishing (optional)
