/**
 * intention_edit tool - Edits files and logs intent
 */

import * as fs from 'fs';
import { IntentionEditParams } from '../types.js';
import { saveIntent, getIntentHistory } from '../intents/intent-storage.js';
import { getUserInfo } from '../utils/user-detection.js';
import { prepareConflictAnalysis, formatConflictAnalysisForLLM } from '../utils/conflict-analysis.js';

export const INTENTION_EDIT_TOOL = {
  name: 'intention_edit',
  description: 'Edit a file by replacing text and track the intent behind the change',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to the file to edit',
      },
      oldContent: {
        type: 'string',
        description: 'The text to replace',
      },
      newContent: {
        type: 'string',
        description: 'The text to replace it with',
      },
      prompt: {
        type: 'string',
        description: 'The reasoning or intent behind this edit',
      },
      replaceAll: {
        type: 'boolean',
        description: 'Replace all occurrences (default: false)',
        default: false,
      },
      force: {
        type: 'boolean',
        description: 'Force edit even if conflicts are detected (default: false)',
        default: false,
      },
      skipConflictCheck: {
        type: 'boolean',
        description: 'Skip conflict check (use after LLM has analyzed conflicts)',
        default: false,
      },
    },
    required: ['filePath', 'oldContent', 'newContent', 'prompt'],
  },
};

export async function handleIntentionEdit(params: IntentionEditParams & { force?: boolean; skipConflictCheck?: boolean }): Promise<any> {
  const { filePath, oldContent, newContent, prompt, replaceAll = false, force = false, skipConflictCheck = false } = params;
  
  try {
    // Check for conflicts unless skipped
    if (!skipConflictCheck && !force) {
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
          message: 'Recent intents detected. Please analyze for conflicts before proceeding.',
          instruction: 'Review the conflict analysis above. If you determine there is NO significant conflict, retry with skipConflictCheck: true. If there IS a conflict, either abort or use force: true to override.',
        };
      }
    }
    
    // Read the current file content
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: `File not found: ${filePath}`,
      };
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Perform the replacement
    if (replaceAll) {
      // Escape special regex characters
      const escapedOld = oldContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedOld, 'g');
      const newFileContent = content.replace(regex, newContent);
      
      if (newFileContent === content) {
        return {
          success: false,
          error: 'No matches found for the specified text',
        };
      }
      
      content = newFileContent;
    } else {
      const index = content.indexOf(oldContent);
      if (index === -1) {
        return {
          success: false,
          error: 'The specified text was not found in the file',
        };
      }
      
      content = content.substring(0, index) + newContent + content.substring(index + oldContent.length);
    }
    
    // Write the updated content
    fs.writeFileSync(filePath, content, 'utf8');
    
    // Save the intent
    const user = await getUserInfo();
    
    // Get any overridden intents if force was used
    let overriddenIntentIds: string[] = [];
    if (force) {
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
      message: `File edited successfully: ${filePath}`,
      intentTracked: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
