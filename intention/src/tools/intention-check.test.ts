/**
 * Tests for intention_check tool
 */

import { handleIntentionCheck } from './intention-check';
import * as intentStorage from '../intents/intent-storage';
import * as conflictDetection from '../utils/conflict-detection';
import { Intent } from '../types';

jest.mock('../intents/intent-storage');
jest.mock('../utils/conflict-detection');

describe('Intention Check Tool', () => {
  const mockGetIntentHistory = intentStorage.getIntentHistory as jest.MockedFunction<typeof intentStorage.getIntentHistory>;
  const mockDetectConflicts = conflictDetection.detectConflicts as jest.MockedFunction<typeof conflictDetection.detectConflicts>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleIntentionCheck', () => {
    it('should return no conflicts for files with no history', async () => {
      mockGetIntentHistory.mockResolvedValue([]);
      
      const result = await handleIntentionCheck({ filePath: 'src/test.js' });
      
      expect(result.hasConflicts).toBe(false);
      expect(result.message).toContain('No previous intents');
      expect(result.safe).toBe(true);
    });

    it('should detect recent conflicts without prompt', async () => {
      const recentIntent: Intent = {
        id: 'recent-id',
        timestamp: new Date().toISOString(),
        user: 'test-user',
        prompt: 'Recent change',
        model: 'claude-3.5',
        overrides: [],
      };
      
      mockGetIntentHistory.mockResolvedValue([recentIntent]);
      
      const result = await handleIntentionCheck({ filePath: 'src/test.js' });
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflictType).toBe('recent');
      expect(result.severity).toBe('low');
      expect(result.safe).toBe(true);
    });

    it('should perform semantic conflict detection with prompt', async () => {
      const existingIntent: Intent = {
        id: 'existing-id',
        timestamp: new Date().toISOString(),
        user: 'other-user',
        prompt: 'Add authentication',
        model: 'claude-3.5',
        overrides: [],
      };
      
      mockGetIntentHistory.mockResolvedValue([existingIntent]);
      mockDetectConflicts.mockReturnValue({
        hasConflicts: true,
        conflictingIntents: [existingIntent],
        conflictType: 'semantic',
        severity: 'high',
        recommendation: 'HIGH CONFLICT: Review before proceeding',
      });
      
      const result = await handleIntentionCheck({ 
        filePath: 'src/test.js',
        prompt: 'Remove authentication'
      });
      
      expect(mockDetectConflicts).toHaveBeenCalledWith('Remove authentication', [existingIntent], 7);
      expect(result.hasConflicts).toBe(true);
      expect(result.conflictType).toBe('semantic');
      expect(result.severity).toBe('high');
      expect(result.safe).toBe(false);
    });

    it('should return safe for low severity conflicts', async () => {
      const oldIntent: Intent = {
        id: 'old-id',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        user: 'test-user',
        prompt: 'Old change',
        model: 'claude-3.5',
        overrides: [],
      };
      
      mockGetIntentHistory.mockResolvedValue([oldIntent]);
      
      const result = await handleIntentionCheck({ filePath: 'src/test.js' });
      
      expect(result.hasConflicts).toBe(false);
      expect(result.safe).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      mockGetIntentHistory.mockRejectedValue(new Error('File system error'));
      
      const result = await handleIntentionCheck({ filePath: 'src/test.js' });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('File system error');
    });

    it('should include conflict display for recent intents', async () => {
      const intents: Intent[] = [
        {
          id: 'intent1',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          user: 'user1',
          prompt: 'First change',
          model: 'claude-3.5',
          overrides: [],
        },
        {
          id: 'intent2',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          user: 'user2',
          prompt: 'Second change',
          model: 'claude-3.5',
          overrides: [],
        },
      ];
      
      mockGetIntentHistory.mockResolvedValue(intents);
      
      const result = await handleIntentionCheck({ filePath: 'src/test.js' });
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflictDisplay).toBeDefined();
      expect(result.recentIntents).toHaveLength(2);
      expect(result.totalIntents).toBe(2);
    });
  });
});
