/**
 * Sistema de Rating Oficial FPTM
 * Basado en tabla de diferencias oficial de la Federación Puertorriqueña de Tenis de Mesa
 * Tabla de 13 niveles que determina los puntos ganados/perdidos según la diferencia de rating
 */

interface RatingTable {
  minDiff: number;
  maxDiff: number | null;  // null significa sin límite superior
  favoriteWins: number;    // Puntos si gana el favorito
  underdogWins: number;    // Puntos si gana el no favorito (underdog)
}

// Tabla oficial FPTM de 13 niveles
const RATING_TABLE: RatingTable[] = [
  { minDiff: 0,   maxDiff: 12,   favoriteWins: 8,  underdogWins: 8 },
  { minDiff: 13,  maxDiff: 24,   favoriteWins: 7,  underdogWins: 10 },
  { minDiff: 25,  maxDiff: 37,   favoriteWins: 6,  underdogWins: 10 },
  { minDiff: 38,  maxDiff: 49,   favoriteWins: 5,  underdogWins: 10 },
  { minDiff: 50,  maxDiff: 99,   favoriteWins: 5,  underdogWins: 12 },
  { minDiff: 100, maxDiff: 149,  favoriteWins: 3,  underdogWins: 15 },
  { minDiff: 150, maxDiff: 199,  favoriteWins: 2,  underdogWins: 16 },
  { minDiff: 200, maxDiff: 249,  favoriteWins: 2,  underdogWins: 20 },
  { minDiff: 250, maxDiff: 299,  favoriteWins: 2,  underdogWins: 25 },
  { minDiff: 300, maxDiff: 350,  favoriteWins: 1,  underdogWins: 30 },
  { minDiff: 351, maxDiff: 400,  favoriteWins: 1,  underdogWins: 35 },
  { minDiff: 401, maxDiff: 450,  favoriteWins: 1,  underdogWins: 40 },
  { minDiff: 451, maxDiff: null, favoriteWins: 1,  underdogWins: 50 }
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

/**
 * Calcula el cambio de rating basado SOLO en la tabla FPTM oficial.
 * SIN BONUS - Solo puntos base según diferencia de rating.
 */
export function calculateRatingChange(
  player1: Player,
  player2: Player,
  result: MatchResult
): RatingChange {
  // Determinar quién es el favorito (mayor o igual rating)
  const isFavorite1 = player1.rating >= player2.rating;
  const favorite = isFavorite1 ? player1 : player2;
  const underdog = isFavorite1 ? player2 : player1;
  
  // Calcular diferencia absoluta
  const ratingDiff = Math.abs(player1.rating - player2.rating);
  
  // Buscar en la tabla (13 niveles)
  const tableRow = RATING_TABLE.find(
    row => ratingDiff >= row.minDiff && (row.maxDiff === null || ratingDiff <= row.maxDiff)
  ) || RATING_TABLE[RATING_TABLE.length - 1];
  
  const favoriteWon = result.winner === favorite.id;
  
  // Calcular cambios SOLO con puntos base de la tabla - SIN BONUS
  let favoriteChange: number;
  let underdogChange: number;
  
  if (favoriteWon) {
    favoriteChange = tableRow.favoriteWins;
    underdogChange = -tableRow.favoriteWins;
  } else {
    // Underdog gana (upset)
    favoriteChange = -tableRow.underdogWins;
    underdogChange = tableRow.underdogWins;
  }
  
  // Asignar cambios según quién es favorito
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
