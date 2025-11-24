import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Trophy, Users, Search, Plus } from "lucide-react";
import { Link } from "wouter";
import type { Tournament } from "@shared/schema";

export default function Tournaments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

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
        return "Inscripción Abierta";
      case "upcoming":
        return "Próximamente";
      case "in_progress":
        return "En Progreso";
      case "completed":
        return "Finalizado";
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "singles" ? "Individual" : "Dobles";
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "male":
        return "Masculino";
      case "female":
        return "Femenino";
      case "mixed":
        return "Mixto";
      default:
        return gender;
    }
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || tournament.type === filterType;
    const matchesStatus = filterStatus === "all" || tournament.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const groupedByStatus = {
    registration_open: filteredTournaments.filter((t) => t.status === "registration_open"),
    upcoming: filteredTournaments.filter((t) => t.status === "upcoming"),
    in_progress: filteredTournaments.filter((t) => t.status === "in_progress"),
    completed: filteredTournaments.filter((t) => t.status === "completed"),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Cargando torneos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Torneos</h1>
          <p className="text-muted-foreground">
            Explora y regístrate en torneos de tenis de mesa
          </p>
        </div>
        <Button asChild data-testid="button-create-tournament">
          <Link href="/tournaments/create">
            <Plus className="mr-2 h-4 w-4" />
            Crear Torneo
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <CardDescription>Encuentra el torneo perfecto para ti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar torneos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-tournaments"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger data-testid="select-filter-type">
                <SelectValue placeholder="Tipo de Torneo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                <SelectItem value="singles">Individual</SelectItem>
                <SelectItem value="doubles">Dobles</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger data-testid="select-filter-status">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="registration_open">Inscripción Abierta</SelectItem>
                <SelectItem value="upcoming">Próximamente</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Finalizados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" data-testid="tab-all">
            Todos ({filteredTournaments.length})
          </TabsTrigger>
          <TabsTrigger value="registration_open" data-testid="tab-open">
            Abiertos ({groupedByStatus.registration_open.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">
            Próximos ({groupedByStatus.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress" data-testid="tab-in-progress">
            En Curso ({groupedByStatus.in_progress.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            Finalizados ({groupedByStatus.completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <TournamentGrid tournaments={filteredTournaments} />
        </TabsContent>
        <TabsContent value="registration_open" className="mt-6">
          <TournamentGrid tournaments={groupedByStatus.registration_open} />
        </TabsContent>
        <TabsContent value="upcoming" className="mt-6">
          <TournamentGrid tournaments={groupedByStatus.upcoming} />
        </TabsContent>
        <TabsContent value="in_progress" className="mt-6">
          <TournamentGrid tournaments={groupedByStatus.in_progress} />
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <TournamentGrid tournaments={groupedByStatus.completed} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TournamentGrid({ tournaments }: { tournaments: Tournament[] }) {
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
        return "Inscripción Abierta";
      case "upcoming":
        return "Próximamente";
      case "in_progress":
        return "En Progreso";
      case "completed":
        return "Finalizado";
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "singles" ? "Individual" : "Dobles";
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "male":
        return "Masculino";
      case "female":
        return "Femenino";
      case "mixed":
        return "Mixto";
      default:
        return gender;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (tournaments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No se encontraron torneos</p>
          <p className="text-sm text-muted-foreground">
            Intenta ajustar tus filtros de búsqueda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tournaments.map((tournament) => (
        <Card
          key={tournament.id}
          className="hover-elevate overflow-hidden"
          data-testid={`card-tournament-${tournament.id}`}
        >
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-xl" data-testid={`text-tournament-name-${tournament.id}`}>
                {tournament.name}
              </CardTitle>
              <Badge variant={getStatusBadgeVariant(tournament.status)}>
                {getStatusLabel(tournament.status)}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{getTypeLabel(tournament.type)}</Badge>
              <Badge variant="secondary">{getGenderLabel(tournament.genderCategory)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(tournament.startDate)}
                  {tournament.endDate !== tournament.startDate &&
                    ` - ${formatDate(tournament.endDate)}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{tournament.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>Cuota: ${tournament.entryFee}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  Participantes: {tournament.maxParticipants} máx.
                </span>
              </div>
            </div>
            <Button
              asChild
              className="w-full"
              variant={
                tournament.status === "registration_open" ? "default" : "secondary"
              }
              data-testid={`button-view-tournament-${tournament.id}`}
            >
              <Link href={`/tournaments/${tournament.id}`}>
                {tournament.status === "registration_open"
                  ? "Registrarse"
                  : "Ver Detalles"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
