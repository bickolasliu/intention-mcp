#!/usr/bin/env node
/**
 * Intention MCP Server
 * Tracks AI-assisted code changes and intents for better collaboration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Tool imports
import { runSetup } from './setup-cli.js';
import {
  ALL_TOOLS,
  handleIntentionWrite,
  handleIntentionEdit,
  handleIntentionCheck,
  handleIntentionHistory,
  handleIntentionSearch,
  handleIntentionLog,
  handleIntentionExplain,
  handleIntentionAnalyze,
} from './tools/index.js';
import { createIntentsFolder } from './intents/intent-storage.js';
import { logWorkspaceInfo } from './utils/workspace.js';

async function main() {
  // Handle setup command
  if (process.argv[2] === 'setup') {
    runSetup();
    return;
  }
  const server = new Server(
    {
      name: 'intention-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Log workspace information for debugging
  logWorkspaceInfo();
  
  // Ensure .intents folder exists
  createIntentsFolder();

  // Register tool handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: ALL_TOOLS,
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    // Route to appropriate tool handler
    switch (name) {
      case 'intention_write':
        return await handleIntentionWrite(args as any);
      case 'intention_edit':
        return await handleIntentionEdit(args as any);
      case 'intention_check':
        return await handleIntentionCheck(args as any);
      case 'intention_history':
        return await handleIntentionHistory(args as any);
      case 'intention_search':
        return await handleIntentionSearch(args as any);
      case 'intention_log':
        return await handleIntentionLog(args as any);
      case 'intention_explain':
        return await handleIntentionExplain(args as any);
      case 'intention_analyze':
        return await handleIntentionAnalyze(args as any);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Intention MCP server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
