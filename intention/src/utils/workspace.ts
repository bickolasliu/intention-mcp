/**
 * Workspace detection utilities for MCP server
 */

import * as path from 'path';
import * as fs from 'fs';

/**
 * Get the workspace root directory
 * Priority order:
 * 1. MCP_WORKSPACE environment variable (if Cursor sets this)
 * 2. --workspace command line argument
 * 3. Current working directory
 * 4. Look for .git or package.json to find project root
 */
export function getWorkspaceRoot(): string {
  // Check environment variable first (in case Cursor sets this)
  if (process.env.MCP_WORKSPACE) {
    return process.env.MCP_WORKSPACE;
  }
  
  // Check for --workspace argument
  const workspaceArgIndex = process.argv.findIndex(arg => arg === '--workspace');
  if (workspaceArgIndex !== -1 && process.argv[workspaceArgIndex + 1]) {
    const workspace = process.argv[workspaceArgIndex + 1];
    // If it's a relative path, resolve it from cwd
    return path.isAbsolute(workspace) ? workspace : path.resolve(process.cwd(), workspace);
  }
  
  // Try to find project root by looking for .git or package.json
  let currentDir = process.cwd();
  const root = path.parse(currentDir).root;
  
  while (currentDir !== root) {
    // Check for .git directory or package.json
    if (fs.existsSync(path.join(currentDir, '.git')) || 
        fs.existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  // Fallback to current working directory
  return process.cwd();
}

/**
 * Log workspace information for debugging
 */
export function logWorkspaceInfo(): void {
  console.error('Workspace Detection:');
  console.error('  - Current working directory:', process.cwd());
  console.error('  - Detected workspace root:', getWorkspaceRoot());
  console.error('  - MCP_WORKSPACE env:', process.env.MCP_WORKSPACE || 'not set');
  console.error('  - Command line args:', process.argv.slice(2).join(' '));
}
