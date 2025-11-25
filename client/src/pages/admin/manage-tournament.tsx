import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { type Tournament, finalizeTournament } from '@/lib/tournaments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Users, Trophy, Calendar, MapPin, Clock, CheckCircle2, AlertCircle, Loader2, Flag, Edit2 } from 'lucide-react';

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
  registrations?: Array<{ 
    status: string; 
    playerId?: string;
    userId?: string | string[];
    registeredAt?: string;
    paymentCode?: string;
    paymentStatus?: string;
  }>;
  draw?: { groups: any[]; eliminationBracket?: { matchIds: string[]; round: string } };
}

export default function ManageTournament() {
  const [, params] = useRoute('/admin/tournaments/:id');
  const { toast } = useToast();
  
  const [generating, setGenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [finalizingTournament, setFinalizingTournament] = useState(false);
  const [editingGroups, setEditingGroups] = useState(false);

  const { data: tournament, isLoading: loading, error } = useQuery<TournamentFromAPI>({
    queryKey: ['/api/tournaments', params?.id],
    enabled: !!params?.id
  });

  const updateTournament = useMutation({
    mutationFn: async (updates: Partial<TournamentFromAPI>) => {
      return apiRequest('PATCH', `/api/tournaments/${params?.id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', params?.id] });
    }
  });

  const handleOpenRegistration = async () => {
    if (!params?.id) return;
    
    setActionLoading(true);
    try {
      await updateTournament.mutateAsync({ status: 'registration_open' });
      toast({ title: 'Inscripciones abiertas' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseRegistration = async () => {
    if (!params?.id) return;
    
    setActionLoading(true);
    try {
      await updateTournament.mutateAsync({ status: 'registration_closed' });
      toast({ title: 'Inscripciones cerradas' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRegistration = async (index: number) => {
    if (!params?.id || !tournament?.registrations) return;
    
    try {
      const updatedRegistrations = [...tournament.registrations];
      if (index >= 0 && index < updatedRegistrations.length) {
        updatedRegistrations[index] = { ...updatedRegistrations[index], status: 'confirmed' };
        await updateTournament.mutateAsync({ registrations: updatedRegistrations });
        toast({ title: 'Inscripcion confirmada' });
      }
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleGenerateDraw = async () => {
    if (!params?.id) return;
    
    setGenerating(true);
    try {
      await apiRequest('POST', `/api/tournaments/${params.id}/generate-draw`, {});
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', params?.id] });
      toast({ title: 'Sorteo generado exitosamente' });
    } catch (error: any) {
      toast({ title: error.message || 'Error al generar sorteo', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleFinalizeTournament = async () => {
    if (!params?.id) return;
    
    const confirmed = window.confirm(
      'Finalizar torneo y aplicar todos los cambios de rating? Esta accion no se puede deshacer.'
    );
    
    if (!confirmed) return;
    
    setFinalizingTournament(true);
    try {
      const result = await finalizeTournament(params.id);
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', params?.id] });
      
      toast({ 
        title: 'Torneo Finalizado',
        description: `Ratings actualizados para ${result.playersUpdated} jugadores`
      });
    } catch (error: any) {
      toast({ 
        title: 'Error',
        description: error.message || 'No se pudo finalizar el torneo',
        variant: 'destructive' 
      });
    } finally {
      setFinalizingTournament(false);
    }
  };

  const handleMovePlayer = async (playerId: string, fromGroupId: string, toGroupId: string) => {
    if (!params?.id || !tournament?.draw || fromGroupId === toGroupId) return;
    
    try {
      const newGroups = tournament.draw.groups.map(group => {
        if (group.groupId === fromGroupId) {
          return {
            ...group,
            participants: group.participants.filter((p: string) => p !== playerId)
          };
        }
        if (group.groupId === toGroupId) {
          return {
            ...group,
            participants: [...group.participants, playerId]
          };
        }
        return group;
      });
      
      await updateTournament.mutateAsync({ 
        draw: { 
          ...tournament.draw, 
          groups: newGroups 
        } 
      });
      
      toast({ title: 'Jugador movido exitosamente' });
    } catch (error) {
      toast({ title: 'Error al mover jugador', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      'draft': { variant: 'secondary', label: 'Borrador' },
      'registration_open': { variant: 'default', label: 'Inscripciones Abiertas' },
      'registration_closed': { variant: 'outline', label: 'Inscripciones Cerradas' },
      'in_progress': { variant: 'default', label: 'En Progreso' },
      'completed': { variant: 'secondary', label: 'Completado' }
    };
    return variants[status] || { variant: 'secondary', label: status };
  };

  const getTournamentTypeLabel = (type: string, genderCategory?: string) => {
    if (type === 'singles') {
      if (genderCategory === 'male') return 'Singles Masculino';
      if (genderCategory === 'female') return 'Singles Femenino';
      return 'Singles Mixto';
    }
    if (type === 'doubles') {
      if (genderCategory === 'male') return 'Dobles Masculino';
      if (genderCategory === 'female') return 'Dobles Femenino';
      return 'Dobles Mixto';
    }
    return type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="loading-state">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-muted-foreground">Cargando...</span>
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
  const tournamentDate = tournament.startDate ? new Date(tournament.startDate) : new Date();

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
              {format(tournamentDate, 'PPP', { locale: es })}
            </span>
            {tournament.endDate && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(tournament.endDate), 'PPP', { locale: es })}
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="outline" data-testid="badge-tournament-type">
              {getTournamentTypeLabel(tournament.type, tournament.genderCategory)}
            </Badge>
            {tournament.events && tournament.events.length > 0 && (
              <Badge variant="outline" data-testid="badge-tournament-events">
                {tournament.events.length} eventos
              </Badge>
            )}
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

          {tournament.status === 'in_progress' && (
            <Button 
              variant="destructive"
              onClick={handleFinalizeTournament}
              disabled={finalizingTournament}
              data-testid="button-finalize-tournament"
            >
              <Flag className="w-4 h-4 mr-2" />
              {finalizingTournament ? 'Finalizando...' : 'Finalizar Torneo y Aplicar Ratings'}
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
                          {reg.userId 
                            ? (Array.isArray(reg.userId) ? reg.userId.join(', ') : reg.userId)
                            : reg.playerId || 'ID no disponible'}
                        </div>
                        {reg.registeredAt && (
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(reg.registeredAt), 'PPp', { locale: es })}
                          </div>
                        )}
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
            <>
              <div className="mb-4 flex justify-end">
                <Button 
                  variant="outline"
                  onClick={() => setEditingGroups(!editingGroups)}
                  data-testid="button-toggle-edit-groups"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {editingGroups ? 'Terminar Edicion' : 'Editar Grupos'}
                </Button>
              </div>
              
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
                        {group.participants.map((playerId: string, idx: number) => (
                          <div 
                            key={playerId} 
                            className="p-2 border rounded flex items-center justify-between gap-2"
                            data-testid={`group-${group.groupId}-player-${idx}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                                {idx + 1}
                              </span>
                              <span className="font-mono text-sm">{playerId}</span>
                            </div>
                            
                            {editingGroups && (
                              <Select
                                value={group.groupId}
                                onValueChange={(newGroupId) => 
                                  handleMovePlayer(playerId, group.groupId, newGroupId)
                                }
                              >
                                <SelectTrigger className="w-24" data-testid={`select-move-${group.groupId}-${idx}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {groups.map(g => (
                                    <SelectItem key={g.groupId} value={g.groupId}>
                                      Grupo {g.groupId}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
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
            </>
          )}
        </TabsContent>

        <TabsContent value="bracket">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground" data-testid="empty-bracket">
              {groups.length > 0 ? (
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
