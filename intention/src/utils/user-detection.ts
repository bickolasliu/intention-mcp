/**
 * User detection utilities - identifies user from git config or environment
 */

import { execSync } from 'child_process';
import * as os from 'os';

let cachedUser: string | null = null;

/**
 * Get user information from various sources
 */
export async function getUserInfo(): Promise<string> {
  // Return cached user if available
  if (cachedUser) {
    return cachedUser;
  }
  
  // Try environment variables first
  const envUser = process.env.INTENTION_USER || 
                  process.env.GIT_AUTHOR_NAME ||
                  process.env.GIT_COMMITTER_NAME ||
                  process.env.USER ||
                  process.env.USERNAME;
  
  if (envUser) {
    cachedUser = envUser;
    return envUser;
  }
  
  // Try git config
  try {
    const gitUser = execSync('git config user.name', { encoding: 'utf8' }).trim();
    if (gitUser) {
      cachedUser = gitUser;
      return gitUser;
    }
  } catch (error) {
    // Git command failed, continue to next method
  }
  
  // Try git email as fallback
  try {
    const gitEmail = execSync('git config user.email', { encoding: 'utf8' }).trim();
    if (gitEmail) {
      cachedUser = gitEmail;
      return gitEmail;
    }
  } catch (error) {
    // Git command failed, continue to next method
  }
  
  // Fall back to system username
  const systemUser = os.userInfo().username;
  cachedUser = systemUser;
  return systemUser;
}

/**
 * Get the AI model being used (if detectable)
 */
export function getModelInfo(): string {
  // Check for model information in environment
  return process.env.ANTHROPIC_MODEL || 
         process.env.OPENAI_MODEL ||
         process.env.AI_MODEL ||
         'unknown';
}

/**
 * Clear cached user information (useful for testing)
 */
export function clearUserCache(): void {
  cachedUser = null;
}
