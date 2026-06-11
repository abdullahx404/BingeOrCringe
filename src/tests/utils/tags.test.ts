import { describe, it, expect } from 'vitest';
import { TAGS, isValidTag, isValidTagArray, sanitizeTags } from '@/lib/utils/tags';

describe('Tags Constants', () => {
  it('should export exactly 53 tags', () => {
    expect(TAGS).toHaveLength(53);
  });

  it('should contain all expected tags', () => {
    const expectedTags = [
      'Binge But Cringe',
      'Emotional Damage',
      'Brainrot',
      'Delulu',
      'Aura Farm',
      'Negative Aura',
      'Underrated',
      'Overrated AF',
      'Peak Fiction',
      'SUS',
      'Solo Watch Only',
      'Low IQ',
      'Dramatic',
      'Dead-End',
      'Space Brainrot',
      'Time Travel Slop',
      'Alien Aura',
      'Dystopian Cooked',
      'Plot Holes in Orbit',
      'Multiverse Mid',
      'Jumpscare Only',
      'Trauma Fuel',
      'Nightmare Bait',
      'Demonic Rizz',
      'Cozy Horror',
      'Mid But Funny',
      'Cringe Comedy King',
      'Laugh or Cry',
      'Gen Z Humor Only',
      'Dad Joke Cinema',
      'Unhinged Comedy',
      'Oscar Bait',
      'Crying at 3AM',
      'Trauma Bond Movie',
      'Slow Burn Tears',
      'Family Trauma Core',
      'Based-Drama',
      'Character Development',
      'Tommy Shelby Aura',
      'Depressing',
      'Sci-Fi Horror Rizz',
      'Horror Comedy Gold',
      'Psychological Mindfuck',
      'Gore Maxxing',
      'Cannibal Core',
      'Wrong Turn Energy',
      'Anti-Hero',
      'Brutal AF',
      'Ultra Violence',
      'Bloodbath Cinema',
      'Violent AF',
      'Guts & Gore Only',
      'Brutality Peak',
    ];
    for (const tag of expectedTags) {
      expect(TAGS).toContain(tag);
    }
  });

  describe('isValidTag', () => {
    it('should return true for valid tags', () => {
      expect(isValidTag('Brainrot')).toBe(true);
      expect(isValidTag('Peak Fiction')).toBe(true);
      expect(isValidTag('SUS')).toBe(true);
      expect(isValidTag('Dead-End')).toBe(true);
    });

    it('should return false for invalid tags', () => {
      expect(isValidTag('random')).toBe(false);
      expect(isValidTag('brainrot')).toBe(false); // case-sensitive
      expect(isValidTag('')).toBe(false);
      expect(isValidTag('Custom Tag')).toBe(false);
    });
  });

  describe('isValidTagArray', () => {
    it('should return true for empty array', () => {
      expect(isValidTagArray([])).toBe(true);
    });

    it('should return true for valid array of tags', () => {
      expect(isValidTagArray(['Brainrot', 'Peak Fiction'])).toBe(true);
    });

    it('should return false if any tag is invalid', () => {
      expect(isValidTagArray(['Brainrot', 'invalid'])).toBe(false);
    });
  });

  describe('sanitizeTags', () => {
    it('should keep only valid tags', () => {
      const result = sanitizeTags(['Brainrot', 'invalid', 'Peak Fiction', 'unknown']);
      expect(result).toEqual(['Brainrot', 'Peak Fiction']);
    });

    it('should return empty array when no valid tags', () => {
      expect(sanitizeTags(['foo', 'bar'])).toEqual([]);
    });

    it('should return all tags when all are valid', () => {
      expect(sanitizeTags(['Brainrot', 'SUS'])).toEqual(['Brainrot', 'SUS']);
    });
  });
});
