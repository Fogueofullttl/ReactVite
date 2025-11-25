import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Match } from "@/data/mockMatches";

interface MatchCardProps {
  match: Match;
  onEnterResult?: () => void;
}

export default function MatchCard({ match, onEnterResult }: MatchCardProps) {
  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      groups: "Grupos",
      semifinals: "Semifinales",
      final: "Final",
      quarterfinals: "Cuartos de Final",
    };
    return labels[stage] || stage;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <Card className="mb-4" data-testid={`card-match-${match.id}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <Badge 
            variant={match.stage === 'final' ? 'default' : 'secondary'}
            data-testid={`badge-stage-${match.id}`}
          >
            {getStageLabel(match.stage)} - Mesa {match.mesa}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {match.tournamentName}
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-center">
            <Avatar className="w-16 h-16 mx-auto mb-2">
              <AvatarImage src={match.player1.photoURL} alt={match.player1.name} />
              <AvatarFallback>{getInitials(match.player1.name)}</AvatarFallback>
            </Avatar>
            <div className="font-semibold" data-testid={`text-player1-${match.id}`}>
              {match.player1.name}
            </div>
            <div className="text-sm text-muted-foreground">
              Rating: {match.player1.rating}
            </div>
          </div>

          <div className="text-center text-2xl font-bold text-muted-foreground">
            VS
          </div>

          <div className="text-center">
            <Avatar className="w-16 h-16 mx-auto mb-2">
              <AvatarImage src={match.player2.photoURL} alt={match.player2.name} />
              <AvatarFallback>{getInitials(match.player2.name)}</AvatarFallback>
            </Avatar>
            <div className="font-semibold" data-testid={`text-player2-${match.id}`}>
              {match.player2.name}
            </div>
            <div className="text-sm text-muted-foreground">
              Rating: {match.player2.rating}
            </div>
          </div>
        </div>

        {match.status === 'pending' && onEnterResult && (
          <Button 
            className="w-full mt-4" 
            onClick={onEnterResult}
            data-testid={`button-enter-result-${match.id}`}
          >
            📝 Ingresar Resultado
          </Button>
        )}

        {match.status === 'completed' && match.result && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Resultado:</span>
              <span className="text-lg font-mono" data-testid={`text-result-${match.id}`}>
                {match.result.sets.map(s => `${s.player1}-${s.player2}`).join(', ')}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Ganador: {match.result.winner === match.player1.id ? match.player1.name : match.player2.name}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
