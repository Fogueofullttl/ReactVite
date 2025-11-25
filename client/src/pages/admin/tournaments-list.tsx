import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllTournaments, type Tournament } from '@/lib/tournaments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Calendar, MapPin, Users, Trophy, Clock } from 'lucide-react';

export default function TournamentsList() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const data = await getAllTournaments();
      data.sort((a, b) => b.date.getTime() - a.date.getTime());
      setTournaments(data);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Tournament['status']) => {
    const config: Record<Tournament['status'], { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      'draft': { variant: 'secondary', label: 'Borrador' },
      'registration_open': { variant: 'default', label: 'Inscripciones Abiertas' },
      'registration_closed': { variant: 'outline', label: 'Inscripciones Cerradas' },
      'in_progress': { variant: 'default', label: 'En Progreso' },
      'completed': { variant: 'secondary', label: 'Completado' }
    };
    return config[status];
  };

  const getTournamentTypeLabel = (type: Tournament['type']) => {
    const labels: Record<Tournament['type'], string> = {
      'singles_male': 'Singles M',
      'singles_female': 'Singles F',
      'doubles_male': 'Dobles M',
      'doubles_female': 'Dobles F',
      'doubles_mixed': 'Dobles Mixto'
    };
    return labels[type];
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

      {loading ? (
        <div className="flex items-center justify-center h-64" data-testid="loading-state">
          <div className="text-lg text-muted-foreground">Cargando torneos...</div>
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
            const confirmedCount = tournament.registrations.filter(r => r.status === 'confirmed').length;
            
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
                            {format(tournament.date, 'PPP', { locale: es })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {tournament.time}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" data-testid={`tournament-type-${tournament.id}`}>
                            {getTournamentTypeLabel(tournament.type)}
                          </Badge>
                          <Badge variant="outline" data-testid={`tournament-category-${tournament.id}`}>
                            {tournament.category}
                          </Badge>
                          {tournament.config.groupStage.enabled && (
                            <Badge variant="outline">Fase de Grupos</Badge>
                          )}
                          {tournament.config.eliminationStage.enabled && (
                            <Badge variant="outline">Eliminacion</Badge>
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
                            {confirmedCount} / {tournament.registrations.length} inscritos
                          </span>
                        </div>
                        
                        {tournament.draw && tournament.draw.groups.length > 0 && (
                          <div className="text-sm text-blue-600 flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            {tournament.draw.groups.length} grupos
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
