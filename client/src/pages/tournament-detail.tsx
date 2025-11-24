import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, MapPin, Trophy, Users, DollarSign, Clock, ArrowLeft } from "lucide-react";

export default function TournamentDetail() {
  const params = useParams();
  const tournamentId = params.id;

  const tournament = {
    id: tournamentId,
    name: "Puerto Rico Open 2025",
    type: "singles",
    genderCategory: "mixed",
    status: "registration_open",
    startDate: "2025-01-15",
    endDate: "2025-01-17",
    venue: "Centro de Convenciones, San Juan",
    entryFee: 50,
    participants: 32,
    maxParticipants: 64,
    registrationDeadline: "2025-01-10",
    description: "Annual open tournament for singles players of all skill levels. Join us for three days of competitive table tennis in Puerto Rico's premier sporting venue.",
  };

  const registeredPlayers = [
    { id: "1", name: "Carlos Rivera", club: "San Juan TT", rating: 1850, seed: 1, photoUrl: null },
    { id: "2", name: "María González", club: "Ponce Club", rating: 1820, seed: 2, photoUrl: null },
    { id: "3", name: "José Martínez", club: "Mayagüez TT", rating: 1795, seed: 3, photoUrl: null },
    { id: "4", name: "Ana Rodríguez", club: "Caguas TT", rating: 1770, seed: 4, photoUrl: null },
  ];

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "registration_open": return "default";
      case "upcoming": return "secondary";
      case "in_progress": return "outline";
      case "completed": return "outline";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "registration_open": return "Registration Open";
      case "upcoming": return "Upcoming";
      case "in_progress": return "In Progress";
      case "completed": return "Completed";
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const daysUntilDeadline = Math.ceil(
    (new Date(tournament.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4" data-testid="button-back">
          <Link href="/tournaments">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-2">{tournament.name}</h1>
            <p className="text-muted-foreground">{tournament.description}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(tournament.status)} className="flex-shrink-0">
            {getStatusLabel(tournament.status)}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Event Dates</p>
                <p className="font-semibold text-sm truncate">
                  {formatDate(tournament.startDate)}
                  {tournament.endDate !== tournament.startDate && ` - ${formatDate(tournament.endDate)}`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Venue</p>
                <p className="font-semibold text-sm truncate">{tournament.venue}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Participants</p>
                <p className="font-semibold text-sm">
                  {tournament.participants}/{tournament.maxParticipants}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Entry Fee</p>
                <p className="font-semibold text-sm">${tournament.entryFee}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {tournament.status === "registration_open" && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Registration deadline in {daysUntilDeadline} days</p>
                    <p className="text-sm text-muted-foreground">
                      Closes on {formatDate(tournament.registrationDeadline)}
                    </p>
                  </div>
                </div>
                <Button size="lg" data-testid="button-register-tournament">
                  Register Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="players" data-testid="tab-players">
            Registered Players ({registeredPlayers.length})
          </TabsTrigger>
          <TabsTrigger value="bracket" data-testid="tab-bracket">Bracket</TabsTrigger>
          <TabsTrigger value="results" data-testid="tab-results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tournament Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline" className="capitalize">{tournament.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline" className="capitalize">{tournament.genderCategory}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Participants</span>
                  <span className="font-semibold">{tournament.maxParticipants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry Fee</span>
                  <span className="font-semibold">${tournament.entryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration Deadline</span>
                  <span className="font-semibold">{formatDate(tournament.registrationDeadline)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tournament Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Best of 5 games (first to 3 wins)</p>
                <p>• Games played to 11 points (win by 2)</p>
                <p>• ITTF regulations apply</p>
                <p>• Active membership required</p>
                <p>• Payment verification mandatory</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="players">
          <Card>
            <CardHeader>
              <CardTitle>Registered Players</CardTitle>
              <CardDescription>
                {tournament.participants} players registered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Seed</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registeredPlayers.map((player) => (
                    <TableRow key={player.id} className="hover-elevate" data-testid={`row-player-${player.id}`}>
                      <TableCell>
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 font-bold text-primary">
                          {player.seed}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={player.photoUrl || undefined} />
                            <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{player.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{player.club}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono font-semibold">{player.rating}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bracket">
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Bracket Not Generated</h3>
              <p className="text-muted-foreground">
                The tournament bracket will be generated after registration closes
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Yet</h3>
              <p className="text-muted-foreground">
                Results will be available once the tournament begins
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
