/**
 * Type definitions for the Intention MCP Server
 */

export interface Intent {
  id: string;
  timestamp: string;
  user: string;
  prompt: string;
  model?: string;
  overrides: string[]; // IDs of intents that were overridden
}

export interface IntentFile {
  intents: Intent[];
}

export interface IntentionEditParams {
  filePath: string;
  oldContent: string;
  newContent: string;
  prompt: string;
  replaceAll?: boolean;
}

export interface IntentionWriteParams {
  filePath: string;
  content: string;
  prompt: string;
}

export interface IntentionCheckParams {
  filePath: string;
}

export interface IntentionHistoryParams {
  filePath: string;
  limit?: number;
}

export interface IntentionSearchParams {
  query: string;
  limit?: number;
}

export interface IntentionLogParams {
  filePath: string;
  prompt: string;
}

export interface IntentionExplainParams {
  filePath: string;
}
