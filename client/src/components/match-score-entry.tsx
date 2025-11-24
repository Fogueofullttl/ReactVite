import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MatchScoreEntryProps {
  match: {
    id: string;
    player1Name: string;
    player1Id: string;
    player1PhotoUrl: string | null;
    player2Name: string;
    player2Id: string;
    player2PhotoUrl: string | null;
    tournament: string;
    round: string;
  };
  onSubmit?: (data: any) => void;
}

export function MatchScoreEntry({ match, onSubmit }: MatchScoreEntryProps) {
  const { toast } = useToast();
  const [player1Score, setPlayer1Score] = useState("");
  const [player2Score, setPlayer2Score] = useState("");
  const [player1BirthYear, setPlayer1BirthYear] = useState("");
  const [player2BirthYear, setPlayer2BirthYear] = useState("");
  const [player1Validated, setPlayer1Validated] = useState(false);
  const [player2Validated, setPlayer2Validated] = useState(false);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const validateBirthYear = (playerNum: number) => {
    const birthYear = playerNum === 1 ? player1BirthYear : player2BirthYear;
    
    // Mock validation - in real app, check against database
    if (birthYear.length === 4 && parseInt(birthYear) > 1900 && parseInt(birthYear) < 2020) {
      if (playerNum === 1) {
        setPlayer1Validated(true);
      } else {
        setPlayer2Validated(true);
      }
      toast({
        title: "Birth year verified",
        description: `Player ${playerNum} has confirmed the result`,
      });
    } else {
      toast({
        title: "Invalid birth year",
        description: "Please enter the correct 4-digit birth year",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!player1Validated || !player2Validated) {
      toast({
        title: "Validation required",
        description: "Both players must verify the result with their birth year",
        variant: "destructive",
      });
      return;
    }

    const data = {
      matchId: match.id,
      player1Score: parseInt(player1Score),
      player2Score: parseInt(player2Score),
      player1Validated,
      player2Validated,
    };

    onSubmit?.(data);
    
    toast({
      title: "Match result submitted",
      description: "The scores have been recorded and ratings will be updated",
    });
  };

  const isSubmitEnabled = player1Score && player2Score && player1Validated && player2Validated;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Enter Match Score
        </CardTitle>
        <CardDescription>{match.tournament} • {match.round}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={match.player1PhotoUrl || undefined} />
                  <AvatarFallback>{getInitials(match.player1Name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{match.player1Name}</p>
                  <p className="text-sm text-muted-foreground">Player 1</p>
                </div>
                {player1Validated && (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500 flex-shrink-0" />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="player1Score">Score *</Label>
                <Input
                  id="player1Score"
                  type="number"
                  min="0"
                  max="5"
                  placeholder="0"
                  value={player1Score}
                  onChange={(e) => setPlayer1Score(e.target.value)}
                  className="text-4xl text-center font-bold font-mono h-20"
                  required
                  data-testid="input-player1-score"
                />
                <p className="text-xs text-muted-foreground">Games won (0-5)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="player1BirthYear">Birth Year Verification *</Label>
                <div className="flex gap-2">
                  <Input
                    id="player1BirthYear"
                    type="text"
                    maxLength={4}
                    placeholder="YYYY"
                    value={player1BirthYear}
                    onChange={(e) => setPlayer1BirthYear(e.target.value)}
                    disabled={player1Validated}
                    className="font-mono"
                    data-testid="input-player1-birth-year"
                  />
                  <Button
                    type="button"
                    onClick={() => validateBirthYear(1)}
                    disabled={player1Validated || player1BirthYear.length !== 4}
                    data-testid="button-validate-player1"
                  >
                    {player1Validated ? "Verified" : "Verify"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Player must enter their birth year to confirm
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={match.player2PhotoUrl || undefined} />
                  <AvatarFallback>{getInitials(match.player2Name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{match.player2Name}</p>
                  <p className="text-sm text-muted-foreground">Player 2</p>
                </div>
                {player2Validated && (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500 flex-shrink-0" />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="player2Score">Score *</Label>
                <Input
                  id="player2Score"
                  type="number"
                  min="0"
                  max="5"
                  placeholder="0"
                  value={player2Score}
                  onChange={(e) => setPlayer2Score(e.target.value)}
                  className="text-4xl text-center font-bold font-mono h-20"
                  required
                  data-testid="input-player2-score"
                />
                <p className="text-xs text-muted-foreground">Games won (0-5)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="player2BirthYear">Birth Year Verification *</Label>
                <div className="flex gap-2">
                  <Input
                    id="player2BirthYear"
                    type="text"
                    maxLength={4}
                    placeholder="YYYY"
                    value={player2BirthYear}
                    onChange={(e) => setPlayer2BirthYear(e.target.value)}
                    disabled={player2Validated}
                    className="font-mono"
                    data-testid="input-player2-birth-year"
                  />
                  <Button
                    type="button"
                    onClick={() => validateBirthYear(2)}
                    disabled={player2Validated || player2BirthYear.length !== 4}
                    data-testid="button-validate-player2"
                  >
                    {player2Validated ? "Verified" : "Verify"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Player must enter their birth year to confirm
                </p>
              </div>
            </div>
          </div>

          {player1Score && player2Score && (
            <div className="p-4 rounded-lg border bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground mb-2">Match Result</p>
              <p className="text-3xl font-bold font-mono">
                {player1Score} - {player2Score}
              </p>
              {player1Score !== player2Score && (
                <p className="mt-2 text-sm">
                  Winner: <span className="font-semibold">
                    {parseInt(player1Score) > parseInt(player2Score) ? match.player1Name : match.player2Name}
                  </span>
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={!isSubmitEnabled}
              data-testid="button-submit-score"
            >
              Submit Match Result
            </Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </div>

          {!player1Validated || !player2Validated ? (
            <div className="text-sm text-muted-foreground text-center">
              <p>⚠️ Both players must verify the result before submission</p>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
