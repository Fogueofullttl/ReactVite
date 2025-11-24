import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, TrendingUp, TrendingDown, Minus, Medal } from "lucide-react";

export default function Rankings() {
  const [category, setCategory] = useState("singles");
  const [gender, setGender] = useState("all");

  const players = [
    {
      id: "1",
      rank: 1,
      previousRank: 1,
      name: "Carlos Rivera",
      club: "San Juan TT",
      rating: 1850,
      previousRating: 1825,
      matchesPlayed: 45,
      wins: 38,
      losses: 7,
      winRate: 84.4,
      photoUrl: null,
      gender: "male",
    },
    {
      id: "2",
      rank: 2,
      previousRank: 3,
      name: "María González",
      club: "Ponce Club",
      rating: 1820,
      previousRating: 1795,
      matchesPlayed: 42,
      wins: 36,
      losses: 6,
      winRate: 85.7,
      photoUrl: null,
      gender: "female",
    },
    {
      id: "3",
      rank: 3,
      previousRank: 2,
      name: "José Martínez",
      club: "Mayagüez TT",
      rating: 1795,
      previousRating: 1810,
      matchesPlayed: 38,
      wins: 30,
      losses: 8,
      winRate: 78.9,
      photoUrl: null,
      gender: "male",
    },
    {
      id: "4",
      rank: 4,
      previousRank: 4,
      name: "Ana Rodríguez",
      club: "Caguas TT",
      rating: 1770,
      previousRating: 1760,
      matchesPlayed: 35,
      wins: 28,
      losses: 7,
      winRate: 80.0,
      photoUrl: null,
      gender: "female",
    },
    {
      id: "5",
      rank: 5,
      previousRank: 6,
      name: "Luis Torres",
      club: "San Juan TT",
      rating: 1745,
      previousRating: 1720,
      matchesPlayed: 32,
      wins: 25,
      losses: 7,
      winRate: 78.1,
      photoUrl: null,
      gender: "male",
    },
    {
      id: "6",
      rank: 6,
      previousRank: 5,
      name: "Carmen Díaz",
      club: "Bayamón Club",
      rating: 1730,
      previousRating: 1735,
      matchesPlayed: 40,
      wins: 30,
      losses: 10,
      winRate: 75.0,
      photoUrl: null,
      gender: "female",
    },
    {
      id: "7",
      rank: 7,
      previousRank: 7,
      name: "Roberto Vega",
      club: "Humacao TT",
      rating: 1715,
      previousRating: 1710,
      matchesPlayed: 30,
      wins: 22,
      losses: 8,
      winRate: 73.3,
      photoUrl: null,
      gender: "male",
    },
    {
      id: "8",
      rank: 8,
      previousRank: 9,
      name: "Isabel Flores",
      club: "Arecibo Club",
      rating: 1700,
      previousRating: 1685,
      matchesPlayed: 28,
      wins: 20,
      losses: 8,
      winRate: 71.4,
      photoUrl: null,
      gender: "female",
    },
  ];

  const getRankChange = (rank: number, previousRank: number) => {
    if (rank < previousRank) return { icon: TrendingUp, color: "text-green-600 dark:text-green-500", change: previousRank - rank };
    if (rank > previousRank) return { icon: TrendingDown, color: "text-red-600 dark:text-red-500", change: rank - previousRank };
    return { icon: Minus, color: "text-muted-foreground", change: 0 };
  };

  const getRatingChange = (rating: number, previousRating: number) => {
    const change = rating - previousRating;
    if (change > 0) return { text: `+${change}`, color: "text-green-600 dark:text-green-500" };
    if (change < 0) return { text: `${change}`, color: "text-red-600 dark:text-red-500" };
    return { text: "0", color: "text-muted-foreground" };
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return null;
  };

  const filteredPlayers = players.filter((p) => {
    if (gender === "male") return p.gender === "male";
    if (gender === "female") return p.gender === "female";
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Player Rankings</h1>
        </div>
        <p className="text-muted-foreground">Current standings and player statistics</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40" data-testid="select-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="singles">Singles</SelectItem>
            <SelectItem value="doubles">Doubles</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger className="w-40" data-testid="select-gender">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Players</SelectItem>
            <SelectItem value="male">Men</SelectItem>
            <SelectItem value="female">Women</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="table" className="space-y-6">
        <TabsList>
          <TabsTrigger value="table" data-testid="tab-table">
            Table View
          </TabsTrigger>
          <TabsTrigger value="cards" data-testid="tab-cards">
            Card View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Club</TableHead>
                      <TableHead className="text-right">Rating</TableHead>
                      <TableHead className="text-right">Matches</TableHead>
                      <TableHead className="text-right">W-L</TableHead>
                      <TableHead className="text-right">Win %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlayers.map((player) => {
                      const rankChange = getRankChange(player.rank, player.previousRank);
                      const ratingChange = getRatingChange(player.rating, player.previousRating);
                      const RankIcon = rankChange.icon;

                      return (
                        <TableRow key={player.id} className="hover-elevate" data-testid={`row-player-${player.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-8">
                                {getRankBadge(player.rank) || (
                                  <span className="font-bold">{player.rank}</span>
                                )}
                              </div>
                              <div className="flex flex-col items-center">
                                <RankIcon className={`h-3 w-3 ${rankChange.color}`} />
                                {rankChange.change > 0 && (
                                  <span className={`text-xs ${rankChange.color}`}>{rankChange.change}</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={player.photoUrl || undefined} />
                                <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{player.name}</div>
                                <div className="text-xs text-muted-foreground capitalize">{player.gender}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">{player.club}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-lg font-bold font-mono">{player.rating}</span>
                              <span className={`text-xs font-mono ${ratingChange.color}`}>
                                {ratingChange.text}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-mono">{player.matchesPlayed}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-mono text-sm">
                              {player.wins}-{player.losses}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-mono">{player.winRate.toFixed(1)}%</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlayers.map((player) => {
              const rankChange = getRankChange(player.rank, player.previousRank);
              const ratingChange = getRatingChange(player.rating, player.previousRating);
              const RankIcon = rankChange.icon;

              return (
                <Card key={player.id} className="hover-elevate" data-testid={`card-player-${player.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary font-bold">
                          {getRankBadge(player.rank) || `#${player.rank}`}
                        </div>
                        <div className="flex items-center gap-1">
                          <RankIcon className={`h-3 w-3 ${rankChange.color}`} />
                          {rankChange.change > 0 && (
                            <span className={`text-xs ${rankChange.color}`}>{rankChange.change}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Avatar className="h-16 w-16 mb-2">
                          <AvatarImage src={player.photoUrl || undefined} />
                          <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-lg truncate">{player.name}</CardTitle>
                        <CardDescription className="truncate">{player.club}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rating</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-mono">{player.rating}</span>
                        <span className={`text-sm font-mono ${ratingChange.color}`}>
                          {ratingChange.text}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Matches</div>
                        <div className="font-mono font-semibold">{player.matchesPlayed}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">W-L</div>
                        <div className="font-mono font-semibold text-sm">
                          {player.wins}-{player.losses}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Win %</div>
                        <div className="font-mono font-semibold">{player.winRate.toFixed(0)}%</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="w-full justify-center capitalize">
                      {player.gender}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
