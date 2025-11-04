/**
 * Tests for conflict detection functionality
 */

import { detectConflicts } from './conflict-detection';
import { Intent } from '../types';

describe('Conflict Detection', () => {
  const baseIntent: Intent = {
    id: 'base-id',
    timestamp: new Date().toISOString(),
    user: 'test-user',
    prompt: 'Initial implementation',
    model: 'claude-3.5',
    overrides: [],
  };

  describe('detectConflicts', () => {
    it('should detect no conflicts when no intents exist', () => {
      const result = detectConflicts('Add new feature', []);
      
      expect(result.hasConflicts).toBe(false);
      expect(result.conflictType).toBe('none');
      expect(result.severity).toBe('none');
    });

    it('should detect no conflicts when intents are old', () => {
      const oldIntent: Intent = {
        ...baseIntent,
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      };
      
      const result = detectConflicts('Add new feature', [oldIntent], 7);
      
      expect(result.hasConflicts).toBe(false);
      expect(result.conflictType).toBe('none');
    });

    it('should detect recent conflicts', () => {
      const recentIntent: Intent = {
        ...baseIntent,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      };
      
      const result = detectConflicts('Update the same feature', [recentIntent], 7);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflictType).toBe('recent');
      expect(result.severity).toBe('low');
    });

    it('should detect semantic conflicts for opposite actions', () => {
      const addIntent: Intent = {
        ...baseIntent,
        prompt: 'Add authentication to the API endpoint',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      const result = detectConflicts('Remove authentication from the API', [addIntent]);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflictType).toBe('semantic');
      expect(result.conflictingIntents).toContain(addIntent);
    });

    it('should detect high severity for very recent conflicts', () => {
      const veryRecentIntent: Intent = {
        ...baseIntent,
        prompt: 'Implement caching system',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      };
      
      const result = detectConflicts('Remove caching system', [veryRecentIntent]);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.severity).toBe('high');
    });

    it('should detect medium severity for multiple user conflicts', () => {
      const intent1: Intent = {
        ...baseIntent,
        id: 'intent1',
        user: 'user1',
        prompt: 'Add error handling',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      const intent2: Intent = {
        ...baseIntent,
        id: 'intent2',
        user: 'user2',
        prompt: 'Add logging system',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      const result = detectConflicts('Refactor error handling and logging', [intent1, intent2]);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.severity).toBe('medium');
    });

    it('should detect conflicts for enable/disable patterns', () => {
      const enableIntent: Intent = {
        ...baseIntent,
        prompt: 'Enable debug mode for production',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      const result = detectConflicts('Disable debug mode in production', [enableIntent]);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflictType).toBe('semantic');
    });

    it('should detect conflicts for sync/async patterns', () => {
      const syncIntent: Intent = {
        ...baseIntent,
        prompt: 'Make database calls synchronous for simplicity',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      const result = detectConflicts('Convert to async/await for better performance', [syncIntent]);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflictType).toBe('semantic');
    });

    it('should detect conflicts based on keyword overlap', () => {
      const existingIntent: Intent = {
        ...baseIntent,
        prompt: 'Implement user authentication with JWT tokens',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      const result = detectConflicts('Refactor user authentication to use OAuth', [existingIntent]);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflictingIntents).toContain(existingIntent);
    });

    it('should provide appropriate recommendations', () => {
      const intents: Intent[] = [
        {
          ...baseIntent,
          id: 'intent1',
          prompt: 'Add feature A',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        },
        {
          ...baseIntent,
          id: 'intent2',
          prompt: 'Add feature B',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
          ...baseIntent,
          id: 'intent3',
          prompt: 'Add feature C',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        },
      ];
      
      const result = detectConflicts('Remove features A, B, and C', intents);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.recommendation).toContain('HIGH CONFLICT');
    });
  });
});
