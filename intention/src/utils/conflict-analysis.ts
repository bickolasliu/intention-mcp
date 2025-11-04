/**
 * Conflict analysis utilities for LLM-based conflict detection
 */

import { Intent } from '../types.js';

export interface ConflictAnalysisRequest {
  currentPrompt: string;
  recentIntents: IntentSummary[];
  analysisPrompt: string;
  requiresLLMAnalysis: boolean;
}

export interface IntentSummary {
  id: string;
  timestamp: string;
  user: string;
  prompt: string;
  timeAgo: string;
  isRecent: boolean;
}

/**
 * Prepare conflict analysis request for LLM
 */
export function prepareConflictAnalysis(
  newPrompt: string,
  existingIntents: Intent[],
  windowDays: number = 7
): ConflictAnalysisRequest {
  if (existingIntents.length === 0) {
    return {
      currentPrompt: newPrompt,
      recentIntents: [],
      analysisPrompt: 'No previous intents found. This is the first tracked change to this file.',
      requiresLLMAnalysis: false,
    };
  }

  // Filter and prepare recent intents
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  const recentIntents = existingIntents
    .filter(intent => {
      const intentTime = new Date(intent.timestamp).getTime();
      return (now - intentTime) < windowMs;
    })
    .map(intent => summarizeIntent(intent))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (recentIntents.length === 0) {
    return {
      currentPrompt: newPrompt,
      recentIntents: [],
      analysisPrompt: `No recent changes in the last ${windowDays} days. Safe to proceed.`,
      requiresLLMAnalysis: false,
    };
  }

  // Prepare analysis prompt for LLM
  const analysisPrompt = createAnalysisPrompt(newPrompt, recentIntents);

  return {
    currentPrompt: newPrompt,
    recentIntents,
    analysisPrompt,
    requiresLLMAnalysis: true,
  };
}

/**
 * Summarize an intent for analysis
 */
function summarizeIntent(intent: Intent): IntentSummary {
  const date = new Date(intent.timestamp);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const hoursSince = diffMs / (1000 * 60 * 60);
  
  return {
    id: intent.id,
    timestamp: intent.timestamp,
    user: intent.user,
    prompt: intent.prompt,
    timeAgo: getRelativeTime(date),
    isRecent: hoursSince < 24,
  };
}

/**
 * Create an analysis prompt for the LLM
 */
function createAnalysisPrompt(newPrompt: string, recentIntents: IntentSummary[]): string {
  const lines: string[] = [];
  
  lines.push('CONFLICT ANALYSIS REQUEST');
  lines.push('========================');
  lines.push('');
  lines.push('Please analyze if the following new change conflicts with recent intents:');
  lines.push('');
  lines.push('NEW CHANGE INTENT:');
  lines.push(`"${newPrompt}"`);
  lines.push('');
  lines.push('RECENT INTENTS ON THIS FILE:');
  lines.push('');
  
  recentIntents.forEach((intent, index) => {
    lines.push(`${index + 1}. ${intent.timeAgo} by ${intent.user}:`);
    lines.push(`   "${intent.prompt}"`);
    if (intent.isRecent) {
      lines.push(`   ⚠️ Very recent change (less than 24 hours ago)`);
    }
    lines.push('');
  });
  
  lines.push('ANALYSIS REQUIRED:');
  lines.push('1. Do these intents conflict with each other?');
  lines.push('2. Would the new change undo or contradict recent work?');
  lines.push('3. Are multiple people working on related features that might conflict?');
  lines.push('4. Severity: HIGH (stop and coordinate), MEDIUM (review carefully), LOW (proceed with caution), NONE (safe)');
  lines.push('');
  lines.push('Please determine if there is a conflict and explain your reasoning.');
  
  return lines.join('\n');
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (seconds < 60) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (weeks < 4) {
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  } else {
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }
}

/**
 * Format the conflict analysis for display to the LLM
 */
export function formatConflictAnalysisForLLM(analysis: ConflictAnalysisRequest): string {
  if (!analysis.requiresLLMAnalysis) {
    return analysis.analysisPrompt;
  }
  
  return analysis.analysisPrompt;
}

/**
 * Create a system prompt for the LLM to analyze conflicts
 */
export function createConflictAnalysisSystemPrompt(): string {
  return `You are analyzing potential conflicts in code changes. When presented with a new intent and recent intents on the same file:

1. Identify if the changes are contradictory (e.g., one adds authentication, another removes it)
2. Check if changes affect the same functionality in incompatible ways
3. Consider if multiple developers are working on overlapping features
4. Assess the risk level:
   - HIGH: Direct contradiction or will break recent work
   - MEDIUM: Overlapping changes that need coordination
   - LOW: Related but compatible changes
   - NONE: No conflict detected

Provide a clear, concise assessment and recommendation.`;
}
