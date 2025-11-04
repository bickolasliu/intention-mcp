/**
 * Formatting utilities for displaying intents
 */

import { Intent } from '../types.js';

/**
 * Format an intent for display
 */
export function formatIntentForDisplay(intent: Intent): any {
  const date = new Date(intent.timestamp);
  const relativeTime = getRelativeTime(date);
  
  return {
    id: intent.id,
    timestamp: intent.timestamp,
    relativeTime,
    user: intent.user,
    prompt: intent.prompt,
    model: intent.model,
    overrides: intent.overrides,
  };
}

/**
 * Format an intent with file path for search results
 */
export function formatIntentWithFileForDisplay(intent: Intent & { filePath: string }): any {
  const formatted = formatIntentForDisplay(intent);
  return {
    ...formatted,
    filePath: intent.filePath,
  };
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
 * Format a list of intents for conflict display
 */
export function formatConflictDisplay(intents: Intent[]): string {
  const lines: string[] = [];
  
  lines.push('Recent intents for this file:');
  lines.push('');
  
  intents.forEach((intent, index) => {
    const formatted = formatIntentForDisplay(intent);
    lines.push(`${index + 1}. ${formatted.relativeTime} by ${formatted.user}`);
    lines.push(`   ${formatted.prompt}`);
    lines.push('');
  });
  
  return lines.join('\n');
}
