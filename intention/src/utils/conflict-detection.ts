/**
 * Conflict detection utilities
 */

import { Intent } from '../types.js';

export interface ConflictInfo {
  hasConflicts: boolean;
  conflictingIntents: Intent[];
  conflictType: 'recent' | 'semantic' | 'none';
  severity: 'high' | 'medium' | 'low' | 'none';
  recommendation: string;
}

/**
 * Detect conflicts in intent history
 */
export function detectConflicts(
  newPrompt: string,
  existingIntents: Intent[],
  windowDays: number = 7
): ConflictInfo {
  if (existingIntents.length === 0) {
    return {
      hasConflicts: false,
      conflictingIntents: [],
      conflictType: 'none',
      severity: 'none',
      recommendation: 'No previous intents found. Safe to proceed.',
    };
  }

  // Filter recent intents
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  const recentIntents = existingIntents.filter(intent => {
    const intentTime = new Date(intent.timestamp).getTime();
    return (now - intentTime) < windowMs;
  });

  if (recentIntents.length === 0) {
    return {
      hasConflicts: false,
      conflictingIntents: [],
      conflictType: 'none',
      severity: 'none',
      recommendation: 'No recent intents. Safe to proceed.',
    };
  }

  // Check for semantic conflicts
  const semanticConflicts = checkSemanticConflicts(newPrompt, recentIntents);
  
  if (semanticConflicts.length > 0) {
    const severity = determineSeverity(semanticConflicts, recentIntents);
    return {
      hasConflicts: true,
      conflictingIntents: semanticConflicts,
      conflictType: 'semantic',
      severity,
      recommendation: getRecommendation(severity, semanticConflicts),
    };
  }

  // If there are recent intents but no semantic conflicts
  if (recentIntents.length > 0) {
    return {
      hasConflicts: true,
      conflictingIntents: recentIntents,
      conflictType: 'recent',
      severity: 'low',
      recommendation: 'Recent changes detected. Review before proceeding.',
    };
  }

  return {
    hasConflicts: false,
    conflictingIntents: [],
    conflictType: 'none',
    severity: 'none',
    recommendation: 'No conflicts detected. Safe to proceed.',
  };
}

/**
 * Check for semantic conflicts between new prompt and existing intents
 */
function checkSemanticConflicts(newPrompt: string, intents: Intent[]): Intent[] {
  const conflicts: Intent[] = [];
  const newPromptLower = newPrompt.toLowerCase();

  // Keywords that suggest conflicting changes
  const conflictPatterns = [
    // Opposite actions
    { add: /add|create|implement|include/i, remove: /remove|delete|exclude|drop/i },
    { enable: /enable|activate|turn on/i, disable: /disable|deactivate|turn off/i },
    { increase: /increase|expand|grow/i, decrease: /decrease|reduce|shrink/i },
    { public: /public|expose|open/i, private: /private|hide|restrict/i },
    // Architectural conflicts
    { sync: /synchronous|sync/i, async: /asynchronous|async|promise|await/i },
    { mutable: /mutable|var|let/i, immutable: /immutable|const|readonly/i },
  ];

  for (const intent of intents) {
    const intentPromptLower = intent.prompt.toLowerCase();
    
    // Check for direct contradiction patterns
    for (const pattern of conflictPatterns) {
      const newMatchesFirst = pattern.add && pattern.add.test(newPromptLower) || 
                             pattern.enable && pattern.enable.test(newPromptLower);
      const newMatchesSecond = pattern.remove && pattern.remove.test(newPromptLower) ||
                              pattern.disable && pattern.disable.test(newPromptLower);
      
      const intentMatchesFirst = pattern.add && pattern.add.test(intentPromptLower) ||
                                pattern.enable && pattern.enable.test(intentPromptLower);
      const intentMatchesSecond = pattern.remove && pattern.remove.test(intentPromptLower) ||
                                 pattern.disable && pattern.disable.test(intentPromptLower);
      
      // If they match opposite patterns, it's a conflict
      if ((newMatchesFirst && intentMatchesSecond) || (newMatchesSecond && intentMatchesFirst)) {
        conflicts.push(intent);
        break;
      }
    }
    
    // Check for same area modifications (potential conflict)
    const commonKeywords = extractKeywords(newPromptLower);
    const intentKeywords = extractKeywords(intentPromptLower);
    
    const overlap = commonKeywords.filter(keyword => intentKeywords.includes(keyword));
    if (overlap.length >= 2) {
      conflicts.push(intent);
    }
  }

  return conflicts;
}

/**
 * Extract significant keywords from a prompt
 */
function extractKeywords(prompt: string): string[] {
  // Remove common words and extract significant terms
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from']);
  
  return prompt
    .split(/\s+/)
    .map(word => word.replace(/[^a-z0-9]/gi, '').toLowerCase())
    .filter(word => word.length > 3 && !stopWords.has(word));
}

/**
 * Determine severity of conflicts
 */
function determineSeverity(conflicts: Intent[], _recentIntents: Intent[]): 'high' | 'medium' | 'low' {
  // High severity if multiple recent conflicts
  if (conflicts.length > 2) {
    return 'high';
  }
  
  // High severity if conflict is very recent (< 1 day)
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const veryRecentConflicts = conflicts.filter(intent => 
    new Date(intent.timestamp).getTime() > oneDayAgo
  );
  
  if (veryRecentConflicts.length > 0) {
    return 'high';
  }
  
  // Medium severity if multiple people involved
  const uniqueUsers = new Set(conflicts.map(c => c.user));
  if (uniqueUsers.size > 1) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Get recommendation based on conflict severity
 */
function getRecommendation(severity: 'high' | 'medium' | 'low' | 'none', conflicts: Intent[]): string {
  switch (severity) {
    case 'high':
      return `⚠️ HIGH CONFLICT: Found ${conflicts.length} conflicting intent(s). Strongly recommend reviewing with team before proceeding.`;
    case 'medium':
      return `⚡ MEDIUM CONFLICT: Multiple contributors have conflicting intents. Please review and consider coordinating changes.`;
    case 'low':
      return `ℹ️ LOW CONFLICT: Potential overlap with previous changes. Review intent history before proceeding.`;
    default:
      return 'No significant conflicts detected.';
  }
}
