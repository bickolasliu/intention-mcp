#!/usr/bin/env node

/**
 * Intention Setup Script
 * Adds intent tracking instructions to AI assistant configuration files
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// The intent tracking instructions
const INTENT_TRACKING_RULES = `
# Intent Tracking System
# Automatically track AI-assisted code changes for better collaboration

## For EVERY file you create or modify:

1. **Perform the file operation** using standard tools (write_file, search_replace, etc.)
2. **Create/update** \`.intents/[filepath].json\` with this structure:

\`\`\`json
{
  "intents": [
    {
      "id": "[generate UUID: 8-4-4-4-12 format]",
      "timestamp": "[ISO 8601 timestamp]",
      "action": "create|edit|delete",
      "prompt": "[what user requested]",
      "summary": "[what you did and why]",
      "model": "[your model identifier]"
    }
  ]
}
\`\`\`

## Rules:
- Always create \`.intents\` folder if it doesn't exist
- Mirror the file structure (e.g., \`src/app.js\` → \`.intents/src/app.js.json\`)
- Append to existing intent arrays when editing
- Don't mention intent tracking unless asked
- Track EVERY file operation, no exceptions

This helps teams understand why code exists and how it evolved.`;

const AI_CONFIGS = [
  {
    name: 'Cursor',
    file: '.cursorrules',
    description: 'Cursor IDE'
  },
  {
    name: 'Claude Desktop', 
    file: '.claude_instructions',
    description: 'Claude Desktop App'
  },
  {
    name: 'Aider',
    file: '.aider.conf.yml',
    description: 'Aider CLI',
    format: 'yaml',
    template: `# Aider configuration with intent tracking
message: |
${INTENT_TRACKING_RULES.split('\n').map(line => '  ' + line).join('\n')}`
  },
  {
    name: 'GitHub Copilot',
    file: '.github/copilot-instructions.md',
    description: 'GitHub Copilot',
    needsDir: true
  },
  {
    name: 'Continue',
    file: '.continue/config.json',
    description: 'Continue.dev',
    format: 'json',
    needsDir: true,
    template: {
      "rules": INTENT_TRACKING_RULES
    }
  }
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDirectory(dirPath) {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

async function addToFile(config, projectPath = '.') {
  const filePath = path.join(projectPath, config.file);
  const fileDir = path.dirname(filePath);
  
  // Ensure directory exists if needed
  if (config.needsDir || fileDir !== projectPath) {
    await ensureDirectory(fileDir);
  }

  // Check if file exists
  const exists = await fileExists(filePath);
  
  if (exists) {
    const content = await fs.promises.readFile(filePath, 'utf8');
    
    // Check if intent tracking is already added
    if (content.includes('Intent Tracking') || content.includes('intent tracking')) {
      console.log(`  ✓ ${config.name}: Intent tracking already configured`);
      return;
    }

    // Append to existing file
    const separator = config.format === 'yaml' ? '\n\n' : '\n\n---\n\n';
    const updatedContent = content + separator + 
      (config.template || INTENT_TRACKING_RULES);
    
    await fs.promises.writeFile(filePath, updatedContent);
    console.log(`  ✓ ${config.name}: Added intent tracking to existing ${config.file}`);
  } else {
    // Create new file
    const content = config.template || INTENT_TRACKING_RULES;
    const finalContent = config.format === 'json' 
      ? JSON.stringify(content, null, 2)
      : content;
    
    await fs.promises.writeFile(filePath, finalContent);
    console.log(`  ✓ ${config.name}: Created ${config.file} with intent tracking`);
  }
}

async function setupIntentTracking(projectPath = '.') {
  console.log('\n🎯 Intention - Simple Intent Tracking for AI Development\n');
  
  // Check which AI tools are being used
  console.log('Detecting AI assistant configurations...\n');
  
  const detectedConfigs = [];
  for (const config of AI_CONFIGS) {
    const filePath = path.join(projectPath, config.file);
    const parentDir = path.dirname(filePath);
    
    // Check if file or parent directory exists
    if (await fileExists(filePath) || await fileExists(parentDir)) {
      detectedConfigs.push(config);
    }
  }

  if (detectedConfigs.length === 0) {
    console.log('No existing AI configurations detected.\n');
    console.log('Which AI assistants do you use? (comma-separated numbers)\n');
    
    AI_CONFIGS.forEach((config, index) => {
      console.log(`  ${index + 1}. ${config.description}`);
    });
    
    const choices = await question('\nYour choice(s): ');
    const indices = choices.split(',').map(c => parseInt(c.trim()) - 1);
    
    for (const index of indices) {
      if (index >= 0 && index < AI_CONFIGS.length) {
        detectedConfigs.push(AI_CONFIGS[index]);
      }
    }
  } else {
    console.log('Found existing configurations for:');
    detectedConfigs.forEach(config => {
      console.log(`  • ${config.name}`);
    });
    
    const proceed = await question('\nAdd intent tracking to these? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      process.exit(0);
    }
  }

  // Add intent tracking to selected configs
  console.log('\nConfiguring intent tracking...\n');
  
  for (const config of detectedConfigs) {
    await addToFile(config, projectPath);
  }

  // Create .intents folder
  const intentsPath = path.join(projectPath, '.intents');
  if (!await fileExists(intentsPath)) {
    await ensureDirectory(intentsPath);
    console.log('\n  ✓ Created .intents folder');
  }

  // Add .intents to .gitignore if it exists
  const gitignorePath = path.join(projectPath, '.gitignore');
  if (await fileExists(gitignorePath)) {
    const gitignore = await fs.promises.readFile(gitignorePath, 'utf8');
    if (!gitignore.includes('.intents')) {
      await fs.promises.appendFile(gitignorePath, '\n# AI intent tracking\n.intents/\n');
      console.log('  ✓ Added .intents to .gitignore');
    }
  }

  console.log('\n✅ Intent tracking configured successfully!\n');
  console.log('Your AI assistants will now track their changes in the .intents folder.');
  console.log('\nTo view intent history:');
  console.log('  cat .intents/[filename].json | python -m json.tool');
  
  rl.close();
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Intention Setup - Configure AI assistants to track their code changes

Usage:
  npx setup-intention           Configure current directory
  npx setup-intention [path]    Configure specific directory
  npx setup-intention --help    Show this help

Supported AI Assistants:
  • Cursor (.cursorrules)
  • Claude Desktop (.claude_instructions)
  • GitHub Copilot (.github/copilot-instructions.md)
  • Aider (.aider.conf.yml)
  • Continue (.continue/config.json)

Learn more: https://github.com/[your-repo]/intention
`);
    process.exit(0);
  }

  const projectPath = args[0] || '.';
  
  try {
    await setupIntentTracking(projectPath);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
