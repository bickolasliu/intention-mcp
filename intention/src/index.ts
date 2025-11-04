#!/usr/bin/env node
/**
 * Intention MCP Server v2.0 - Simplified
 * Provides guidance for AI-assisted intent tracking without complex file operations
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as os from 'os';

// Simple guidance tools - no file operations
const TOOLS = [
  {
    name: 'intention_get_template',
    description: 'Get a template for creating intent records. The AI should use this template when creating .intents files.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['create', 'edit', 'delete'],
          description: 'Type of file operation'
        },
        filePath: {
          type: 'string',
          description: 'Path to the file being operated on'
        },
        prompt: {
          type: 'string',
          description: 'The user request that triggered this operation'
        },
        summary: {
          type: 'string',
          description: 'Brief description of what was done'
        }
      },
      required: ['action', 'filePath', 'prompt', 'summary']
    }
  },
  {
    name: 'intention_read_history',
    description: 'Read existing intent history for a file to understand previous changes',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the file to check history for'
        }
      },
      required: ['filePath']
    }
  },
  {
    name: 'intention_get_instructions',
    description: 'Get instructions on how to properly track intents using standard file operations',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

async function main() {
  const server = new Server(
    {
      name: 'intention-mcp',
      version: '2.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    switch (name) {
      case 'intention_get_template': {
        if (!args) {
          throw new Error('Arguments required for intention_get_template');
        }
        // Generate template for AI to use
        const template = {
          intents: [{
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            action: args.action,
            filePath: args.filePath,
            prompt: args.prompt,
            summary: args.summary,
            user: os.userInfo().username,
            model: 'unknown' // AI should update this
          }]
        };
        
        const intentPath = `.intents/${args.filePath}.json`;
        
        return {
          content: [{
            type: 'text',
            text: `Intent template generated. The AI should:
1. Create/update the file: ${intentPath}
2. Use this JSON structure:

${JSON.stringify(template, null, 2)}

Note: If the intent file already exists, append to the intents array instead of replacing it.`
          }]
        };
      }
      
      case 'intention_read_history': {
        if (!args) {
          throw new Error('Arguments required for intention_read_history');
        }
        const intentPath = path.join('.intents', `${args.filePath}.json`);
        
        if (!fs.existsSync(intentPath)) {
          return {
            content: [{
              type: 'text',
              text: `No intent history found for ${args.filePath}. This would be the first tracked change.`
            }]
          };
        }
        
        try {
          const content = fs.readFileSync(intentPath, 'utf8');
          const intents = JSON.parse(content);
          
          return {
            content: [{
              type: 'text',
              text: `Intent history for ${args.filePath}:

${JSON.stringify(intents, null, 2)}

Total intents: ${intents.intents?.length || 0}
Latest change: ${intents.intents?.[intents.intents.length - 1]?.summary || 'N/A'}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error reading intent history: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }
      
      case 'intention_get_instructions': {
        return {
          content: [{
            type: 'text',
            text: `Intent Tracking Instructions:

1. For EVERY file you create or modify, also create/update an intent record
2. Intent files go in: .intents/[original-file-path].json
3. Use standard file operations (write_file, search_replace) for everything
4. Structure:
   - Create .intents folder if it doesn't exist
   - Mirror the source structure
   - Each intent file contains an array of intent objects

Example workflow:
- User asks to create src/app.js
- You: 
  1. Create src/app.js with write_file
  2. Create .intents/src/app.js.json with write_file
  
The intent JSON should include: id (UUID), timestamp (ISO), action, prompt, summary, user, model

This helps teams understand why code exists and how it evolved.`
          }]
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Intention MCP server v2.0 started (simplified)');
  console.error('This version provides guidance only - AI uses standard tools for file operations');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});