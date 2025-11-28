/**
 * ELO Rating System Calculator
 * Used for calculating player ratings after matches
 */

export interface RatingChange {
  newRating: number;
  ratingChange: number;
}

export interface MatchResult {
  player1Rating: number;
  player2Rating: number;
  player1Won: boolean;
  kFactor?: number;
}

/**
 * Calculate expected score for a player
 * @param playerRating - Player's current rating
 * @param opponentRating - Opponent's current rating
 * @returns Expected score (0-1)
 */
export function calculateExpectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * Calculate rating change for both players after a match
 * @param result - Match result with ratings and outcome
 * @returns Rating changes for both players
 */
export function calculateRatingChanges(result: MatchResult): {
  player1: RatingChange;
  player2: RatingChange;
} {
  const K = result.kFactor || 32; // K-factor determines max rating change

  // Expected scores
  const expectedPlayer1 = calculateExpectedScore(result.player1Rating, result.player2Rating);
  const expectedPlayer2 = 1 - expectedPlayer1;

  // Actual scores (1 for win, 0 for loss)
  const actualPlayer1 = result.player1Won ? 1 : 0;
  const actualPlayer2 = result.player1Won ? 0 : 1;

  // Rating changes
  const player1Change = Math.round(K * (actualPlayer1 - expectedPlayer1));
  const player2Change = Math.round(K * (actualPlayer2 - expectedPlayer2));

  return {
    player1: {
      newRating: result.player1Rating + player1Change,
      ratingChange: player1Change
    },
    player2: {
      newRating: result.player2Rating + player2Change,
      ratingChange: player2Change
    }
  };
}

/**
 * Get K-factor based on player's rating
 * Higher rated players have lower K-factor (more stable ratings)
 * @param rating - Player's current rating
 * @returns K-factor to use
 */
export function getKFactor(rating: number): number {
  if (rating < 1200) return 40; // Beginners
  if (rating < 1800) return 32; // Intermediate
  if (rating < 2200) return 24; // Advanced
  return 16; // Expert
}
