import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Search, Plus, Trophy, Clock } from "lucide-react";
import { Link } from "wouter";
import type { Tournament } from "@shared/schema";

export default function Tournaments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "registration_open":
        return "INSCRIPCIÓN ABIERTA";
      case "upcoming":
        return "PRÓXIMAMENTE";
      case "in_progress":
        return "EN CURSO";
      case "completed":
        return "FINALIZADO";
      default:
        return status.toUpperCase();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registration_open":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-PR", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString("es-PR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Filter only by search query first
  const filteredBySearch = tournaments.filter((tournament) => {
    return tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.venue.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Group the search-filtered tournaments by status
  const groupedByStatus = {
    all: filteredBySearch,
    registration_open: filteredBySearch.filter((t) => t.status === "registration_open"),
    upcoming: filteredBySearch.filter((t) => t.status === "upcoming"),
    in_progress: filteredBySearch.filter((t) => t.status === "in_progress"),
    completed: filteredBySearch.filter((t) => t.status === "completed"),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Cargando torneos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-[3px] border-blue-600">
        <div>
          <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2" data-testid="text-page-title">
            Torneos FPTM
          </h1>
          <p className="text-gray-600">
            Explora y regístrate en torneos de tenis de mesa
          </p>
        </div>
        <Button 
          asChild 
          className="bg-[#3b82f6] hover:bg-[#2563eb]"
          data-testid="button-create-tournament"
        >
          <Link href="/tournaments/create">
            <Plus className="mr-2 h-4 w-4" />
            Crear Torneo
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar torneos por nombre o sede..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base border-2"
            data-testid="input-search-tournaments"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white border-2 border-gray-200 p-1 h-auto">
          <TabsTrigger 
            value="all" 
            data-testid="tab-all"
            className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white font-semibold py-3"
          >
            Todos ({groupedByStatus.all.length})
          </TabsTrigger>
          <TabsTrigger 
            value="registration_open" 
            data-testid="tab-open"
            className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white font-semibold py-3"
          >
            Abiertos ({groupedByStatus.registration_open.length})
          </TabsTrigger>
          <TabsTrigger 
            value="upcoming" 
            data-testid="tab-upcoming"
            className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white font-semibold py-3"
          >
            Próximos ({groupedByStatus.upcoming.length})
          </TabsTrigger>
          <TabsTrigger 
            value="in_progress" 
            data-testid="tab-in-progress"
            className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white font-semibold py-3"
          >
            En Curso ({groupedByStatus.in_progress.length})
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            data-testid="tab-completed"
            className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white font-semibold py-3"
          >
            Finalizados ({groupedByStatus.completed.length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(groupedByStatus).map(([status, tournamentList]) => (
          <TabsContent key={status} value={status} className="mt-6">
            <TournamentList 
              tournaments={tournamentList}
              getStatusLabel={getStatusLabel}
              getStatusColor={getStatusColor}
              getTypeLabel={getTypeLabel}
              getGenderLabel={getGenderLabel}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface TournamentListProps {
  tournaments: Tournament[];
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
  getTypeLabel: (type: string) => string;
  getGenderLabel: (gender: string) => string;
  formatDate: (date: string | Date) => string;
  formatTime: (date: string | Date) => string;
}

function TournamentList({ 
  tournaments, 
  getStatusLabel, 
  getStatusColor, 
  getTypeLabel, 
  getGenderLabel, 
  formatDate, 
  formatTime 
}: TournamentListProps) {
  if (tournaments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 flex flex-col items-center justify-center">
        <Trophy className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-xl font-medium text-gray-700">No se encontraron torneos</p>
        <p className="text-sm text-gray-500 mt-2">
          Intenta ajustar tus filtros de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tournaments.map((tournament) => (
        <div
          key={tournament.id}
          data-testid={`card-tournament-${tournament.id}`}
          className="bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-[#3b82f6] transition-all duration-300"
        >
          {/* Status Badge */}
          <div className="px-6 pt-4">
            <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold ${getStatusColor(tournament.status)}`}>
              {getStatusLabel(tournament.status)}
            </span>
          </div>

          {/* Tournament Info */}
          <div className="px-6 py-4">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Column - Main Info */}
              <div className="md:col-span-2 space-y-3">
                <h3 
                  className="text-2xl font-bold text-[#1e3a8a]"
                  data-testid={`text-tournament-name-${tournament.id}`}
                >
                  {tournament.name}
                </h3>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#3b82f6]" />
                    <span className="font-medium">{formatDate(tournament.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#3b82f6]" />
                    <span className="font-medium">{formatTime(tournament.startDate)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="inline-block px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-medium text-gray-700">
                    {getTypeLabel(tournament.type)} - {getGenderLabel(tournament.genderCategory)}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-[#3b82f6] flex-shrink-0" />
                    <span>{tournament.venue}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#3b82f6]" />
                    <span>
                      {tournament.maxParticipants} participantes máx. • Cuota: ${tournament.entryFee}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column - Action Buttons */}
              <div className="flex flex-col gap-3 justify-end">
                <Button
                  asChild
                  className="bg-[#6b7280] hover:bg-[#4b5563] text-white font-semibold"
                  data-testid={`button-draws-${tournament.id}`}
                >
                  <Link href={`/tournaments/${tournament.id}/draws`}>
                    DRAWS
                  </Link>
                </Button>
                
                <Button
                  asChild
                  className="bg-[#6b7280] hover:bg-[#4b5563] text-white font-semibold"
                  data-testid={`button-players-${tournament.id}`}
                >
                  <Link href={`/tournaments/${tournament.id}/players`}>
                    JUGADORES
                  </Link>
                </Button>

                {tournament.status === "registration_open" && (
                  <Button
                    asChild
                    className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold"
                    data-testid={`button-register-${tournament.id}`}
                  >
                    <Link href={`/tournaments/${tournament.id}/register`}>
                      INSCRIBIRSE
                    </Link>
                  </Button>
                )}

                <Button
                  asChild
                  variant="outline"
                  className="border-2 border-[#3b82f6] text-[#3b82f6] hover:bg-[#eff6ff] font-semibold"
                  data-testid={`button-view-tournament-${tournament.id}`}
                >
                  <Link href={`/tournaments/${tournament.id}`}>
                    VER DETALLES
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
