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
  setsCount?: {
    player1: number;
    player2: number;
  };
  validatedBy: {
    [playerId: string]: {
      validated: boolean;
      timestamp: Date;
    };
  };
  enteredBy: string;
  enteredAt: Date;
  observations?: string;
}

export type MatchStatus = 
  | 'scheduled'              // Programado, sin resultado
  | 'pending_result'         // Esperando que jugadores ingresen resultado
  | 'pending_verification'   // Resultado ingresado, esperando admin
  | 'verified'               // Resultado verificado por admin
  | 'disputed'               // Jugadores no están de acuerdo
  | 'rejected';              // Admin rechazó el resultado

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  stage: string;
  round: string;
  mesa: number;
  status: MatchStatus;
  referee?: string;
  scheduledTime: Date;
  player1: MatchPlayer;
  player2: MatchPlayer;
  result?: MatchResult;
  waitingAdminApproval?: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export const mockMatches: Match[] = [
  // Partido pendiente de resultado (asignado a arbitro-001)
  {
    id: "match-001",
    tournamentId: "torneo-001",
    tournamentName: "Campeonato Nacional 2025",
    stage: "groups",
    round: "groups",
    mesa: 1,
    status: "pending_result",
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
  
  // Partido pendiente de resultado (jugador user1 participa)
  {
    id: "match-002",
    tournamentId: "torneo-001",
    tournamentName: "Campeonato Nacional 2025",
    stage: "groups",
    round: "groups",
    mesa: 2,
    status: "pending_result",
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
  
  // Partido verificado (completado por árbitro)
  {
    id: "match-003",
    tournamentId: "torneo-001",
    tournamentName: "Campeonato Nacional 2025",
    stage: "semifinals",
    round: "semifinals",
    mesa: 1,
    status: "verified",
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
      setsCount: { player1: 3, player2: 1 },
      validatedBy: {
        user5: { validated: true, timestamp: new Date("2025-01-25T13:45:00") },
        user1: { validated: true, timestamp: new Date("2025-01-25T13:46:00") }
      },
      enteredBy: "arbitro-001",
      enteredAt: new Date("2025-01-25T13:50:00")
    },
    verifiedBy: "admin-001",
    verifiedAt: new Date("2025-01-25T14:00:00")
  },
  
  // Partido pendiente de verificación (reportado por jugadores)
  {
    id: "match-004",
    tournamentId: "torneo-001",
    tournamentName: "Campeonato Nacional 2025",
    stage: "quarterfinals",
    round: "quarterfinals",
    mesa: 3,
    status: "pending_verification",
    referee: "arbitro-002",
    scheduledTime: new Date("2025-01-25T16:00:00"),
    player1: {
      id: "user1",
      name: "Carlos Rivera",
      birthYear: 1995,
      rating: 1850,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos"
    },
    player2: {
      id: "user3",
      name: "Luis Pérez",
      birthYear: 1992,
      rating: 1680,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luis"
    },
    result: {
      sets: [
        { player1: 11, player2: 8 },
        { player1: 11, player2: 9 },
        { player1: 9, player2: 11 },
        { player1: 11, player2: 7 }
      ],
      winner: "user1",
      setsCount: { player1: 3, player2: 1 },
      validatedBy: {
        user1: { validated: true, timestamp: new Date("2025-01-25T16:40:00") },
        user3: { validated: true, timestamp: new Date("2025-01-25T16:41:00") }
      },
      enteredBy: "user1",
      enteredAt: new Date("2025-01-25T16:42:00"),
      observations: "Partido muy reñido, gran nivel de ambos jugadores"
    },
    waitingAdminApproval: true
  },
  
  // Otro partido pendiente de verificación
  {
    id: "match-005",
    tournamentId: "torneo-002",
    tournamentName: "Abierto de Puerto Rico 2025",
    stage: "groups",
    round: "groups",
    mesa: 4,
    status: "pending_verification",
    referee: "arbitro-001",
    scheduledTime: new Date("2025-01-25T17:00:00"),
    player1: {
      id: "user2",
      name: "María González",
      birthYear: 1998,
      rating: 1720,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
    },
    player2: {
      id: "user4",
      name: "Ana Martínez",
      birthYear: 2000,
      rating: 1590,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
    },
    result: {
      sets: [
        { player1: 11, player2: 9 },
        { player1: 8, player2: 11 },
        { player1: 11, player2: 6 },
        { player1: 11, player2: 9 }
      ],
      winner: "user2",
      setsCount: { player1: 3, player2: 1 },
      validatedBy: {
        user2: { validated: true, timestamp: new Date("2025-01-25T17:35:00") },
        user4: { validated: true, timestamp: new Date("2025-01-25T17:36:00") }
      },
      enteredBy: "user2",
      enteredAt: new Date("2025-01-25T17:37:00"),
      observations: "Excelente partido"
    },
    waitingAdminApproval: true
  },
  
  // Partido final pendiente
  {
    id: "match-006",
    tournamentId: "torneo-002",
    tournamentName: "Abierto de Puerto Rico 2025",
    stage: "final",
    round: "final",
    mesa: 1,
    status: "pending_result",
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
  },

  // Partido rechazado
  {
    id: "match-007",
    tournamentId: "torneo-001",
    tournamentName: "Campeonato Nacional 2025",
    stage: "groups",
    round: "groups",
    mesa: 5,
    status: "rejected",
    referee: "arbitro-001",
    scheduledTime: new Date("2025-01-25T10:00:00"),
    player1: {
      id: "user3",
      name: "Luis Pérez",
      birthYear: 1992,
      rating: 1680,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luis"
    },
    player2: {
      id: "user6",
      name: "Pedro Rodríguez",
      birthYear: 1990,
      rating: 1880,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro"
    },
    rejectedBy: "admin-001",
    rejectedAt: new Date("2025-01-25T11:00:00"),
    rejectionReason: "El resultado no coincide con la planilla física. Por favor, verificar y volver a ingresar."
  }
];
