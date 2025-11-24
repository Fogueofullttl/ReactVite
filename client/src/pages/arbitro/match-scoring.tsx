import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { BirthYearValidation } from "@/components/birth-year-validation";
import { CheckCircle2, Trophy, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Match, User } from "@shared/schema";

interface SetScore {
  player1: string;
  player2: string;
}

interface MatchWithPlayers extends Match {
  player1?: User;
  player2?: User;
  player1Partner?: User;
  player2Partner?: User;
  tournament?: {
    name: string;
    genderCategory: string;
  };
}

export default function MatchScoring() {
  const { matchId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [setScores, setSetScores] = useState<SetScore[]>([
    { player1: "", player2: "" },
    { player1: "", player2: "" },
    { player1: "", player2: "" },
    { player1: "", player2: "" },
    { player1: "", player2: "" },
  ]);
  const [observations, setObservations] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);

  const { data: match, isLoading } = useQuery<MatchWithPlayers>({
    queryKey: ["/api/matches", matchId],
  });

  const confirmResultMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/matches/${matchId}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✓ Resultado Confirmado",
        description: "El resultado ha sido guardado y los ratings actualizados.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rankings"] });
      setTimeout(() => setLocation("/arbitro"), 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el resultado",
        variant: "destructive",
      });
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const validateSet = (player1Score: number, player2Score: number): boolean => {
    if (isNaN(player1Score) || isNaN(player2Score)) return false;
    if (player1Score < 0 || player2Score < 0) return false;
    
    const maxScore = Math.max(player1Score, player2Score);
    const minScore = Math.min(player1Score, player2Score);
    const diff = maxScore - minScore;

    // Must reach at least 11 points
    if (maxScore < 11) return false;

    // Difference must be at least 2
    if (diff < 2) return false;

    // If score is 11, opponent must be <= 9
    // If score is > 11, difference must be exactly 2
    if (maxScore === 11 && minScore > 9) return false;
    if (maxScore > 11 && diff !== 2) return false;

    return true;
  };

  const getCompletedSets = () => {
    return setScores.filter((set) => {
      const p1 = parseInt(set.player1);
      const p2 = parseInt(set.player2);
      return validateSet(p1, p2);
    });
  };

  const getWinner = () => {
    const completedSets = getCompletedSets();
    if (completedSets.length < 3) return null;

    let player1Wins = 0;
    let player2Wins = 0;

    completedSets.forEach((set) => {
      const p1 = parseInt(set.player1);
      const p2 = parseInt(set.player2);
      if (p1 > p2) player1Wins++;
      else player2Wins++;
    });

    if (player1Wins >= 3) return "player1";
    if (player2Wins >= 3) return "player2";
    return null;
  };

  const isValidResult = () => {
    const completedSets = getCompletedSets();
    return completedSets.length >= 3 && getWinner() !== null;
  };

  const handleSetScoreChange = (setIndex: number, player: "player1" | "player2", value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 2);
    const newScores = [...setScores];
    newScores[setIndex][player] = sanitized;
    setSetScores(newScores);
  };

  const handleContinueToValidation = () => {
    if (!isValidResult()) {
      toast({
        title: "Resultado Inválido",
        description: "Debes completar al menos 3 sets válidos con un ganador claro.",
        variant: "destructive",
      });
      return;
    }
    setShowValidation(true);
  };

  const handleConfirmResult = () => {
    if (!match) return;

    const completedSets = getCompletedSets();
    const winner = getWinner();
    const winnerId = winner === "player1" ? match.player1Id : match.player2Id;

    const player1Wins = completedSets.filter((set) => parseInt(set.player1) > parseInt(set.player2)).length;
    const player2Wins = completedSets.filter((set) => parseInt(set.player1) < parseInt(set.player2)).length;

    confirmResultMutation.mutate({
      sets: completedSets.map((set) => ({
        player1Score: parseInt(set.player1),
        player2Score: parseInt(set.player2),
      })),
      winnerId,
      player1Score: player1Wins,
      player2Score: player2Wins,
      observations,
    });
  };

  const getValidationPlayers = (): Array<{
    id: string;
    name: string;
    birthYear: number;
    role: "player1" | "player2" | "player1Partner" | "player2Partner";
  }> => {
    if (!match || !match.player1 || !match.player2) return [];
    
    const players: Array<{
      id: string;
      name: string;
      birthYear: number;
      role: "player1" | "player2" | "player1Partner" | "player2Partner";
    }> = [
      {
        id: match.player1.id,
        name: match.player1.name,
        birthYear: match.player1.birthYear,
        role: "player1",
      },
      {
        id: match.player2.id,
        name: match.player2.name,
        birthYear: match.player2.birthYear,
        role: "player2",
      },
    ];

    // Add partners for doubles
    if (match.player1Partner) {
      players.push({
        id: match.player1Partner.id,
        name: match.player1Partner.name,
        birthYear: match.player1Partner.birthYear,
        role: "player1Partner",
      });
    }
    if (match.player2Partner) {
      players.push({
        id: match.player2Partner.id,
        name: match.player2Partner.name,
        birthYear: match.player2Partner.birthYear,
        role: "player2Partner",
      });
    }

    return players;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Cargando partido...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Partido no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedSets = getCompletedSets();
  const winner = getWinner();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Ingresar Resultado del Partido
        </h1>
        <p className="text-muted-foreground">
          Mesa #{match.matchNumber} - {match.tournament?.name || "Torneo"}
        </p>
      </div>

      {/* Match Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Información del Partido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Player 1 */}
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <Avatar className="h-16 w-16">
                <AvatarImage src={match.player1?.photoUrl || undefined} />
                <AvatarFallback>{getInitials(match.player1?.name || "P1")}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-lg">{match.player1?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-mono">
                    Rating: {match.player1?.rating}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {match.player1?.memberNumber}
                  </Badge>
                </div>
                {match.player1Partner && (
                  <p className="text-sm text-muted-foreground mt-1">
                    + {match.player1Partner.name}
                  </p>
                )}
              </div>
            </div>

            {/* Player 2 */}
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <Avatar className="h-16 w-16">
                <AvatarImage src={match.player2?.photoUrl || undefined} />
                <AvatarFallback>{getInitials(match.player2?.name || "P2")}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-lg">{match.player2?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-mono">
                    Rating: {match.player2?.rating}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {match.player2?.memberNumber}
                  </Badge>
                </div>
                {match.player2Partner && (
                  <p className="text-sm text-muted-foreground mt-1">
                    + {match.player2Partner.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Badge variant="outline">Mesa #{match.matchNumber}</Badge>
            <Badge variant="outline">Round {match.roundNumber}</Badge>
            <Badge variant="outline">{match.tournament?.genderCategory || "Mixto"}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Score Entry */}
      {!showValidation && (
        <Card>
          <CardHeader>
            <CardTitle>Entrada de Resultados</CardTitle>
            <CardDescription>
              Ingresa el resultado de cada set. Mínimo 11 puntos, diferencia mínima de 2.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {setScores.map((set, index) => {
              const p1 = parseInt(set.player1);
              const p2 = parseInt(set.player2);
              const isValid = validateSet(p1, p2);
              const isEmpty = set.player1 === "" && set.player2 === "";

              return (
                <div key={index} className="space-y-2">
                  <Label>Set {index + 1}</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={set.player1}
                        onChange={(e) => handleSetScoreChange(index, "player1", e.target.value)}
                        className={`text-center font-mono text-lg ${
                          !isEmpty && !isValid ? "border-red-500" : isValid ? "border-green-500" : ""
                        }`}
                        data-testid={`input-set${index + 1}-player1`}
                      />
                    </div>
                    <span className="text-2xl font-bold text-muted-foreground">-</span>
                    <div className="flex-1">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={set.player2}
                        onChange={(e) => handleSetScoreChange(index, "player2", e.target.value)}
                        className={`text-center font-mono text-lg ${
                          !isEmpty && !isValid ? "border-red-500" : isValid ? "border-green-500" : ""
                        }`}
                        data-testid={`input-set${index + 1}-player2`}
                      />
                    </div>
                    <div className="w-24 text-center">
                      {isValid && (
                        <Badge variant={p1 > p2 ? "default" : "secondary"} className="text-xs">
                          {p1 > p2 ? match.player1?.name.split(" ")[0] : match.player2?.name.split(" ")[0]}
                        </Badge>
                      )}
                      {!isEmpty && !isValid && (
                        <Badge variant="destructive" className="text-xs">
                          Inválido
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <Separator className="my-4" />

            {completedSets.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Resumen</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Sets Completados</p>
                    <p className="font-mono text-lg">{completedSets.length}</p>
                  </div>
                  {winner && (
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Ganador</p>
                      <p className="font-semibold text-lg text-green-600">
                        {winner === "player1" ? match.player1?.name : match.player2?.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones (Opcional)</Label>
              <Textarea
                id="observations"
                placeholder="Notas adicionales sobre el partido..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
                data-testid="input-observations"
              />
            </div>

            <Button
              onClick={handleContinueToValidation}
              disabled={!isValidResult()}
              className="w-full"
              size="lg"
              data-testid="button-continue-validation"
            >
              Continuar a Validación
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Birth Year Validation */}
      {showValidation && (
        <div className="space-y-6">
          <BirthYearValidation
            players={getValidationPlayers()}
            onAllValidated={() => setValidationComplete(true)}
          />

          {validationComplete && (
            <Card className="border-green-500">
              <CardContent className="pt-6">
                <Button
                  onClick={handleConfirmResult}
                  disabled={confirmResultMutation.isPending}
                  className="w-full"
                  size="lg"
                  data-testid="button-confirm-result"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  {confirmResultMutation.isPending ? "Guardando..." : "✓ Confirmar y Guardar Resultado"}
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Los ratings se actualizarán automáticamente
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
