/**
 * intention_history tool - Views intent history for a file
 */

import { IntentionHistoryParams } from '../types.js';
import { getIntentHistory } from '../intents/intent-storage.js';
import { formatIntentForDisplay } from '../utils/formatting.js';

export const INTENTION_HISTORY_TOOL = {
  name: 'intention_history',
  description: 'View the intent history for a specific file',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to the file to get history for',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of intents to return (default: 10)',
        default: 10,
      },
    },
    required: ['filePath'],
  },
};

export async function handleIntentionHistory(params: IntentionHistoryParams): Promise<any> {
  const { filePath, limit = 10 } = params;
  
  try {
    const intents = await getIntentHistory(filePath);
    
    if (intents.length === 0) {
      return {
        success: true,
        message: 'No intent history found for this file',
        intents: [],
      };
    }
    
    // Sort by timestamp (newest first) and limit
    const sortedIntents = intents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    // Format intents for display
    const formattedIntents = sortedIntents.map(formatIntentForDisplay);
    
    return {
      success: true,
      message: `Found ${intents.length} intent(s) for this file (showing ${sortedIntents.length})`,
      intents: formattedIntents,
      totalCount: intents.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
