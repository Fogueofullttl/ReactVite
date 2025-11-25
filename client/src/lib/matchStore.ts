import { mockMatches as initialMatches, Match, MatchStatus } from "@/data/mockMatches";

let matches = [...initialMatches];

export const matchStore = {
  getMatches: () => matches,
  
  getMatch: (id: string) => matches.find(m => m.id === id),
  
  updateMatch: (id: string, updates: Partial<Match>) => {
    const index = matches.findIndex(m => m.id === id);
    if (index !== -1) {
      matches[index] = { ...matches[index], ...updates };
      window.dispatchEvent(new CustomEvent("matches:updated"));
      return matches[index];
    }
    return null;
  },
  
  // Save result by referee (immediately verified)
  saveMatchResult: (
    matchId: string,
    sets: Array<{ player1: number; player2: number }>,
    winnerId: string,
    enteredBy: string,
    observations?: string
  ) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return null;
    
    const player1Wins = sets.filter(s => s.player1 > s.player2).length;
    const player2Wins = sets.filter(s => s.player1 < s.player2).length;
    
    const result = {
      sets,
      winner: winnerId,
      setsCount: { player1: player1Wins, player2: player2Wins },
      validatedBy: {
        [match.player1.id]: { validated: true, timestamp: new Date() },
        [match.player2.id]: { validated: true, timestamp: new Date() }
      },
      enteredBy,
      enteredAt: new Date(),
      observations
    };
    
    const updatedMatch = matchStore.updateMatch(matchId, {
      status: "verified" as const,
      result,
      verifiedBy: enteredBy,
      verifiedAt: new Date()
    });
    
    return updatedMatch;
  },

  // Save result by player (pending verification)
  savePlayerResult: (
    matchId: string,
    sets: Array<{ player1: number; player2: number }>,
    winnerId: string,
    enteredBy: string,
    observations?: string
  ) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return null;
    
    const player1Wins = sets.filter(s => s.player1 > s.player2).length;
    const player2Wins = sets.filter(s => s.player1 < s.player2).length;
    
    const result = {
      sets,
      winner: winnerId,
      setsCount: { player1: player1Wins, player2: player2Wins },
      validatedBy: {
        [match.player1.id]: { validated: true, timestamp: new Date() },
        [match.player2.id]: { validated: true, timestamp: new Date() }
      },
      enteredBy,
      enteredAt: new Date(),
      observations
    };
    
    const updatedMatch = matchStore.updateMatch(matchId, {
      status: "pending_verification" as const,
      result,
      waitingAdminApproval: true
    });
    
    return updatedMatch;
  },
  
  // Admin approves result
  approveResult: (matchId: string, adminId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || match.status !== "pending_verification") return null;
    
    const updatedMatch = matchStore.updateMatch(matchId, {
      status: "verified" as const,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      waitingAdminApproval: false
    });
    
    return updatedMatch;
  },
  
  // Admin rejects result
  rejectResult: (matchId: string, adminId: string, reason: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || match.status !== "pending_verification") return null;
    
    const updatedMatch = matchStore.updateMatch(matchId, {
      status: "rejected" as const,
      rejectedBy: adminId,
      rejectedAt: new Date(),
      rejectionReason: reason,
      result: undefined,
      waitingAdminApproval: false
    });
    
    return updatedMatch;
  },
  
  reset: () => {
    matches = [...initialMatches];
    window.dispatchEvent(new CustomEvent("matches:updated"));
  }
};
