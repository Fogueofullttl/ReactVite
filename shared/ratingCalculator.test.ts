import { describe, it, expect } from 'vitest';
import {
  calculateExpectedScore,
  calculateRatingChanges,
  getKFactor,
  type MatchResult
} from './ratingCalculator';

describe('Rating Calculator', () => {
  describe('calculateExpectedScore', () => {
    it('should return 0.5 for equally rated players', () => {
      const expected = calculateExpectedScore(1500, 1500);
      expect(expected).toBeCloseTo(0.5, 2);
    });

    it('should favor higher rated player', () => {
      const expected = calculateExpectedScore(1600, 1400);
      expect(expected).toBeGreaterThan(0.5);
      expect(expected).toBeLessThan(1);
    });

    it('should disfavor lower rated player', () => {
      const expected = calculateExpectedScore(1400, 1600);
      expect(expected).toBeLessThan(0.5);
      expect(expected).toBeGreaterThan(0);
    });

    it('should be symmetric', () => {
      const player1Expected = calculateExpectedScore(1500, 1600);
      const player2Expected = calculateExpectedScore(1600, 1500);
      expect(player1Expected + player2Expected).toBeCloseTo(1, 5);
    });
  });

  describe('calculateRatingChanges', () => {
    it('should increase winner rating and decrease loser rating', () => {
      const result: MatchResult = {
        player1Rating: 1500,
        player2Rating: 1500,
        player1Won: true,
        kFactor: 32
      };

      const changes = calculateRatingChanges(result);

      expect(changes.player1.ratingChange).toBeGreaterThan(0);
      expect(changes.player2.ratingChange).toBeLessThan(0);
      expect(changes.player1.newRating).toBe(1500 + changes.player1.ratingChange);
      expect(changes.player2.newRating).toBe(1500 + changes.player2.ratingChange);
    });

    it('should give bigger rating gain for upset victory', () => {
      const normalWin: MatchResult = {
        player1Rating: 1600,
        player2Rating: 1400,
        player1Won: true,
        kFactor: 32
      };

      const upsetWin: MatchResult = {
        player1Rating: 1400,
        player2Rating: 1600,
        player1Won: true,
        kFactor: 32
      };

      const normalChanges = calculateRatingChanges(normalWin);
      const upsetChanges = calculateRatingChanges(upsetWin);

      // Underdog winning should gain more points
      expect(upsetChanges.player1.ratingChange).toBeGreaterThan(normalChanges.player1.ratingChange);
    });

    it('should conserve total rating points (zero-sum)', () => {
      const result: MatchResult = {
        player1Rating: 1500,
        player2Rating: 1600,
        player1Won: true,
        kFactor: 32
      };

      const changes = calculateRatingChanges(result);

      // Total rating change should be close to 0 (within rounding)
      expect(Math.abs(changes.player1.ratingChange + changes.player2.ratingChange)).toBeLessThanOrEqual(1);
    });

    it('should use default K-factor of 32 if not specified', () => {
      const result: MatchResult = {
        player1Rating: 1500,
        player2Rating: 1500,
        player1Won: true
      };

      const changes = calculateRatingChanges(result);

      // With equal ratings and K=32, winner gains 16 points
      expect(changes.player1.ratingChange).toBe(16);
      expect(changes.player2.ratingChange).toBe(-16);
    });
  });

  describe('getKFactor', () => {
    it('should return 40 for beginners (< 1200)', () => {
      expect(getKFactor(1000)).toBe(40);
      expect(getKFactor(1199)).toBe(40);
    });

    it('should return 32 for intermediate (1200-1799)', () => {
      expect(getKFactor(1200)).toBe(32);
      expect(getKFactor(1500)).toBe(32);
      expect(getKFactor(1799)).toBe(32);
    });

    it('should return 24 for advanced (1800-2199)', () => {
      expect(getKFactor(1800)).toBe(24);
      expect(getKFactor(2000)).toBe(24);
      expect(getKFactor(2199)).toBe(24);
    });

    it('should return 16 for expert (>= 2200)', () => {
      expect(getKFactor(2200)).toBe(16);
      expect(getKFactor(2500)).toBe(16);
      expect(getKFactor(3000)).toBe(16);
    });
  });
});
