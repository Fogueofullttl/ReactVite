import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Player {
  id: string;
  name: string;
  seed?: number;
  photoUrl?: string | null;
}

interface Match {
  id: string;
  player1?: Player;
  player2?: Player;
  player1Score?: number;
  player2Score?: number;
  winnerId?: string;
  status: "pending" | "in_progress" | "completed";
}

interface TournamentBracketProps {
  rounds: Match[][];
  type?: "single-elimination" | "group-stage";
}

export function TournamentBracket({ rounds, type = "single-elimination" }: TournamentBracketProps) {
  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const MatchCard = ({ match }: { match: Match }) => {
    const isCompleted = match.status === "completed";
    const player1Won = match.winnerId === match.player1?.id;
    const player2Won = match.winnerId === match.player2?.id;

    return (
      <div className="w-64 mb-4">
        <Card className={`${match.status === "in_progress" ? "border-primary" : ""}`}>
          <CardContent className="p-0">
            {match.player1 || match.player2 ? (
              <>
                <div
                  className={`flex items-center gap-2 p-3 ${
                    isCompleted && player1Won ? "bg-primary/10" : ""
                  } border-b`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={match.player1?.photoUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {match.player1 ? getInitials(match.player1.name) : "TBD"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isCompleted && player1Won ? "font-semibold" : ""}`}>
                      {match.player1?.name || "TBD"}
                    </p>
                    {match.player1?.seed && (
                      <span className="text-xs text-muted-foreground">#{match.player1.seed}</span>
                    )}
                  </div>
                  {match.player1Score !== undefined && (
                    <span className={`text-lg font-bold font-mono ${isCompleted && player1Won ? "text-primary" : ""}`}>
                      {match.player1Score}
                    </span>
                  )}
                </div>
                <div
                  className={`flex items-center gap-2 p-3 ${
                    isCompleted && player2Won ? "bg-primary/10" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={match.player2?.photoUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {match.player2 ? getInitials(match.player2.name) : "TBD"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isCompleted && player2Won ? "font-semibold" : ""}`}>
                      {match.player2?.name || "TBD"}
                    </p>
                    {match.player2?.seed && (
                      <span className="text-xs text-muted-foreground">#{match.player2.seed}</span>
                    )}
                  </div>
                  {match.player2Score !== undefined && (
                    <span className={`text-lg font-bold font-mono ${isCompleted && player2Won ? "text-primary" : ""}`}>
                      {match.player2Score}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Match TBD
              </div>
            )}
          </CardContent>
        </Card>
        {match.status === "in_progress" && (
          <Badge variant="default" className="w-full justify-center mt-1">
            Live
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max p-4">
        {rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="flex flex-col justify-around">
            <div className="mb-4 text-center">
              <Badge variant="outline" className="mb-2">
                {roundIndex === 0
                  ? "Round of " + (rounds[0].length * 2)
                  : roundIndex === rounds.length - 1
                  ? "Finals"
                  : roundIndex === rounds.length - 2
                  ? "Semifinals"
                  : "Round " + (roundIndex + 1)}
              </Badge>
            </div>
            {round.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
