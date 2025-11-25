import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Tournament } from '@/lib/tournaments';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Calendar, MapPin, Users, Trophy, Clock, Loader2 } from 'lucide-react';

interface TournamentFromAPI {
  id: string;
  name: string;
  type: string;
  genderCategory?: string;
  events?: string[];
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  venue: string;
  entryFee?: number;
  maxParticipants?: number;
  status: string;
  createdBy?: string;
  registrations?: Array<{ status: string }>;
  draw?: { groups: any[] };
}

export default function TournamentsList() {
  const { data: tournaments = [], isLoading } = useQuery<TournamentFromAPI[]>({
    queryKey: ['/api/tournaments']
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      'draft': { variant: 'secondary', label: 'Borrador' },
      'registration_open': { variant: 'default', label: 'Inscripciones Abiertas' },
      'registration_closed': { variant: 'outline', label: 'Inscripciones Cerradas' },
      'in_progress': { variant: 'default', label: 'En Progreso' },
      'completed': { variant: 'secondary', label: 'Completado' }
    };
    return config[status] || { variant: 'secondary', label: status };
  };

  const getTournamentTypeLabel = (type: string, genderCategory?: string) => {
    if (type === 'singles') {
      if (genderCategory === 'male') return 'Singles M';
      if (genderCategory === 'female') return 'Singles F';
      return 'Singles Mixto';
    }
    if (type === 'doubles') {
      if (genderCategory === 'male') return 'Dobles M';
      if (genderCategory === 'female') return 'Dobles F';
      return 'Dobles Mixto';
    }
    return type;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Gestion de Torneos</h1>
          <p className="text-muted-foreground mt-1">Administra todos los torneos de la federacion</p>
        </div>
        <Link href="/admin/tournaments/create">
          <Button data-testid="button-create-tournament">
            <Plus className="w-4 h-4 mr-2" />
            Crear Torneo
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64" data-testid="loading-state">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg text-muted-foreground">Cargando torneos...</span>
        </div>
      ) : tournaments.length === 0 ? (
        <Card data-testid="empty-state">
          <CardContent className="py-12 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-4">No hay torneos creados todavia</p>
            <Link href="/admin/tournaments/create">
              <Button data-testid="button-create-first-tournament">
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Torneo
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4" data-testid="tournaments-list">
          {tournaments.map((tournament) => {
            const statusBadge = getStatusBadge(tournament.status);
            const registrations = tournament.registrations || [];
            const confirmedCount = registrations.filter(r => r.status === 'confirmed').length;
            const tournamentDate = tournament.startDate ? new Date(tournament.startDate) : new Date();
            const groups = tournament.draw?.groups || [];
            
            return (
              <Link key={tournament.id} href={`/admin/tournaments/${tournament.id}`}>
                <Card 
                  className="hover-elevate cursor-pointer transition-all"
                  data-testid={`tournament-card-${tournament.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="text-xl font-bold mb-2 truncate"
                          data-testid={`tournament-name-${tournament.id}`}
                        >
                          {tournament.name}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {tournament.venue}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(tournamentDate, 'PPP', { locale: es })}
                          </span>
                          {tournament.maxParticipants && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              Max: {tournament.maxParticipants}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" data-testid={`tournament-type-${tournament.id}`}>
                            {getTournamentTypeLabel(tournament.type, tournament.genderCategory)}
                          </Badge>
                          {tournament.events && tournament.events.length > 0 && (
                            <Badge variant="outline">
                              {tournament.events.length} eventos
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-2">
                        <Badge 
                          variant={statusBadge.variant}
                          data-testid={`tournament-status-${tournament.id}`}
                        >
                          {statusBadge.label}
                        </Badge>
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span data-testid={`tournament-registrations-${tournament.id}`}>
                            {confirmedCount} / {registrations.length} inscritos
                          </span>
                        </div>
                        
                        {groups.length > 0 && (
                          <div className="text-sm text-blue-600 flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            {groups.length} grupos
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
