import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Trophy, Users, Search, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Tournaments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const tournaments = [
    {
      id: "1",
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
    },
    {
      id: "2",
      name: "Doubles Championship",
      type: "doubles",
      genderCategory: "mixed",
      status: "registration_open",
      startDate: "2025-02-05",
      endDate: "2025-02-06",
      venue: "Coliseo Municipal, Ponce",
      entryFee: 40,
      participants: 16,
      maxParticipants: 32,
      registrationDeadline: "2025-02-01",
    },
    {
      id: "3",
      name: "Women's Invitational",
      type: "singles",
      genderCategory: "female",
      status: "upcoming",
      startDate: "2025-02-20",
      endDate: "2025-02-20",
      venue: "Club Deportivo, Mayagüez",
      entryFee: 30,
      participants: 12,
      maxParticipants: 24,
      registrationDeadline: "2025-02-15",
    },
    {
      id: "4",
      name: "Men's Summer Classic",
      type: "singles",
      genderCategory: "male",
      status: "upcoming",
      startDate: "2025-03-10",
      endDate: "2025-03-12",
      venue: "Arena Deportiva, Caguas",
      entryFee: 50,
      participants: 0,
      maxParticipants: 48,
      registrationDeadline: "2025-03-05",
    },
    {
      id: "5",
      name: "Island Champions Cup",
      type: "singles",
      genderCategory: "mixed",
      status: "in_progress",
      startDate: "2024-12-20",
      endDate: "2024-12-22",
      venue: "Estadio Nacional, San Juan",
      entryFee: 60,
      participants: 64,
      maxParticipants: 64,
      registrationDeadline: "2024-12-15",
    },
    {
      id: "6",
      name: "Holiday Mixed Doubles",
      type: "doubles",
      genderCategory: "mixed",
      status: "completed",
      startDate: "2024-12-01",
      endDate: "2024-12-02",
      venue: "Centro Comunitario, Arecibo",
      entryFee: 40,
      participants: 24,
      maxParticipants: 24,
      registrationDeadline: "2024-11-25",
    },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "registration_open":
        return "default";
      case "upcoming":
        return "secondary";
      case "in_progress":
        return "outline";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "registration_open":
        return "Registration Open";
      case "upcoming":
        return "Upcoming";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const groupedTournaments = {
    registration_open: filteredTournaments.filter((t) => t.status === "registration_open"),
    upcoming: filteredTournaments.filter((t) => t.status === "upcoming"),
    in_progress: filteredTournaments.filter((t) => t.status === "in_progress"),
    completed: filteredTournaments.filter((t) => t.status === "completed"),
  };

  const TournamentCard = ({ tournament }: { tournament: typeof tournaments[0] }) => (
    <Card className="hover-elevate" data-testid={`card-tournament-${tournament.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex-1 min-w-0">
            <CardTitle className="mb-1 truncate">{tournament.name}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {formatDate(tournament.startDate)}
                {tournament.endDate !== tournament.startDate && ` - ${formatDate(tournament.endDate)}`}
              </span>
            </CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(tournament.status)} className="flex-shrink-0">
            {getStatusLabel(tournament.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
            <span className="text-muted-foreground">{tournament.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">
              {tournament.participants}/{tournament.maxParticipants} participants
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs capitalize">
            {tournament.type}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {tournament.genderCategory}
          </Badge>
          <Badge variant="outline" className="text-xs">
            ${tournament.entryFee}
          </Badge>
        </div>
        <Button className="w-full" asChild data-testid={`button-view-tournament-${tournament.id}`}>
          <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tournaments</h1>
            <p className="text-muted-foreground">Browse and register for upcoming competitions</p>
          </div>
          <Button data-testid="button-create-tournament">
            <Plus className="h-4 w-4 mr-2" />
            Create Tournament
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32" data-testid="select-type">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="singles">Singles</SelectItem>
                <SelectItem value="doubles">Doubles</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="registration_open">Registration Open</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">
            All ({filteredTournaments.length})
          </TabsTrigger>
          <TabsTrigger value="open" data-testid="tab-open">
            Open ({groupedTournaments.registration_open.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">
            Upcoming ({groupedTournaments.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="active" data-testid="tab-active">
            Active ({groupedTournaments.in_progress.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
          {filteredTournaments.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tournaments found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="open" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groupedTournaments.registration_open.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
          {groupedTournaments.registration_open.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No open registrations</h3>
              <p className="text-muted-foreground">Check back soon for new tournaments</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groupedTournaments.upcoming.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groupedTournaments.in_progress.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
