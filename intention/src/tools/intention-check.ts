/**
 * intention_check tool - Checks for conflicting intents
 */

import { IntentionCheckParams } from '../types.js';
import { getIntentHistory } from '../intents/intent-storage.js';
import { formatIntentForDisplay } from '../utils/formatting.js';
import { prepareConflictAnalysis, formatConflictAnalysisForLLM } from '../utils/conflict-analysis.js';

const DEFAULT_CONFLICT_WINDOW_DAYS = 7;

export const INTENTION_CHECK_TOOL = {
  name: 'intention_check',
  description: 'Check for conflicting intents before editing a file',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to the file to check',
      },
      prompt: {
        type: 'string',
        description: 'Optional: The intended change to check for conflicts',
      },
    },
    required: ['filePath'],
  },
};

export async function handleIntentionCheck(params: IntentionCheckParams & { prompt?: string }): Promise<any> {
  const { filePath, prompt } = params;
  
  try {
    const intents = await getIntentHistory(filePath);
    
    if (intents.length === 0) {
      return {
        success: true,
        message: 'No previous intents found for this file',
        safe: true,
        requiresAnalysis: false,
      };
    }
    
    // If a prompt is provided, prepare conflict analysis for LLM
    if (prompt) {
      const analysis = prepareConflictAnalysis(prompt, intents, DEFAULT_CONFLICT_WINDOW_DAYS);
      
      if (!analysis.requiresLLMAnalysis) {
        return {
          success: true,
          message: analysis.analysisPrompt,
          safe: true,
          requiresAnalysis: false,
        };
      }
      
      // Return analysis for LLM to evaluate
      const formattedAnalysis = formatConflictAnalysisForLLM(analysis);
      
      return {
        success: true,
        requiresAnalysis: true,
        analysisRequest: formattedAnalysis,
        recentIntents: analysis.recentIntents,
        currentPrompt: analysis.currentPrompt,
        totalIntents: intents.length,
        message: 'Conflict analysis prepared. Please review the analysis request to determine if there are conflicts.',
        instruction: 'Analyze the above intents for potential conflicts. Consider: 1) Are the changes contradictory? 2) Do they affect the same functionality? 3) Will the new change break recent work?',
      };
    }
    
    // Basic check without prompt - just list recent intents
    const windowMs = DEFAULT_CONFLICT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    const recentIntents = intents.filter((intent) => {
      const intentTime = new Date(intent.timestamp).getTime();
      return (now - intentTime) < windowMs;
    });
    
    if (recentIntents.length === 0) {
      return {
        success: true,
        message: 'No recent intents found within the conflict window',
        totalIntents: intents.length,
        safe: true,
        requiresAnalysis: false,
      };
    }
    
    // Format recent intents for display
    const formattedIntents = recentIntents.map(formatIntentForDisplay);
    
    return {
      success: true,
      message: `Found ${recentIntents.length} recent intent(s) for this file`,
      recentIntents: formattedIntents,
      totalIntents: intents.length,
      recommendation: 'Review these intents before making changes. Provide a prompt to analyze for specific conflicts.',
      requiresAnalysis: false,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
