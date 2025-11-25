export interface MatchPlayer {
  id: string;
  name: string;
  birthYear: number;
  rating: number;
  photoURL: string;
}

export interface MatchSet {
  player1: number;
  player2: number;
}

export interface MatchResult {
  sets: MatchSet[];
  winner: string;
  validatedBy: {
    [playerId: string]: {
      validated: boolean;
      timestamp: Date;
    };
  };
  enteredBy: string;
  enteredAt: Date;
}

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  stage: string;
  round: string;
  mesa: number;
  status: 'pending' | 'completed';
  referee: string;
  scheduledTime: Date;
  player1: MatchPlayer;
  player2: MatchPlayer;
  result?: MatchResult;
}

export const mockMatches: Match[] = [
  {
    id: "match-001",
    tournamentId: "torneo-001",
    tournamentName: "Campeonato Nacional 2025",
    stage: "groups",
    round: "groups",
    mesa: 1,
    status: "pending",
    referee: "arbitro-001",
    scheduledTime: new Date("2025-01-25T14:00:00"),
    player1: {
      id: "user1",
      name: "Carlos Rivera",
      birthYear: 1995,
      rating: 1850,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos"
    },
    player2: {
      id: "user2",
      name: "María González",
      birthYear: 1998,
      rating: 1720,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
    }
  },
  {
    id: "match-002",
    tournamentId: "torneo-001",
    tournamentName: "Campeonato Nacional 2025",
    stage: "groups",
    round: "groups",
    mesa: 2,
    status: "pending",
    referee: "arbitro-001",
    scheduledTime: new Date("2025-01-25T15:00:00"),
    player1: {
      id: "user3",
      name: "Luis Pérez",
      birthYear: 1992,
      rating: 1680,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luis"
    },
    player2: {
      id: "user4",
      name: "Ana Martínez",
      birthYear: 2000,
      rating: 1590,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
    }
  },
  {
    id: "match-003",
    tournamentId: "torneo-001",
    tournamentName: "Campeonato Nacional 2025",
    stage: "semifinals",
    round: "semifinals",
    mesa: 1,
    status: "completed",
    referee: "arbitro-001",
    scheduledTime: new Date("2025-01-25T13:00:00"),
    player1: {
      id: "user5",
      name: "Jorge Sánchez",
      birthYear: 1988,
      rating: 1920,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jorge"
    },
    player2: {
      id: "user1",
      name: "Carlos Rivera",
      birthYear: 1995,
      rating: 1850,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos"
    },
    result: {
      sets: [
        { player1: 11, player2: 7 },
        { player1: 9, player2: 11 },
        { player1: 11, player2: 8 },
        { player1: 11, player2: 9 }
      ],
      winner: "user5",
      validatedBy: {
        user5: { validated: true, timestamp: new Date() },
        user1: { validated: true, timestamp: new Date() }
      },
      enteredBy: "arbitro-001",
      enteredAt: new Date()
    }
  },
  {
    id: "match-004",
    tournamentId: "torneo-002",
    tournamentName: "Abierto de Puerto Rico 2025",
    stage: "final",
    round: "final",
    mesa: 1,
    status: "pending",
    referee: "arbitro-001",
    scheduledTime: new Date("2025-01-26T16:00:00"),
    player1: {
      id: "user5",
      name: "Jorge Sánchez",
      birthYear: 1988,
      rating: 1920,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jorge"
    },
    player2: {
      id: "user6",
      name: "Pedro Rodríguez",
      birthYear: 1990,
      rating: 1880,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro"
    }
  }
];
