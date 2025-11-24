import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Gavel, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import type { Match, User } from "@shared/schema";

interface MatchWithPlayers extends Match {
  player1?: User;
  player2?: User;
  player1Partner?: User;
  player2Partner?: User;
  tournament?: {
    name: string;
    type: string;
  };
}

export default function ArbitroDashboard() {
  const { data: matches = [], isLoading } = useQuery<MatchWithPlayers[]>({
    queryKey: ["/api/matches/arbitro"],
  });

  const pendingMatches = matches.filter((m) => m.status === "pending");
  const completedMatches = matches.filter((m) => m.status === "completed");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Cargando partidos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Title */}
      <div className="pb-4 border-b-[3px] border-blue-600">
        <h1 
          className="text-4xl font-bold text-[#1e3a8a] mb-2" 
          data-testid="text-page-title"
        >
          Panel de Árbitro
        </h1>
        <p className="text-gray-600">
          Gestiona tus partidos asignados
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white p-6 rounded-xl text-center"
          data-testid="stat-pending"
        >
          <div className="text-5xl font-bold mb-2">{pendingMatches.length}</div>
          <div className="text-sm opacity-90">Partidos Pendientes</div>
        </div>
        
        <div 
          className="bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white p-6 rounded-xl text-center"
          data-testid="stat-completed"
        >
          <div className="text-5xl font-bold mb-2">{completedMatches.length}</div>
          <div className="text-sm opacity-90">Partidos Completados</div>
        </div>

        <div 
          className="bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white p-6 rounded-xl text-center"
          data-testid="stat-total"
        >
          <div className="text-5xl font-bold mb-2">{matches.length}</div>
          <div className="text-sm opacity-90">Total Asignados</div>
        </div>
      </div>

      {/* Pending Matches Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Gavel className="h-6 w-6 text-[#1e3a8a]" />
          <h2 className="text-2xl font-bold text-[#1e3a8a]">Partidos Pendientes</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Ingresa los resultados de los partidos asignados
        </p>

        {pendingMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl font-medium text-gray-700">No hay partidos pendientes</p>
            <p className="text-sm text-gray-500 mt-2">
              Los partidos aparecerán cuando sean asignados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingMatches.map((match) => (
              <div
                key={match.id}
                data-testid={`card-match-${match.id}`}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#3b82f6] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Status Badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-[#dbeafe] text-[#1e40af] rounded-full text-sm font-semibold">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Pendiente
                  </span>
                </div>

                {/* Match Title */}
                <h3 className="text-lg font-bold text-[#1e3a8a] mb-2">
                  Mesa #{match.matchNumber}
                </h3>

                {/* Tournament */}
                <p className="text-sm text-gray-600 mb-3">
                  {match.tournament?.name || "Sin torneo"}
                </p>

                {/* Players */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">
                      {match.player1?.name || "Jugador 1"}
                    </span>
                  </div>
                  <div className="text-center text-gray-400 font-bold">VS</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">
                      {match.player2?.name || "Jugador 2"}
                    </span>
                  </div>
                </div>

                {/* Round */}
                <div className="mb-4">
                  <span className="inline-block px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-medium text-gray-700">
                    Round {match.roundNumber}
                  </span>
                </div>

                {/* Action Button */}
                <Button
                  asChild
                  className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  data-testid={`button-score-match-${match.id}`}
                >
                  <Link href={`/arbitro/match/${match.id}`} className="flex items-center justify-center gap-2">
                    Ingresar Resultado
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Matches Section */}
      {completedMatches.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="h-6 w-6 text-[#1e3a8a]" />
            <h2 className="text-2xl font-bold text-[#1e3a8a]">Partidos Completados</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Historial de partidos que has arbitrado
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedMatches.map((match) => (
              <div
                key={match.id}
                data-testid={`card-completed-${match.id}`}
                className="bg-white border-2 border-gray-200 rounded-xl p-6"
              >
                {/* Status Badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                    Completado
                  </span>
                </div>

                {/* Match Title */}
                <h3 className="text-lg font-bold text-[#1e3a8a] mb-2">
                  Mesa #{match.matchNumber}
                </h3>

                {/* Tournament */}
                <p className="text-sm text-gray-600 mb-3">
                  {match.tournament?.name || "Sin torneo"}
                </p>

                {/* Players with Score */}
                <div className="space-y-2 mb-4">
                  <div 
                    className={`flex items-center justify-between text-sm p-2 rounded ${
                      match.winnerId === match.player1Id ? 'bg-green-50 font-bold' : ''
                    }`}
                  >
                    <span className="text-gray-900">
                      {match.player1?.name || "Jugador 1"}
                    </span>
                    <span className="font-bold text-gray-900">
                      {match.player1Score || 0}
                    </span>
                  </div>
                  <div 
                    className={`flex items-center justify-between text-sm p-2 rounded ${
                      match.winnerId === match.player2Id ? 'bg-green-50 font-bold' : ''
                    }`}
                  >
                    <span className="text-gray-900">
                      {match.player2?.name || "Jugador 2"}
                    </span>
                    <span className="font-bold text-gray-900">
                      {match.player2Score || 0}
                    </span>
                  </div>
                </div>

                {/* Winner Badge */}
                {match.winnerId && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      Ganador: {match.winnerId === match.player1Id ? match.player1?.name : match.player2?.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
