/**
 * Sistema de Rating Oficial FPTM
 * Basado en diferencia de rating entre jugadores
 */

interface RatingTable {
  minDiff: number;
  maxDiff: number;
  favoriteWins: number;    // Puntos si gana el favorito
  underdogWins: number;     // Puntos si gana el no favorito
}

// Tabla oficial FPTM
const RATING_TABLE: RatingTable[] = [
  { minDiff: 0,   maxDiff: 24,   favoriteWins: 8,  underdogWins: 8 },
  { minDiff: 25,  maxDiff: 49,   favoriteWins: 7,  underdogWins: 10 },
  { minDiff: 50,  maxDiff: 99,   favoriteWins: 5,  underdogWins: 12 },
  { minDiff: 100, maxDiff: 149,  favoriteWins: 3,  underdogWins: 15 },
  { minDiff: 150, maxDiff: 199,  favoriteWins: 2,  underdogWins: 20 },
  { minDiff: 200, maxDiff: 249,  favoriteWins: 1,  underdogWins: 26 },
  { minDiff: 250, maxDiff: 9999, favoriteWins: 0,  underdogWins: 32 }
];

interface Player {
  id: string;
  name: string;
  rating: number;
}

interface MatchResult {
  sets: Array<{ player1: number; player2: number }>;
  winner: string;
}

export interface RatingChange {
  player1: {
    id: string;
    name: string;
    oldRating: number;
    change: number;
    newRating: number;
    isFavorite: boolean;
  };
  player2: {
    id: string;
    name: string;
    oldRating: number;
    change: number;
    newRating: number;
    isFavorite: boolean;
  };
  ratingDifference: number;
  appliedRow: RatingTable;
}

export function calculateRatingChange(
  player1: Player,
  player2: Player,
  result: MatchResult
): RatingChange {
  // Determinar quién es el favorito (mayor rating)
  const isFavorite1 = player1.rating >= player2.rating;
  const favorite = isFavorite1 ? player1 : player2;
  const underdog = isFavorite1 ? player2 : player1;
  
  // Calcular diferencia absoluta
  const ratingDiff = Math.abs(player1.rating - player2.rating);
  
  // Buscar en la tabla
  const tableRow = RATING_TABLE.find(
    row => ratingDiff >= row.minDiff && ratingDiff <= row.maxDiff
  ) || RATING_TABLE[RATING_TABLE.length - 1];
  
  // Determinar ganador
  const favoriteWon = result.winner === favorite.id;
  
  // Calcular puntos base
  let favoriteChange: number;
  let underdogChange: number;
  
  if (favoriteWon) {
    favoriteChange = tableRow.favoriteWins;
    underdogChange = -tableRow.favoriteWins;
  } else {
    favoriteChange = -tableRow.underdogWins;
    underdogChange = tableRow.underdogWins;
  }
  
  // BONUS POR SETS
  const setsWon = {
    player1: 0,
    player2: 0
  };
  
  result.sets.forEach(set => {
    if (set.player1 > set.player2) setsWon.player1++;
    else setsWon.player2++;
  });
  
  // Bonus si ganó 3-0 o 3-1
  const winner = result.winner;
  const winnerSets = winner === player1.id ? setsWon.player1 : setsWon.player2;
  const loserSets = winner === player1.id ? setsWon.player2 : setsWon.player1;
  
  let setBonus = 0;
  if (winnerSets === 3 && loserSets === 0) {
    setBonus = 2; // +2 puntos por victoria 3-0
  } else if (winnerSets === 3 && loserSets === 1) {
    setBonus = 1; // +1 punto por victoria 3-1
  }
  
  // Aplicar bonus al ganador
  if (result.winner === favorite.id) {
    favoriteChange += setBonus;
  } else {
    underdogChange += setBonus;
  }
  
  // Preparar resultado
  const player1Change = isFavorite1 ? favoriteChange : underdogChange;
  const player2Change = isFavorite1 ? underdogChange : favoriteChange;
  
  return {
    player1: {
      id: player1.id,
      name: player1.name,
      oldRating: player1.rating,
      change: player1Change,
      newRating: player1.rating + player1Change,
      isFavorite: isFavorite1
    },
    player2: {
      id: player2.id,
      name: player2.name,
      oldRating: player2.rating,
      change: player2Change,
      newRating: player2.rating + player2Change,
      isFavorite: !isFavorite1
    },
    ratingDifference: ratingDiff,
    appliedRow: tableRow
  };
}

// Función helper para formatear el cambio de rating
export function formatRatingChange(change: number): string {
  if (change > 0) return `+${change}`;
  return change.toString();
}

// Función helper para obtener color según cambio
export function getRatingChangeColor(change: number): string {
  if (change > 0) return 'text-green-600 dark:text-green-400';
  if (change < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
}
