import { mockMatches as initialMatches } from "@/data/mockMatches";

export type Match = typeof initialMatches[0];

let matches = [...initialMatches];

export const matchStore = {
  getMatches: () => matches,
  
  getMatch: (id: string) => matches.find(m => m.id === id),
  
  updateMatch: (id: string, updates: Partial<Match>) => {
    const index = matches.findIndex(m => m.id === id);
    if (index !== -1) {
      matches[index] = { ...matches[index], ...updates };
      return matches[index];
    }
    return null;
  },
  
  saveMatchResult: (
    matchId: string,
    sets: Array<{ player1: number; player2: number }>,
    winnerId: string,
    enteredBy: string,
    observations?: string
  ) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return null;
    
    const result = {
      sets,
      winner: winnerId,
      validatedBy: {
        [match.player1.id]: { validated: true, timestamp: new Date() },
        [match.player2.id]: { validated: true, timestamp: new Date() }
      },
      enteredBy,
      enteredAt: new Date(),
      observations
    };
    
    const updatedMatch = matchStore.updateMatch(matchId, {
      status: "completed" as const,
      result
    });
    
    return updatedMatch;
  },
  
  reset: () => {
    matches = [...initialMatches];
  }
};
