import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gavel, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import type { Match, User } from "@shared/schema";

interface MatchWithPlayers extends Match {
  player1?: User;
  player2?: User;
  player1Partner?: User;
  player2Partner?: User;
  tournament?: {
    name: string;
  };
}

export default function ArbitroDashboard() {
  const { data: matches = [], isLoading } = useQuery<MatchWithPlayers[]>({
    queryKey: ["/api/matches/arbitro"],
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case "in_progress":
        return <Badge variant="default"><Gavel className="h-3 w-3 mr-1" />En Progreso</Badge>;
      case "completed":
        return <Badge variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" />Completado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Panel de Árbitro</h1>
        <p className="text-muted-foreground">
          Gestiona tus partidos asignados
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Partidos Pendientes</CardDescription>
            <CardTitle className="text-3xl">{pendingMatches.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Partidos Completados</CardDescription>
            <CardTitle className="text-3xl">{completedMatches.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Asignados</CardDescription>
            <CardTitle className="text-3xl">{matches.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Pending Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Partidos Pendientes
          </CardTitle>
          <CardDescription>
            Ingresa los resultados de los partidos asignados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No hay partidos pendientes</p>
              <p className="text-sm text-muted-foreground">
                Los partidos aparecerán cuando sean asignados
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Jugadores</TableHead>
                  <TableHead>Torneo</TableHead>
                  <TableHead>Round</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingMatches.map((match) => (
                  <TableRow key={match.id} data-testid={`row-match-${match.id}`}>
                    <TableCell className="font-mono font-medium">
                      #{match.matchNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={match.player1?.photoUrl || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(match.player1?.name || "P1")}
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={match.player2?.photoUrl || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(match.player2?.name || "P2")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {match.player1?.name} vs {match.player2?.name}
                          </p>
                          {(match.player1Partner || match.player2Partner) && (
                            <p className="text-xs text-muted-foreground">Dobles</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {match.tournament?.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{match.roundNumber}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(match.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        asChild
                        size="sm"
                        data-testid={`button-score-match-${match.id}`}
                      >
                        <Link href={`/arbitro/match/${match.id}`}>
                          Ingresar Resultado
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Completed Matches */}
      {completedMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Partidos Completados
            </CardTitle>
            <CardDescription>
              Historial de partidos que has arbitrado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Jugadores</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Ganador</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-mono font-medium">
                      #{match.matchNumber}
                    </TableCell>
                    <TableCell className="text-sm">
                      {match.player1?.name} vs {match.player2?.name}
                    </TableCell>
                    <TableCell className="font-mono">
                      {match.player1Score} - {match.player2Score}
                    </TableCell>
                    <TableCell>
                      {match.winnerId === match.player1Id ? match.player1?.name : match.player2?.name}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(match.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
