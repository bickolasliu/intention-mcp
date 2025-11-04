/**
 * Intent analysis utilities for understanding code evolution
 */

import { Intent } from '../types.js';

interface IntentAnalysis {
  summary: string;
  themes: string[];
  timeline: TimelineEntry[];
  contributors: ContributorInfo[];
  recommendations: string[];
}

interface TimelineEntry {
  date: string;
  prompt: string;
  user: string;
}

interface ContributorInfo {
  user: string;
  contributionCount: number;
  lastContribution: string;
}

/**
 * Analyze intent history to provide insights
 */
export function analyzeIntentHistory(intents: Intent[]): IntentAnalysis {
  if (intents.length === 0) {
    return {
      summary: 'No intents found for analysis.',
      themes: [],
      timeline: [],
      contributors: [],
      recommendations: [],
    };
  }
  
  // Extract themes from prompts
  const themes = extractThemes(intents);
  
  // Create timeline
  const timeline = createTimeline(intents);
  
  // Analyze contributors
  const contributors = analyzeContributors(intents);
  
  // Generate summary
  const summary = generateSummary(intents, themes, contributors);
  
  // Generate recommendations
  const recommendations = generateRecommendations(intents, themes);
  
  return {
    summary,
    themes,
    timeline,
    contributors,
    recommendations,
  };
}

/**
 * Extract common themes from intent prompts
 */
function extractThemes(intents: Intent[]): string[] {
  const keywords = new Map<string, number>();
  
  // Common programming themes to look for
  const themePatterns = [
    { pattern: /bug\s*fix|fix|repair|patch/i, theme: 'Bug Fixes' },
    { pattern: /feature|implement|add|create/i, theme: 'Feature Development' },
    { pattern: /refactor|reorganize|restructure/i, theme: 'Refactoring' },
    { pattern: /test|testing|spec/i, theme: 'Testing' },
    { pattern: /document|docs|readme/i, theme: 'Documentation' },
    { pattern: /security|auth|permission/i, theme: 'Security' },
    { pattern: /performance|optimize|speed/i, theme: 'Performance' },
    { pattern: /ui|ux|interface|style/i, theme: 'UI/UX' },
    { pattern: /api|endpoint|route/i, theme: 'API Development' },
    { pattern: /database|query|migration/i, theme: 'Database' },
  ];
  
  for (const intent of intents) {
    for (const { pattern, theme } of themePatterns) {
      if (pattern.test(intent.prompt)) {
        keywords.set(theme, (keywords.get(theme) || 0) + 1);
      }
    }
  }
  
  // Sort themes by frequency and return top themes
  return Array.from(keywords.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);
}

/**
 * Create a timeline of significant changes
 */
function createTimeline(intents: Intent[]): TimelineEntry[] {
  // Sort by timestamp (newest first) and take most recent entries
  return intents
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
    .map(intent => ({
      date: new Date(intent.timestamp).toLocaleDateString(),
      prompt: intent.prompt.length > 100 
        ? intent.prompt.substring(0, 100) + '...' 
        : intent.prompt,
      user: intent.user,
    }));
}

/**
 * Analyze contributor patterns
 */
function analyzeContributors(intents: Intent[]): ContributorInfo[] {
  const contributorMap = new Map<string, { count: number; lastDate: Date }>();
  
  for (const intent of intents) {
    const user = intent.user;
    const date = new Date(intent.timestamp);
    
    if (contributorMap.has(user)) {
      const info = contributorMap.get(user)!;
      info.count++;
      if (date > info.lastDate) {
        info.lastDate = date;
      }
    } else {
      contributorMap.set(user, { count: 1, lastDate: date });
    }
  }
  
  return Array.from(contributorMap.entries())
    .map(([user, info]) => ({
      user,
      contributionCount: info.count,
      lastContribution: info.lastDate.toLocaleDateString(),
    }))
    .sort((a, b) => b.contributionCount - a.contributionCount);
}

/**
 * Generate a summary of the file's evolution
 */
function generateSummary(intents: Intent[], themes: string[], contributors: ContributorInfo[]): string {
  const totalChanges = intents.length;
  const dateRange = getDateRange(intents);
  const primaryThemes = themes.slice(0, 3).join(', ');
  const topContributor = contributors[0]?.user || 'Unknown';
  
  let summary = `This file has undergone ${totalChanges} tracked change${totalChanges === 1 ? '' : 's'}`;
  
  if (dateRange) {
    summary += ` from ${dateRange.start} to ${dateRange.end}`;
  }
  
  if (primaryThemes) {
    summary += `. The primary focus areas have been: ${primaryThemes}`;
  }
  
  if (contributors.length > 0) {
    summary += `. The main contributor is ${topContributor} with ${contributors[0].contributionCount} change${contributors[0].contributionCount === 1 ? '' : 's'}`;
  }
  
  summary += '.';
  
  return summary;
}

/**
 * Generate recommendations based on intent history
 */
function generateRecommendations(intents: Intent[], themes: string[]): string[] {
  const recommendations: string[] = [];
  
  // Check for recent activity
  const recentIntents = intents.filter(intent => {
    const daysSince = (Date.now() - new Date(intent.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 30;
  });
  
  if (recentIntents.length > 10) {
    recommendations.push('This file has high recent activity. Consider reviewing for stability before major changes.');
  }
  
  // Check for testing
  if (!themes.includes('Testing')) {
    recommendations.push('No testing-related intents found. Consider adding tests for this file.');
  }
  
  // Check for documentation
  if (!themes.includes('Documentation') && intents.length > 5) {
    recommendations.push('Multiple changes without documentation updates. Consider updating relevant docs.');
  }
  
  // Check for multiple contributors
  const uniqueContributors = new Set(intents.map(i => i.user)).size;
  if (uniqueContributors > 3) {
    recommendations.push('Multiple contributors have worked on this file. Ensure consistent coding style.');
  }
  
  return recommendations;
}

/**
 * Get date range of intents
 */
function getDateRange(intents: Intent[]): { start: string; end: string } | null {
  if (intents.length === 0) {
    return null;
  }
  
  const dates = intents.map(i => new Date(i.timestamp));
  const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
  const latest = new Date(Math.max(...dates.map(d => d.getTime())));
  
  return {
    start: earliest.toLocaleDateString(),
    end: latest.toLocaleDateString(),
  };
}
