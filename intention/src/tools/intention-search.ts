/**
 * intention_search tool - Searches intents across multiple files
 */

import { IntentionSearchParams } from '../types.js';
import { searchIntents } from '../intents/intent-storage.js';
import { formatIntentWithFileForDisplay } from '../utils/formatting.js';

export const INTENTION_SEARCH_TOOL = {
  name: 'intention_search',
  description: 'Search for intents across all files by keyword or topic',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query (searches in prompts)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 20)',
        default: 20,
      },
    },
    required: ['query'],
  },
};

export async function handleIntentionSearch(params: IntentionSearchParams): Promise<any> {
  const { query, limit = 20 } = params;
  
  try {
    const results = await searchIntents(query, limit);
    
    if (results.length === 0) {
      return {
        success: true,
        message: 'No intents found matching your query',
        results: [],
      };
    }
    
    // Format results for display
    const formattedResults = results.map(formatIntentWithFileForDisplay);
    
    return {
      success: true,
      message: `Found ${results.length} intent(s) matching "${query}"`,
      results: formattedResults,
      query,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
