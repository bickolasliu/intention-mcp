/**
 * intention_explain tool - Analyzes and explains reasoning behind implementations
 */

import { IntentionExplainParams } from '../types.js';
import { getIntentHistory } from '../intents/intent-storage.js';
import { analyzeIntentHistory } from '../utils/intent-analysis.js';

export const INTENTION_EXPLAIN_TOOL = {
  name: 'intention_explain',
  description: 'Analyze and explain the reasoning behind code implementation based on intent history',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to the file to explain',
      },
    },
    required: ['filePath'],
  },
};

export async function handleIntentionExplain(params: IntentionExplainParams): Promise<any> {
  const { filePath } = params;
  
  try {
    const intents = await getIntentHistory(filePath);
    
    if (intents.length === 0) {
      return {
        success: true,
        message: 'No intent history found for this file',
        explanation: 'This file has no recorded intents. Consider using intention tools to track future changes.',
      };
    }
    
    // Analyze the intent history
    const analysis = analyzeIntentHistory(intents);
    
    return {
      success: true,
      filePath,
      explanation: analysis.summary,
      keyThemes: analysis.themes,
      timeline: analysis.timeline,
      contributors: analysis.contributors,
      recommendations: analysis.recommendations,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
