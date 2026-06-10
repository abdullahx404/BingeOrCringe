import { describe, it, expect } from 'vitest';
import {
  TIERS,
  TIER_CONFIG,
  isValidTier,
  getTierConfig,
} from '@/lib/utils/tiers';

describe('Tiers Constants', () => {
  it('should export exactly 5 tiers', () => {
    expect(TIERS).toHaveLength(5);
  });

  it('should contain all expected tier values', () => {
    expect(TIERS).toContain('goated');
    expect(TIERS).toContain('binge');
    expect(TIERS).toContain('mid');
    expect(TIERS).toContain('cringe');
    expect(TIERS).toContain('trash');
  });

  it('should have config for every tier', () => {
    for (const tier of TIERS) {
      expect(TIER_CONFIG[tier]).toBeDefined();
      expect(TIER_CONFIG[tier].label).toBeTruthy();
      expect(TIER_CONFIG[tier].emoji).toBeTruthy();
      expect(TIER_CONFIG[tier].color).toMatch(/^#/);
      expect(TIER_CONFIG[tier].bgColor).toBeTruthy();
      expect(TIER_CONFIG[tier].description).toBeTruthy();
    }
  });

  describe('isValidTier', () => {
    it('should return true for valid tiers', () => {
      expect(isValidTier('goated')).toBe(true);
      expect(isValidTier('binge')).toBe(true);
      expect(isValidTier('mid')).toBe(true);
      expect(isValidTier('cringe')).toBe(true);
      expect(isValidTier('trash')).toBe(true);
    });

    it('should return false for invalid tier values', () => {
      expect(isValidTier('amazing')).toBe(false);
      expect(isValidTier('ok')).toBe(false);
      expect(isValidTier('Goated')).toBe(false); // case-sensitive
      expect(isValidTier('')).toBe(false);
      expect(isValidTier('GOATED')).toBe(false);
    });
  });

  describe('getTierConfig', () => {
    it('should return the correct config for goated', () => {
      const cfg = getTierConfig('goated');
      expect(cfg.label).toBe('Goated');
      expect(cfg.emoji).toBe('🐐');
      expect(cfg.color).toBe('#FFD700');
    });

    it('should return the correct config for trash', () => {
      const cfg = getTierConfig('trash');
      expect(cfg.label).toBe('Trash');
      expect(cfg.emoji).toBe('🗑️');
      expect(cfg.color).toBe('#EF4444');
    });
  });
});
