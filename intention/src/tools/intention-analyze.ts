/**
 * intention_analyze tool - Prepares conflict analysis for LLM evaluation
 */

import { getIntentHistory } from '../intents/intent-storage.js';
import { 
  prepareConflictAnalysis, 
  formatConflictAnalysisForLLM,
  createConflictAnalysisSystemPrompt 
} from '../utils/conflict-analysis.js';

export interface IntentionAnalyzeParams {
  filePath: string;
  prompt: string;
  windowDays?: number;
}

export const INTENTION_ANALYZE_TOOL = {
  name: 'intention_analyze',
  description: 'Analyze potential conflicts between a new intent and existing intents using LLM analysis',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to the file to analyze',
      },
      prompt: {
        type: 'string',
        description: 'The new intent/change to analyze for conflicts',
      },
      windowDays: {
        type: 'number',
        description: 'Number of days to look back for recent intents (default: 7)',
        default: 7,
      },
    },
    required: ['filePath', 'prompt'],
  },
};

export async function handleIntentionAnalyze(params: IntentionAnalyzeParams): Promise<any> {
  const { filePath, prompt, windowDays = 7 } = params;
  
  try {
    // Get existing intents
    const intents = await getIntentHistory(filePath);
    
    // Prepare conflict analysis
    const analysis = prepareConflictAnalysis(prompt, intents, windowDays);
    
    if (!analysis.requiresLLMAnalysis) {
      // No analysis needed - no recent intents
      return {
        success: true,
        requiresAnalysis: false,
        message: analysis.analysisPrompt,
        safe: true,
      };
    }
    
    // Format the analysis for LLM
    const formattedAnalysis = formatConflictAnalysisForLLM(analysis);
    const systemPrompt = createConflictAnalysisSystemPrompt();
    
    return {
      success: true,
      requiresAnalysis: true,
      analysisRequest: formattedAnalysis,
      systemPrompt,
      recentIntents: analysis.recentIntents,
      currentPrompt: analysis.currentPrompt,
      instruction: 'Please analyze the above conflict analysis request and determine if there are any conflicts. Respond with your assessment including severity (HIGH/MEDIUM/LOW/NONE) and reasoning.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
