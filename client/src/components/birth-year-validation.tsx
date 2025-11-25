import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { User } from "@shared/schema";

interface BirthYearValidationProps {
  players: Array<{
    id: string;
    name: string;
    birthYear: number;
    role: "player1" | "player2" | "player1Partner" | "player2Partner";
  }>;
  onAllValidated: () => void;
}

interface ValidationState {
  [playerId: string]: {
    input: string;
    status: "pending" | "validated" | "error";
    attempts: number;
  };
}

export function BirthYearValidation({ players, onAllValidated }: BirthYearValidationProps) {
  const [validationStates, setValidationStates] = useState<ValidationState>(() => {
    const initial: ValidationState = {};
    players.forEach((player) => {
      initial[player.id] = {
        input: "",
        status: "pending",
        attempts: 0,
      };
    });
    return initial;
  });

  const handleInputChange = (playerId: string, value: string) => {
    // Solo permitir 4 dígitos
    const sanitized = value.replace(/\D/g, "").slice(0, 4);
    setValidationStates((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        input: sanitized,
      },
    }));
  };

  const handleValidate = (playerId: string, expectedBirthYear: number) => {
    const state = validationStates[playerId];
    const inputYear = parseInt(state.input);

    if (inputYear === expectedBirthYear) {
      setValidationStates((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          status: "validated",
          attempts: prev[playerId].attempts + 1,
        },
      }));
    } else {
      setValidationStates((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          status: "error",
          attempts: prev[playerId].attempts + 1,
        },
      }));

      // Reset after 2 seconds
      setTimeout(() => {
        setValidationStates((prev) => ({
          ...prev,
          [playerId]: {
            input: "",
            status: "pending",
            attempts: prev[playerId].attempts,
          },
        }));
      }, 2000);
    }
  };

  const allValidated = players.every(
    (player) => validationStates[player.id]?.status === "validated"
  );

  // Auto-trigger callback when all validated
  if (allValidated && players.length > 0) {
    setTimeout(() => onAllValidated(), 500);
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "player1":
        return "Jugador 1";
      case "player2":
        return "Jugador 2";
      case "player1Partner":
        return "Compañero Jugador 1";
      case "player2Partner":
        return "Compañero Jugador 2";
      default:
        return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Validación de Año de Nacimiento
        </CardTitle>
        <CardDescription>
          Cada jugador debe ingresar su año de nacimiento (4 dígitos) para validar el resultado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {players.map((player) => {
          const state = validationStates[player.id];
          const isValidated = state?.status === "validated";
          const isError = state?.status === "error";

          return (
            <div
              key={player.id}
              className="flex items-center gap-3 p-4 rounded-lg border"
              data-testid={`validation-${player.id}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{player.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {getRoleLabel(player.role)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Año (4 dígitos)"
                    value={state?.input || ""}
                    onChange={(e) => handleInputChange(player.id, e.target.value)}
                    disabled={isValidated}
                    maxLength={4}
                    className={`w-32 font-mono text-center ${
                      isValidated
                        ? "bg-green-50 dark:bg-green-950 border-green-500"
                        : isError
                        ? "bg-red-50 dark:bg-red-950 border-red-500"
                        : ""
                    }`}
                    data-testid={`input-birth-year-${player.id}`}
                  />
                  {!isValidated && state?.input.length === 4 && (
                    <Button
                      size="sm"
                      onClick={() => handleValidate(player.id, player.birthYear)}
                      data-testid={`button-validate-${player.id}`}
                    >
                      Validar
                    </Button>
                  )}
                </div>
                {state?.attempts > 0 && !isValidated && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Intentos: {state.attempts}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center w-12">
                {isValidated ? (
                  <CheckCircle2
                    className="h-8 w-8 text-green-600"
                    data-testid={`icon-validated-${player.id}`}
                  />
                ) : isError ? (
                  <XCircle
                    className="h-8 w-8 text-red-600"
                    data-testid={`icon-error-${player.id}`}
                  />
                ) : state?.input.length === 4 ? (
                  <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                ) : null}
              </div>
            </div>
          );
        })}

        {allValidated && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-500">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">
                Todos los jugadores han sido validados correctamente
              </span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              El botón "Confirmar Resultado" aparecerá en un momento...
            </p>
          </div>
        )}

        {!allValidated && (
          <div className="text-sm text-muted-foreground">
            <p>
              Jugadores validados: {players.filter((p) => validationStates[p.id]?.status === "validated").length} / {players.length}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
