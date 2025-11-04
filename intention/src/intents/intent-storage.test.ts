/**
 * Tests for intent storage functionality
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  saveIntent, 
  getIntentHistory, 
  searchIntents,
  createIntentsFolder,
  intentsExists 
} from './intent-storage';
import { Intent } from '../types';

// Mock filesystem
jest.mock('fs');

describe('Intent Storage', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock implementations
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockImplementation(() => undefined);
    mockFs.writeFileSync.mockImplementation(() => undefined);
    mockFs.readFileSync.mockReturnValue('{"intents": []}');
  });

  describe('createIntentsFolder', () => {
    it('should create .intents folder if it does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      createIntentsFolder();
      
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('.intents', { recursive: true });
    });

    it('should not create folder if it already exists', () => {
      mockFs.existsSync.mockReturnValue(true);
      
      createIntentsFolder();
      
      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('saveIntent', () => {
    it('should save a new intent to the correct file', async () => {
      const testFilePath = 'src/test.js';
      const intentData = {
        prompt: 'Add error handling',
        user: 'test-user',
        overrides: [],
        model: 'claude-3.5',
      };
      
      mockFs.existsSync.mockReturnValue(false);
      
      const result = await saveIntent(testFilePath, intentData);
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('timestamp');
      expect(result.prompt).toBe(intentData.prompt);
      expect(result.user).toBe(intentData.user);
      expect(result.model).toBe(intentData.model);
      
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '.intents/src/test.js.json',
        expect.stringContaining(intentData.prompt),
        'utf8'
      );
    });

    it('should append to existing intents', async () => {
      const testFilePath = 'src/test.js';
      const existingIntent: Intent = {
        id: 'existing-id',
        timestamp: '2024-01-01T00:00:00.000Z',
        user: 'other-user',
        prompt: 'Initial implementation',
        model: 'claude-3.5',
        overrides: [],
      };
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ intents: [existingIntent] }));
      
      const intentData = {
        prompt: 'Add validation',
        user: 'test-user',
        overrides: ['existing-id'],
      };
      
      await saveIntent(testFilePath, intentData);
      
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '.intents/src/test.js.json',
        expect.stringContaining('Add validation'),
        'utf8'
      );
      
      const writtenContent = mockFs.writeFileSync.mock.calls[0][1] as string;
      const parsedContent = JSON.parse(writtenContent);
      expect(parsedContent.intents).toHaveLength(2);
    });
  });

  describe('getIntentHistory', () => {
    it('should return empty array for non-existent file', async () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const result = await getIntentHistory('src/test.js');
      
      expect(result).toEqual([]);
    });

    it('should return intents from existing file', async () => {
      const intents: Intent[] = [
        {
          id: 'intent1',
          timestamp: '2024-01-01T00:00:00.000Z',
          user: 'user1',
          prompt: 'First change',
          model: 'claude-3.5',
          overrides: [],
        },
        {
          id: 'intent2',
          timestamp: '2024-01-02T00:00:00.000Z',
          user: 'user2',
          prompt: 'Second change',
          model: 'claude-3.5',
          overrides: [],
        },
      ];
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ intents }));
      
      const result = await getIntentHistory('src/test.js');
      
      expect(result).toEqual(intents);
    });
  });

  describe('searchIntents', () => {
    it('should find intents matching query', async () => {
      const mockIntent: Intent & { filePath: string } = {
        id: 'intent1',
        timestamp: '2024-01-01T00:00:00.000Z',
        user: 'user1',
        prompt: 'Add authentication to login page',
        model: 'claude-3.5',
        overrides: [],
        filePath: 'src/auth.js',
      };
      
      // Mock directory reading
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([
        { name: 'auth.js.json', isFile: () => true, isDirectory: () => false } as any,
      ]);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        intents: [mockIntent],
      }));
      
      const results = await searchIntents('authentication', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].prompt).toContain('authentication');
    });

    it('should return empty array when no matches found', async () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const results = await searchIntents('nonexistent', 10);
      
      expect(results).toEqual([]);
    });
  });
});
