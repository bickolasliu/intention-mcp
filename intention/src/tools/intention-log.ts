/**
 * intention_log tool - Log intent after using standard file operations
 */

import { IntentionLogParams } from '../types.js';
import { saveIntent } from '../intents/intent-storage.js';
import { getUserInfo } from '../utils/user-detection.js';

export const INTENTION_LOG_TOOL = {
  name: 'intention_log',
  description: 'Log an intent after making changes with standard file operations',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to the file that was modified',
      },
      prompt: {
        type: 'string',
        description: 'The reasoning or intent behind the modification',
      },
    },
    required: ['filePath', 'prompt'],
  },
};

export async function handleIntentionLog(params: IntentionLogParams): Promise<any> {
  const { filePath, prompt } = params;
  
  try {
    // Save the intent
    const user = await getUserInfo();
    await saveIntent(filePath, {
      prompt,
      user,
      overrides: [],
    });
    
    return {
      success: true,
      message: `Intent logged successfully for: ${filePath}`,
      note: 'Consider using intention_write or intention_edit for automatic intent tracking',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
