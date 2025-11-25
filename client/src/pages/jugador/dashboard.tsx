import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, CheckCircle2, Trophy, AlertCircle } from "lucide-react";
import { subscribeToMatches } from "@/lib/firestoreMatchStore";
import type { Match } from "@/data/mockMatches";

export default function JugadorDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    // Suscripción en tiempo real a partidos del jugador
    const unsubscribe = subscribeToMatches(
      (data) => {
        setMatches(data);
        setLoading(false);
      },
      { playerId: user.id }
    );
    
    return () => unsubscribe();
  }, [user?.id]);

  // Filter matches where user is a player
  const userMatches = matches;

  const pendingMatches = userMatches.filter(m => m.status === 'pending_result');
  const awaitingVerification = userMatches.filter(m => m.status === 'pending_verification');
  const verifiedMatches = userMatches.filter(m => m.status === 'verified');
  const rejectedMatches = userMatches.filter(m => m.status === 'rejected');

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const MatchCard = ({ match }: { match: typeof matches[0] }) => {
    const isPlayer1 = match.player1.id === user?.id;
    const myPlayer = isPlayer1 ? match.player1 : match.player2;
    const opponent = isPlayer1 ? match.player2 : match.player1;

    return (
      <Card className="hover-elevate" data-testid={`match-card-${match.id}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{match.tournamentName}</h3>
              <p className="text-sm text-muted-foreground">
                {match.stage === 'final' ? 'Final' : match.stage === 'semifinals' ? 'Semifinal' : 'Fase de Grupos'} • Mesa {match.mesa}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(match.scheduledTime)}
              </p>
            </div>
            {match.status === 'pending_result' && (
              <Badge variant="default" className="bg-blue-600">
                <Clock className="h-3 w-3 mr-1" />
                Pendiente
              </Badge>
            )}
            {match.status === 'pending_verification' && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <Clock className="h-3 w-3 mr-1" />
                En Verificación
              </Badge>
            )}
            {match.status === 'verified' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verificado
              </Badge>
            )}
            {match.status === 'rejected' && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Rechazado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* My Player */}
            <div className="text-center">
              <Avatar className="w-12 h-12 mx-auto mb-2">
                <AvatarImage src={myPlayer.photoURL} />
                <AvatarFallback className="text-sm">{getInitials(myPlayer.name)}</AvatarFallback>
              </Avatar>
              <div className="font-semibold text-sm">{myPlayer.name}</div>
              <div className="text-xs text-muted-foreground font-mono">
                {myPlayer.rating}
              </div>
            </div>

            {/* Result or VS */}
            <div className="text-center">
              {match.result ? (
                <div>
                  <div className="text-2xl font-bold font-mono">
                    {match.result.setsCount?.player1 || 0} - {match.result.setsCount?.player2 || 0}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {match.result.sets.map(s => `${s.player1}-${s.player2}`).join(', ')}
                  </div>
                  {match.result.winner && (
                    <Badge variant={match.result.winner === myPlayer.id ? "default" : "secondary"} className="mt-2 text-xs">
                      {match.result.winner === myPlayer.id ? "Ganaste" : "Perdiste"}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-bold text-muted-foreground">VS</div>
              )}
            </div>

            {/* Opponent */}
            <div className="text-center">
              <Avatar className="w-12 h-12 mx-auto mb-2">
                <AvatarImage src={opponent.photoURL} />
                <AvatarFallback className="text-sm">{getInitials(opponent.name)}</AvatarFallback>
              </Avatar>
              <div className="font-semibold text-sm">{opponent.name}</div>
              <div className="text-xs text-muted-foreground font-mono">
                {opponent.rating}
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          {match.status === 'rejected' && match.rejectionReason && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                Razón del Rechazo:
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {match.rejectionReason}
              </p>
            </div>
          )}

          {/* Observations */}
          {match.result?.observations && match.status !== 'rejected' && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-xs font-semibold mb-1">Observaciones:</p>
              <p className="text-xs text-muted-foreground">{match.result.observations}</p>
            </div>
          )}

          {/* Action Button */}
          {match.status === 'pending_result' && (
            <Button
              className="w-full mt-4"
              onClick={() => setLocation(`/jugador/match/${match.id}`)}
              data-testid={`button-enter-result-${match.id}`}
            >
              Ingresar Resultado
            </Button>
          )}
          {match.status === 'rejected' && (
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => setLocation(`/jugador/match/${match.id}`)}
            >
              Volver a Ingresar Resultado
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Mis Partidos</h1>
        <p className="text-muted-foreground">
          Gestiona tus partidos y reporta resultados
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{pendingMatches.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Verificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{awaitingVerification.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{verifiedMatches.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Partidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{userMatches.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pendientes ({pendingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="verification">
            En Verificación ({awaitingVerification.length})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verificados ({verifiedMatches.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rechazados ({rejectedMatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingMatches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay partidos pendientes</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Todos tus partidos tienen resultados ingresados
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingMatches.map(match => <MatchCard key={match.id} match={match} />)
          )}
        </TabsContent>

        <TabsContent value="verification" className="space-y-4 mt-6">
          {awaitingVerification.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay partidos en verificación</p>
              </CardContent>
            </Card>
          ) : (
            awaitingVerification.map(match => <MatchCard key={match.id} match={match} />)
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4 mt-6">
          {verifiedMatches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay partidos verificados</p>
              </CardContent>
            </Card>
          ) : (
            verifiedMatches.map(match => <MatchCard key={match.id} match={match} />)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {rejectedMatches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay partidos rechazados</p>
              </CardContent>
            </Card>
          ) : (
            rejectedMatches.map(match => <MatchCard key={match.id} match={match} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
