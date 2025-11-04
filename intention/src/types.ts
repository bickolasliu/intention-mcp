/**
 * Type definitions for Intention MCP Server v2.0 (Simplified)
 */

export interface Intent {
  id: string;
  timestamp: string;
  action: 'create' | 'edit' | 'delete';
  filePath: string;
  prompt: string;
  summary: string;
  user: string;
  model: string;
}

export interface IntentFile {
  intents: Intent[];
}