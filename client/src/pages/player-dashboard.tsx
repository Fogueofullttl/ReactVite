import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Calendar, TrendingUp, Medal, Clock, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function PlayerDashboard() {
  const upcomingMatches = [
    {
      id: "1",
      tournament: "Puerto Rico Open 2025",
      opponent: "José Martínez",
      opponentRating: 1795,
      opponentPhotoUrl: null,
      date: "2025-01-15",
      time: "10:00 AM",
      venue: "Centro de Convenciones",
      round: "Round of 64",
    },
    {
      id: "2",
      tournament: "Doubles Championship",
      opponent: "Team Rivera/Torres",
      opponentRating: 1820,
      opponentPhotoUrl: null,
      date: "2025-02-05",
      time: "2:00 PM",
      venue: "Coliseo Municipal",
      round: "Quarterfinals",
    },
  ];

  const registeredTournaments = [
    {
      id: "1",
      name: "Puerto Rico Open 2025",
      date: "2025-01-15",
      status: "registration_open",
      paymentStatus: "verified",
    },
    {
      id: "2",
      name: "Doubles Championship",
      date: "2025-02-05",
      status: "registration_open",
      paymentStatus: "pending",
    },
  ];

  const stats = {
    currentRating: 1745,
    ratingChange: +15,
    currentRank: 5,
    rankChange: +1,
    matchesPlayed: 32,
    wins: 25,
    losses: 7,
    winRate: 78.1,
  };

  const recentMatches = [
    {
      id: "1",
      opponent: "Carlos Rivera",
      opponentRating: 1850,
      result: "loss",
      score: "2-3",
      ratingChange: -8,
      date: "2024-12-15",
      tournament: "Island Champions Cup",
    },
    {
      id: "2",
      opponent: "Ana Rodríguez",
      opponentRating: 1770,
      result: "win",
      score: "3-1",
      ratingChange: +12,
      date: "2024-12-14",
      tournament: "Island Champions Cup",
    },
    {
      id: "3",
      opponent: "Roberto Vega",
      opponentRating: 1715,
      result: "win",
      score: "3-0",
      ratingChange: +11,
      date: "2024-12-13",
      tournament: "Island Champions Cup",
    },
  ];

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Player Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your tournament activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Current Rating</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold font-mono">{stats.currentRating}</p>
              <p className={`text-sm font-mono mb-1 ${stats.ratingChange > 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                {stats.ratingChange > 0 ? "+" : ""}{stats.ratingChange}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Current Rank</p>
              <Medal className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold">#{stats.currentRank}</p>
              <p className={`text-sm mb-1 ${stats.rankChange > 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                {stats.rankChange > 0 ? "↑" : "↓"} {Math.abs(stats.rankChange)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Match Record</p>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold font-mono">{stats.wins}-{stats.losses}</p>
              <p className="text-sm text-muted-foreground mb-1">
                ({stats.matchesPlayed} played)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold font-mono">{stats.winRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Matches
            </CardTitle>
            <CardDescription>Your scheduled tournament matches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => (
                <div key={match.id} className="flex items-center gap-4 p-4 rounded-lg border hover-elevate" data-testid={`card-match-${match.id}`}>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={match.opponentPhotoUrl || undefined} />
                    <AvatarFallback>{getInitials(match.opponent)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{match.opponent}</p>
                    <p className="text-sm text-muted-foreground truncate">{match.tournament}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(match.date)} • {match.time}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">{match.round}</Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      {match.opponentRating} rating
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No upcoming matches</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Registered Tournaments
            </CardTitle>
            <CardDescription>Your active tournament registrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {registeredTournaments.length > 0 ? (
              registeredTournaments.map((tournament) => (
                <div key={tournament.id} className="flex items-center justify-between p-4 rounded-lg border hover-elevate" data-testid={`card-registration-${tournament.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{tournament.name}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(tournament.date)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge variant={tournament.paymentStatus === "verified" ? "default" : "secondary"}>
                      {tournament.paymentStatus === "verified" ? "Verified" : "Pending"}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/tournaments/${tournament.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">No active registrations</p>
                <Button asChild>
                  <Link href="/tournaments">Browse Tournaments</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Match History</CardTitle>
          <CardDescription>Your latest tournament results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMatches.map((match) => (
              <div key={match.id} className="flex items-center gap-4 p-4 rounded-lg border hover-elevate" data-testid={`row-match-${match.id}`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-md font-bold ${match.result === "win" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                  {match.result === "win" ? "W" : "L"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold truncate">{match.opponent}</p>
                    <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                      ({match.opponentRating})
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{match.tournament}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xl font-bold font-mono">{match.score}</span>
                  <span className={`text-sm font-mono ${match.ratingChange > 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                    {match.ratingChange > 0 ? "+" : ""}{match.ratingChange}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground flex-shrink-0">
                  {formatDate(match.date)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
