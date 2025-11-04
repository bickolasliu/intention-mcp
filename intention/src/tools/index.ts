/**
 * Tool exports for the Intention MCP Server
 */

export { INTENTION_WRITE_TOOL, handleIntentionWrite } from './intention-write.js';
export { INTENTION_EDIT_TOOL, handleIntentionEdit } from './intention-edit.js';
export { INTENTION_CHECK_TOOL, handleIntentionCheck } from './intention-check.js';
export { INTENTION_HISTORY_TOOL, handleIntentionHistory } from './intention-history.js';
export { INTENTION_SEARCH_TOOL, handleIntentionSearch } from './intention-search.js';
export { INTENTION_LOG_TOOL, handleIntentionLog } from './intention-log.js';
export { INTENTION_EXPLAIN_TOOL, handleIntentionExplain } from './intention-explain.js';
export { INTENTION_ANALYZE_TOOL, handleIntentionAnalyze } from './intention-analyze.js';

// Import all tool definitions
import { INTENTION_WRITE_TOOL } from './intention-write.js';
import { INTENTION_EDIT_TOOL } from './intention-edit.js';
import { INTENTION_CHECK_TOOL } from './intention-check.js';
import { INTENTION_HISTORY_TOOL } from './intention-history.js';
import { INTENTION_SEARCH_TOOL } from './intention-search.js';
import { INTENTION_LOG_TOOL } from './intention-log.js';
import { INTENTION_EXPLAIN_TOOL } from './intention-explain.js';
import { INTENTION_ANALYZE_TOOL } from './intention-analyze.js';

// Export all tools as an array for easy registration
export const ALL_TOOLS = [
  INTENTION_WRITE_TOOL,
  INTENTION_EDIT_TOOL,
  INTENTION_CHECK_TOOL,
  INTENTION_HISTORY_TOOL,
  INTENTION_SEARCH_TOOL,
  INTENTION_LOG_TOOL,
  INTENTION_EXPLAIN_TOOL,
  INTENTION_ANALYZE_TOOL,
];
