#!/usr/bin/env node
/**
 * Setup CLI for Intention MCP Server
 * Configures Claude Code and Cursor to use the intention MCP server
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

const CLAUDE_CONFIG_PATH = path.join(os.homedir(), '.claude.json');
const BACKUP_SUFFIX = '.backup';

interface ClaudeConfig {
  mcpServers?: {
    [key: string]: {
      command: string;
      args?: string[];
    };
  };
}

function parseArgs(): { claude: boolean; cursor: boolean } {
  const args = process.argv.slice(2);
  
  if (args.includes('--claude')) {
    return { claude: true, cursor: false };
  }
  if (args.includes('--cursor')) {
    return { claude: false, cursor: true };
  }
  
  // Default: configure both
  return { claude: true, cursor: true };
}

function createBackup(filePath: string): void {
  if (fs.existsSync(filePath)) {
    const backupPath = filePath + BACKUP_SUFFIX;
    fs.copyFileSync(filePath, backupPath);
    console.log(`✓ Created backup: ${backupPath}`);
  }
}

function configureClaudeCode(): void {
  console.log('\n📋 Configuring Claude Code...');
  
  try {
    createBackup(CLAUDE_CONFIG_PATH);
    
    let config: ClaudeConfig = {};
    
    if (fs.existsSync(CLAUDE_CONFIG_PATH)) {
      const content = fs.readFileSync(CLAUDE_CONFIG_PATH, 'utf8');
      config = JSON.parse(content);
    }
    
    if (!config.mcpServers) {
      config.mcpServers = {};
    }
    
    config.mcpServers.intention = {
      command: 'intention-mcp',
    };
    
    fs.writeFileSync(CLAUDE_CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log('✅ Claude Code configured successfully');
  } catch (error) {
    console.error('❌ Failed to configure Claude Code:', error);
  }
}

function configureCursor(): void {
  console.log('\n📋 Configuring Cursor...');
  
  const cursorrules = `.cursorrules`;
  const intentionRules = `
# Intent Tracking Enabled
# This repository uses the intention MCP server to track AI-assisted changes

When editing files in this repository:
- Use intention_edit for file modifications (captures reasoning)
- Use intention_write for new files
- Use intention_search to understand previous implementation decisions
- Check intention_history before making major changes
- If you use standard file operations, call intention_log afterwards

To view intent history for a file, use intention_explain.
`;

  try {
    if (fs.existsSync(cursorrules)) {
      const content = fs.readFileSync(cursorrules, 'utf8');
      if (!content.includes('Intent Tracking Enabled')) {
        fs.appendFileSync(cursorrules, '\n' + intentionRules);
        console.log('✅ Updated existing .cursorrules file');
      } else {
        console.log('✅ .cursorrules already configured');
      }
    } else {
      fs.writeFileSync(cursorrules, intentionRules);
      console.log('✅ Created .cursorrules file');
    }
    
    console.log('\n⚠️  Note: You may need to manually add the intention MCP server to Cursor\'s MCP settings');
    console.log('   Add the same configuration as Claude Code to Cursor\'s MCP config file');
  } catch (error) {
    console.error('❌ Failed to configure Cursor:', error);
  }
}

function verifyInstallation(): void {
  console.log('\n🔍 Verifying installation...');
  
  try {
    execSync('which intention-mcp', { stdio: 'ignore' });
    console.log('✅ intention-mcp command found in PATH');
  } catch {
    console.error('⚠️  intention-mcp not found in PATH. Make sure to run npm install -g intention-mcp');
  }
}

function main(): void {
  console.log('🚀 Intention MCP Setup Wizard');
  console.log('============================\n');
  
  const options = parseArgs();
  
  if (options.claude) {
    configureClaudeCode();
  }
  
  if (options.cursor) {
    configureCursor();
  }
  
  verifyInstallation();
  
  console.log('\n✨ Setup complete! Restart Claude Code or Cursor to load the intention MCP server.');
  console.log('\nFor manual configuration, see: https://github.com/your-repo/intention-mcp');
}

// Export for use in main index.ts if called with 'setup' argument
export { main as runSetup };

// Run if called directly
if (require.main === module) {
  main();
}
