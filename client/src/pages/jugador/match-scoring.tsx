import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BirthYearValidation } from "@/components/birth-year-validation";
import { CheckCircle2, Trophy, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getMatch, savePlayerResult } from "@/lib/firestoreMatchStore";
import type { Match } from "@/data/mockMatches";

interface SetScore {
  player1: string;
  player2: string;
}

export default function JugadorMatchScoring() {
  const { matchId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

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
  const [isPending, setIsPending] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatch() {
      const data = await getMatch(matchId as string);
      setMatch(data);
      setLoading(false);
    }
    loadMatch();
  }, [matchId]);

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

    if (maxScore < 11) return false;
    if (diff < 2) return false;
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
    if (!match || !user || isPending) return;

    setIsPending(true);
    const completedSets = getCompletedSets();
    const winner = getWinner();
    const winnerId = winner === "player1" ? match.player1.id : match.player2.id;

    const formattedSets = completedSets.map((set) => ({
      player1: parseInt(set.player1),
      player2: parseInt(set.player2),
    }));

    savePlayerResult(
      matchId as string,
      formattedSets,
      winnerId,
      user.id,
      observations || undefined
    ).then((updatedMatch) => {
      if (updatedMatch) {
        setMatch(updatedMatch);
        
        toast({
          title: "✓ Resultado Enviado",
          description: "El resultado ha sido registrado y está esperando verificación del administrador.",
        });

        setTimeout(() => setLocation("/jugador/dashboard"), 2000);
      } else {
        throw new Error("No se pudo guardar el resultado");
      }
    }).catch((error) => {
      console.error("Error guardando resultado:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el resultado del partido.",
        variant: "destructive",
      });
      setIsPending(false);
    });
  };

  const getValidationPlayers = (): Array<{
    id: string;
    name: string;
    birthYear: number;
    role: "player1" | "player2" | "player1Partner" | "player2Partner";
  }> => {
    if (!match) return [];
    
    return [
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
  };

  if (!match) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Partido no encontrado</p>
            <Button onClick={() => setLocation("/jugador/dashboard")} className="mt-4">
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is a player in this match
  const isPlayer = match.player1.id === user?.id || match.player2.id === user?.id;
  if (!isPlayer) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No tienes permiso para ingresar este resultado</p>
            <p className="text-sm text-muted-foreground mt-2">
              Solo los jugadores del partido pueden ingresar resultados
            </p>
            <Button onClick={() => setLocation("/jugador/dashboard")} className="mt-4">
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedSets = getCompletedSets();
  const winner = getWinner();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100" data-testid="text-tournament-name">
                {match.tournamentName}
              </h1>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                {match.stage === 'final' ? 'Final' : match.stage === 'semifinals' ? 'Semifinal' : 'Fase de Grupos'} - Mesa #{match.mesa}
              </p>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              <Clock className="h-3 w-3 mr-1" />
              Auto-Reporte
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <AlertDescription className="text-sm">
          <strong>Importante:</strong> El resultado que ingreses quedará como "pendiente de verificación" 
          hasta que un administrador lo apruebe. Asegúrate de ingresar los datos correctamente.
        </AlertDescription>
      </Alert>

      {/* Players */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            Jugadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 items-center">
            <div className="text-center" data-testid="player1-info">
              <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-blue-200">
                <AvatarImage src={match.player1.photoURL} />
                <AvatarFallback className="text-xl font-bold">{getInitials(match.player1.name)}</AvatarFallback>
              </Avatar>
              <div className="font-bold text-lg">{match.player1.name}</div>
              <Badge variant="outline" className="mt-2 font-mono">
                Rating: {match.player1.rating}
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-gray-400 dark:text-gray-600">VS</div>
            </div>

            <div className="text-center" data-testid="player2-info">
              <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-blue-200">
                <AvatarImage src={match.player2.photoURL} />
                <AvatarFallback className="text-xl font-bold">{getInitials(match.player2.name)}</AvatarFallback>
              </Avatar>
              <div className="font-bold text-lg">{match.player2.name}</div>
              <Badge variant="outline" className="mt-2 font-mono">
                Rating: {match.player2.rating}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Entry Form */}
      {!showValidation && (
        <Card>
          <CardHeader>
            <CardTitle>Ingreso de Resultado</CardTitle>
            <CardDescription>
              Best of 5 sets - Primer jugador en ganar 3 sets gana el partido. 
              Mínimo 11 puntos por set, diferencia mínima de 2 puntos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {setScores.map((set, index) => {
              const p1 = parseInt(set.player1);
              const p2 = parseInt(set.player2);
              const isValid = validateSet(p1, p2);
              const isEmpty = set.player1 === "" && set.player2 === "";
              const hasError = !isEmpty && set.player1 !== "" && set.player2 !== "" && !isValid;

              return (
                <div key={index} className="space-y-2">
                  <Label className="text-base font-semibold">Set {index + 1}</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={set.player1}
                        onChange={(e) => handleSetScoreChange(index, "player1", e.target.value)}
                        className={`text-center font-mono text-2xl h-14 ${
                          isValid ? "border-green-500 bg-green-50 dark:bg-green-950" : 
                          hasError ? "border-red-500 bg-red-50 dark:bg-red-950" : ""
                        }`}
                        data-testid={`input-set${index + 1}-player1`}
                      />
                    </div>
                    <span className="text-3xl font-bold text-muted-foreground">-</span>
                    <div className="flex-1">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={set.player2}
                        onChange={(e) => handleSetScoreChange(index, "player2", e.target.value)}
                        className={`text-center font-mono text-2xl h-14 ${
                          isValid ? "border-green-500 bg-green-50 dark:bg-green-950" : 
                          hasError ? "border-red-500 bg-red-50 dark:bg-red-950" : ""
                        }`}
                        data-testid={`input-set${index + 1}-player2`}
                      />
                    </div>
                    <div className="w-32 text-center">
                      {isValid && (
                        <Badge variant={p1 > p2 ? "default" : "secondary"} className="text-sm px-3 py-1">
                          ✓ {p1 > p2 ? match.player1.name.split(" ")[0] : match.player2.name.split(" ")[0]}
                        </Badge>
                      )}
                      {hasError && (
                        <Badge variant="destructive" className="text-xs">
                          Inválido
                        </Badge>
                      )}
                    </div>
                  </div>
                  {hasError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription className="text-sm">
                        Set inválido: Debe haber mínimo 11 puntos y diferencia de 2 puntos.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}

            <Separator className="my-6" />

            {completedSets.length > 0 && (
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Sets Completados</p>
                      <p className="text-3xl font-bold font-mono mt-1">{completedSets.length}</p>
                    </div>
                    {winner && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ganador del Partido</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                          {winner === "player1" ? match.player1.name : match.player2.name}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2 mt-6">
              <Label htmlFor="observations">Observaciones (Opcional)</Label>
              <Textarea
                id="observations"
                placeholder="Notas adicionales sobre el partido, incidentes, etc..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
                data-testid="input-observations"
              />
            </div>

            <Button
              onClick={handleContinueToValidation}
              disabled={!isValidResult()}
              className="w-full mt-6"
              size="lg"
              data-testid="button-continue-validation"
            >
              {isValidResult() ? "✓ Continuar a Validación de Jugadores" : "Completa al menos 3 sets válidos"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Birth Year Validation */}
      {showValidation && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Validación de Identidad</CardTitle>
              <CardDescription>
                Ambos jugadores deben confirmar su año de nacimiento para validar el resultado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BirthYearValidation
                players={getValidationPlayers()}
                onAllValidated={() => setValidationComplete(true)}
              />
            </CardContent>
          </Card>

          {validationComplete && (
            <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <Clock className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                  <p className="font-semibold text-lg">Validación Completa</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ambos jugadores han confirmado su identidad
                  </p>
                </div>
                <Button
                  onClick={handleConfirmResult}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="lg"
                  disabled={isPending}
                  data-testid="button-confirm-result"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  {isPending ? "Enviando..." : "✓ Enviar Resultado para Verificación"}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  El resultado quedará pendiente hasta que un administrador lo apruebe
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
