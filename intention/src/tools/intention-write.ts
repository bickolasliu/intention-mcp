/**
 * intention_write tool - Writes files and logs intent
 */

import * as fs from 'fs';
import * as path from 'path';
import { IntentionWriteParams } from '../types.js';
import { saveIntent, getIntentHistory } from '../intents/intent-storage.js';
import { getUserInfo } from '../utils/user-detection.js';
import { prepareConflictAnalysis, formatConflictAnalysisForLLM } from '../utils/conflict-analysis.js';

export const INTENTION_WRITE_TOOL = {
  name: 'intention_write',
  description: 'Write a file to the filesystem and track the intent behind the change',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to the file to write',
      },
      content: {
        type: 'string',
        description: 'Content to write to the file',
      },
      prompt: {
        type: 'string',
        description: 'The reasoning or intent behind this file creation/modification',
      },
      force: {
        type: 'boolean',
        description: 'Force write even if conflicts are detected (default: false)',
        default: false,
      },
      skipConflictCheck: {
        type: 'boolean',
        description: 'Skip conflict check (use after LLM has analyzed conflicts)',
        default: false,
      },
    },
    required: ['filePath', 'content', 'prompt'],
  },
};

export async function handleIntentionWrite(params: IntentionWriteParams & { force?: boolean; skipConflictCheck?: boolean }): Promise<any> {
  const { filePath, content, prompt, force = false, skipConflictCheck = false } = params;
  
  try {
    // Check for conflicts if file exists
    if (fs.existsSync(filePath) && !skipConflictCheck && !force) {
      const intents = await getIntentHistory(filePath);
      const analysis = prepareConflictAnalysis(prompt, intents);
      
      if (analysis.requiresLLMAnalysis) {
        // Return conflict analysis for LLM to evaluate
        const formattedAnalysis = formatConflictAnalysisForLLM(analysis);
        
        return {
          success: false,
          requiresConflictAnalysis: true,
          analysisRequest: formattedAnalysis,
          recentIntents: analysis.recentIntents,
          originalParams: params,
          message: 'Recent intents detected on existing file. Please analyze for conflicts before proceeding.',
          instruction: 'Review the conflict analysis above. If you determine there is NO significant conflict, retry with skipConflictCheck: true. If there IS a conflict, either abort or use force: true to override.',
        };
      }
    }
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write the file
    fs.writeFileSync(filePath, content, 'utf8');
    
    // Save the intent
    const user = await getUserInfo();
    
    // Get any overridden intents if force was used
    let overriddenIntentIds: string[] = [];
    if (force && fs.existsSync(filePath)) {
      const intents = await getIntentHistory(filePath);
      const analysis = prepareConflictAnalysis(prompt, intents);
      if (analysis.recentIntents.length > 0) {
        overriddenIntentIds = analysis.recentIntents.map(i => i.id);
      }
    }
      
    await saveIntent(filePath, {
      prompt,
      user,
      overrides: overriddenIntentIds,
    });
    
    return {
      success: true,
      message: `File written successfully: ${filePath}`,
      intentTracked: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
