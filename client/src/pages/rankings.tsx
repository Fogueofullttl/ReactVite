import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown, Minus, Award, Medal, Trophy, Crown } from 'lucide-react';
import { getRankings, RankingEntry } from '@/lib/rankings';

export default function Rankings() {
  const [rankings, setRankings] = useState<Record<string, RankingEntry[]>>({
    singles_male: [],
    singles_female: [],
    doubles_male: [],
    doubles_female: [],
    doubles_mixed: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllRankings();
  }, []);

  const loadAllRankings = async () => {
    try {
      const categories = ['singles_male', 'singles_female', 'doubles_male', 'doubles_female', 'doubles_mixed'];
      const data: Record<string, RankingEntry[]> = {};
      
      for (const category of categories) {
        data[category] = await getRankings(category);
      }
      
      setRankings(data);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) {
      return (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
          <Crown className="w-7 h-7 text-yellow-500" />
        </div>
      );
    }
    if (position === 2) {
      return (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800">
          <Medal className="w-7 h-7 text-gray-400" />
        </div>
      );
    }
    if (position === 3) {
      return (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30">
          <Medal className="w-7 h-7 text-orange-600" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
        <span className="text-2xl font-bold text-muted-foreground">{position}</span>
      </div>
    );
  };

  const RankingTable = ({ data, title }: { data: RankingEntry[]; title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              No hay jugadores rankeados todavia
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Los rankings se actualizan al finalizar torneos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.slice(0, 10).map((player) => (
              <div 
                key={player.userId}
                className={`flex flex-wrap items-center gap-4 p-4 rounded-lg border ${
                  player.position === 1 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' :
                  player.position === 2 ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600' :
                  player.position === 3 ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700' :
                  'bg-card'
                }`}
                data-testid={`ranking-entry-${player.position}`}
              >
                {getPositionIcon(player.position)}

                <Avatar className="w-12 h-12">
                  <AvatarImage src={player.photoURL} />
                  <AvatarFallback>
                    {player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg truncate" data-testid={`text-player-name-${player.position}`}>
                    {player.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-mono">{player.memberNumber}</span>
                    {player.club && <span> - {player.club}</span>}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                    {player.rating}
                  </div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-semibold">
                    <span className="text-green-600">{player.wins}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-red-600">{player.losses}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {player.tournamentsPlayed} torneos
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {getTrendIcon(player.trend)}
                  {player.trend === 'new' ? (
                    <Badge variant="default" data-testid={`badge-new-${player.position}`}>Nuevo</Badge>
                  ) : player.lastChange !== 0 && (
                    <span className={`text-sm font-semibold ${
                      player.lastChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {player.lastChange > 0 ? '+' : ''}{player.lastChange}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Cargando rankings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          Rankings Oficiales FPTM
        </h1>
        <p className="text-muted-foreground">
          Top 10 jugadores por categoria - Actualizado al finalizar cada torneo
        </p>
      </div>

      <Tabs defaultValue="singles_male" data-testid="tabs-rankings">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full mb-6">
          <TabsTrigger value="singles_male" data-testid="tab-singles-male">
            Singles M
          </TabsTrigger>
          <TabsTrigger value="singles_female" data-testid="tab-singles-female">
            Singles F
          </TabsTrigger>
          <TabsTrigger value="doubles_male" data-testid="tab-doubles-male">
            Dobles M
          </TabsTrigger>
          <TabsTrigger value="doubles_female" data-testid="tab-doubles-female">
            Dobles F
          </TabsTrigger>
          <TabsTrigger value="doubles_mixed" data-testid="tab-doubles-mixed">
            Mixtos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="singles_male">
          <RankingTable data={rankings.singles_male} title="Singles Masculino - Top 10" />
        </TabsContent>

        <TabsContent value="singles_female">
          <RankingTable data={rankings.singles_female} title="Singles Femenino - Top 10" />
        </TabsContent>

        <TabsContent value="doubles_male">
          <RankingTable data={rankings.doubles_male} title="Dobles Masculino - Top 10" />
        </TabsContent>

        <TabsContent value="doubles_female">
          <RankingTable data={rankings.doubles_female} title="Dobles Femenino - Top 10" />
        </TabsContent>

        <TabsContent value="doubles_mixed">
          <RankingTable data={rankings.doubles_mixed} title="Dobles Mixtos - Top 10" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
