import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  getTournament, 
  openRegistration, 
  closeRegistration,
  confirmRegistration,
  generateDraw,
  type Tournament 
} from '@/lib/tournaments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Users, Trophy, Calendar, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ManageTournament() {
  const [, params] = useRoute('/admin/tournaments/:id');
  const { toast } = useToast();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTournament();
  }, [params?.id]);

  const loadTournament = async () => {
    if (!params?.id) return;
    
    try {
      const data = await getTournament(params.id);
      setTournament(data);
    } catch (error) {
      toast({ title: 'Error al cargar torneo', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRegistration = async () => {
    if (!tournament?.id) return;
    
    setActionLoading(true);
    try {
      await openRegistration(tournament.id);
      await loadTournament();
      toast({ title: 'Inscripciones abiertas' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseRegistration = async () => {
    if (!tournament?.id) return;
    
    setActionLoading(true);
    try {
      await closeRegistration(tournament.id);
      await loadTournament();
      toast({ title: 'Inscripciones cerradas' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRegistration = async (index: number) => {
    if (!tournament?.id) return;
    
    try {
      await confirmRegistration(tournament.id, index);
      await loadTournament();
      toast({ title: 'Inscripcion confirmada' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleGenerateDraw = async () => {
    if (!tournament?.id) return;
    
    setGenerating(true);
    try {
      await generateDraw(tournament.id);
      await loadTournament();
      toast({ title: 'Sorteo generado exitosamente' });
    } catch (error: any) {
      toast({ title: error.message || 'Error al generar sorteo', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status: Tournament['status']) => {
    const variants: Record<Tournament['status'], { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      'draft': { variant: 'secondary', label: 'Borrador' },
      'registration_open': { variant: 'default', label: 'Inscripciones Abiertas' },
      'registration_closed': { variant: 'outline', label: 'Inscripciones Cerradas' },
      'in_progress': { variant: 'default', label: 'En Progreso' },
      'completed': { variant: 'secondary', label: 'Completado' }
    };
    return variants[status];
  };

  const getTournamentTypeLabel = (type: Tournament['type']) => {
    const labels: Record<Tournament['type'], string> = {
      'singles_male': 'Singles Masculino',
      'singles_female': 'Singles Femenino',
      'doubles_male': 'Dobles Masculino',
      'doubles_female': 'Dobles Femenino',
      'doubles_mixed': 'Dobles Mixto'
    };
    return labels[type];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="loading-state">
        <div className="text-lg text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto p-6" data-testid="not-found-state">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Torneo no encontrado</p>
            <Link href="/admin/tournaments">
              <Button className="mt-4">Volver a Torneos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const registrations = tournament.registrations || [];
  const confirmedCount = registrations.filter(r => r.status === 'confirmed').length;
  const pendingCount = registrations.filter(r => r.status === 'pending').length;
  const statusBadge = getStatusBadge(tournament.status);
  const groups = tournament.draw?.groups || [];
  const eliminationMatchIds = tournament.draw?.eliminationBracket?.matchIds || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Link href="/admin/tournaments">
        <Button variant="ghost" className="mb-4" data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Torneos
        </Button>
      </Link>

      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-tournament-name">{tournament.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
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
          <div className="flex gap-2 mt-3">
            <Badge variant="outline" data-testid="badge-tournament-type">
              {getTournamentTypeLabel(tournament.type)}
            </Badge>
            <Badge variant="outline" data-testid="badge-tournament-category">
              {tournament.category}
            </Badge>
          </div>
        </div>
        
        <Badge 
          variant={statusBadge.variant}
          className="text-sm px-3 py-1"
          data-testid="badge-tournament-status"
        >
          {statusBadge.label}
        </Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle data-testid="card-header-actions">Acciones</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {tournament.status === 'draft' && (
            <Button 
              onClick={handleOpenRegistration}
              disabled={actionLoading}
              data-testid="button-open-registration"
            >
              Abrir Inscripciones
            </Button>
          )}
          
          {tournament.status === 'registration_open' && (
            <Button 
              onClick={handleCloseRegistration} 
              variant="outline"
              disabled={actionLoading}
              data-testid="button-close-registration"
            >
              Cerrar Inscripciones
            </Button>
          )}
          
          {tournament.status === 'registration_closed' && !tournament.draw && (
            <Button 
              onClick={handleGenerateDraw}
              disabled={confirmedCount === 0 || generating}
              data-testid="button-generate-draw"
            >
              {generating ? 'Generando...' : 'Generar Sorteo'}
            </Button>
          )}
          
          {groups.length > 0 && (
            <Button variant="outline" data-testid="button-view-brackets">
              <Trophy className="w-4 h-4 mr-2" />
              Ver Cuadros
            </Button>
          )}

          {confirmedCount === 0 && tournament.status === 'registration_closed' && (
            <p className="text-sm text-muted-foreground flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              Confirma al menos una inscripcion para generar el sorteo
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inscritos Confirmados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="stat-confirmed">
              {confirmedCount}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600" data-testid="stat-pending">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Grupos Generados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600" data-testid="stat-groups">
              {groups.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="registrations" data-testid="tabs-container">
        <TabsList className="mb-4">
          <TabsTrigger value="registrations" data-testid="tab-registrations">
            <Users className="w-4 h-4 mr-2" />
            Inscripciones ({registrations.length})
          </TabsTrigger>
          <TabsTrigger value="groups" data-testid="tab-groups">
            Grupos ({groups.length})
          </TabsTrigger>
          <TabsTrigger value="bracket" data-testid="tab-bracket">
            Eliminacion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registrations">
          <Card>
            <CardContent className="pt-6">
              {registrations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8" data-testid="empty-registrations">
                  No hay inscripciones todavia
                </p>
              ) : (
                <div className="space-y-3">
                  {registrations.map((reg, index) => (
                    <div 
                      key={index}
                      className="flex flex-wrap justify-between items-center gap-3 p-4 border rounded-lg"
                      data-testid={`registration-item-${index}`}
                    >
                      <div>
                        <div className="font-semibold font-mono">
                          {Array.isArray(reg.userId) ? reg.userId.join(', ') : reg.userId}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(reg.registeredAt, 'PPp', { locale: es })}
                        </div>
                        {reg.paymentCode && (
                          <div className="text-sm text-muted-foreground">
                            Codigo ATH: <span className="font-mono">{reg.paymentCode}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={reg.status === 'confirmed' ? 'default' : 'secondary'}
                          data-testid={`badge-registration-status-${index}`}
                        >
                          {reg.status === 'confirmed' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Confirmado
                            </>
                          ) : (
                            'Pendiente'
                          )}
                        </Badge>
                        
                        {reg.status === 'pending' && (
                          <Button 
                            size="sm"
                            onClick={() => handleConfirmRegistration(index)}
                            data-testid={`button-confirm-registration-${index}`}
                          >
                            Confirmar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          {groups.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground" data-testid="empty-groups">
                Genera el sorteo para ver los grupos
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <Card key={group.groupId} data-testid={`group-card-${group.groupId}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-blue-600" />
                      Grupo {group.groupId}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {group.participants.map((playerId, idx) => (
                        <div 
                          key={playerId} 
                          className="p-2 border rounded flex items-center gap-2"
                          data-testid={`group-${group.groupId}-player-${idx}`}
                        >
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                            {idx + 1}
                          </span>
                          <span className="font-mono text-sm">{playerId}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {group.matchIds.length} partidos programados
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bracket">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground" data-testid="empty-bracket">
              {tournament.config.groupStage.enabled ? (
                'Los brackets se generan despues de completar la fase de grupos'
              ) : eliminationMatchIds.length > 0 ? (
                <div>
                  <p className="mb-4">Ronda: {tournament.draw?.eliminationBracket?.round || 'Por determinar'}</p>
                  <p>{eliminationMatchIds.length} partidos en eliminacion directa</p>
                </div>
              ) : (
                'Genera el sorteo para ver la fase de eliminacion'
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
