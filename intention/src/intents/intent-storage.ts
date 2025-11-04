/**
 * Intent storage functionality - reads and writes intent JSON files
 */

import * as fs from 'fs';
import * as path from 'path';
import { Intent, IntentFile } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

const INTENTS_FOLDER = '.intents';

/**
 * Get the intent file path for a given source file
 */
function getIntentFilePath(filePath: string): string {
  // Get the relative path from current working directory
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Create the mirrored path in .intents folder
  const intentPath = path.join(INTENTS_FOLDER, relativePath + '.json');
  
  return intentPath;
}

/**
 * Ensure the .intents directory structure exists
 */
function ensureIntentDirectory(intentFilePath: string): void {
  const dir = path.dirname(intentFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Read intents from a JSON file
 */
function readIntentFile(intentFilePath: string): IntentFile {
  if (!fs.existsSync(intentFilePath)) {
    return { intents: [] };
  }
  
  try {
    const content = fs.readFileSync(intentFilePath, 'utf8');
    return JSON.parse(content) as IntentFile;
  } catch (error) {
    console.error(`Error reading intent file ${intentFilePath}:`, error);
    return { intents: [] };
  }
}

/**
 * Write intents to a JSON file
 */
function writeIntentFile(intentFilePath: string, intentFile: IntentFile): void {
  ensureIntentDirectory(intentFilePath);
  fs.writeFileSync(intentFilePath, JSON.stringify(intentFile, null, 2), 'utf8');
}

/**
 * Save a new intent for a file
 */
export async function saveIntent(
  filePath: string,
  intentData: {
    prompt: string;
    user: string;
    overrides: string[];
    model?: string;
  }
): Promise<Intent> {
  const intentFilePath = getIntentFilePath(filePath);
  const intentFile = readIntentFile(intentFilePath);
  
  const newIntent: Intent = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    user: intentData.user,
    prompt: intentData.prompt,
    model: intentData.model || 'unknown',
    overrides: intentData.overrides,
  };
  
  intentFile.intents.push(newIntent);
  writeIntentFile(intentFilePath, intentFile);
  
  return newIntent;
}

/**
 * Get intent history for a file
 */
export async function getIntentHistory(filePath: string): Promise<Intent[]> {
  const intentFilePath = getIntentFilePath(filePath);
  const intentFile = readIntentFile(intentFilePath);
  return intentFile.intents;
}

/**
 * Search intents across all files
 */
export async function searchIntents(query: string, limit: number): Promise<Array<Intent & { filePath: string }>> {
  const results: Array<Intent & { filePath: string }> = [];
  const lowerQuery = query.toLowerCase();
  
  function searchDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      return;
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        searchDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        const intentFile = readIntentFile(fullPath);
        
        // Extract original file path from intent file path
        const relativePath = path.relative(INTENTS_FOLDER, fullPath);
        const originalFilePath = relativePath.replace(/\.json$/, '');
        
        for (const intent of intentFile.intents) {
          if (intent.prompt.toLowerCase().includes(lowerQuery)) {
            results.push({
              ...intent,
              filePath: originalFilePath,
            });
            
            if (results.length >= limit) {
              return;
            }
          }
        }
      }
    }
  }
  
  searchDirectory(INTENTS_FOLDER);
  
  // Sort by timestamp (newest first)
  results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return results.slice(0, limit);
}

/**
 * Check if intents folder exists
 */
export function intentsExists(): boolean {
  return fs.existsSync(INTENTS_FOLDER);
}

/**
 * Create intents folder if it doesn't exist
 */
export function createIntentsFolder(): void {
  if (!intentsExists()) {
    fs.mkdirSync(INTENTS_FOLDER, { recursive: true });
    console.error(`Created ${INTENTS_FOLDER} folder`);
  }
}
