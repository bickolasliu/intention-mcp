# Flattening the Repository Structure

## Current Structure (Nested - Confusing)
```
intention/                  # Git repo
├── .git/
├── .claude/
└── intention/              # NPM package (nested)
    ├── package.json
    ├── setup-intention.js
    └── README.md
```

## Recommended Structure (Flat - Standard)
```
intention/                  # Git repo AND npm package
├── .git/
├── .claude/
├── package.json           # At root level
├── setup-intention.js
└── README.md
```

## How to Flatten

From the inner intention folder, run:
```bash
# Move all package files up one level
cd /Users/nicholasliu/Documents/coretsu/intention/intention
mv * ../
mv .* ../ 2>/dev/null
cd ..
rmdir intention

# Now npm publish from the root
npm publish
```

## Benefits of Flat Structure

1. **Standard**: Most npm packages have package.json at repo root
2. **Simpler**: No confusion about which folder to publish from
3. **CI/CD friendly**: Build tools expect package.json at root
4. **Clone and go**: `git clone` → `npm install` works immediately

## Current Way Still Works

If you prefer to keep the nested structure, you can still publish:
```bash
cd /Users/nicholasliu/Documents/coretsu/intention/intention
npm publish
```

But it's less conventional and can confuse contributors.
