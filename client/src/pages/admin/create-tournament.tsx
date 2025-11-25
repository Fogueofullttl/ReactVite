import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { createTournament } from '@/lib/tournaments';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateTournament() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    venue: '',
    date: '',
    time: '12:00',
    type: 'singles_male' as const,
    category: 'Open',
    maxParticipants: '',
    registrationDeadline: '',
    participationFee: '0',
    requiresActiveMembership: true,
    drawType: 'automatic' as const,
    groupStageEnabled: true,
    playersPerGroup: '4',
    advancePerGroup: '2',
    eliminationEnabled: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ 
        title: 'Error', 
        description: 'Debes estar autenticado para crear un torneo',
        variant: 'destructive' 
      });
      return;
    }
    
    if (!formData.date || !formData.registrationDeadline) {
      toast({
        title: 'Fechas requeridas',
        description: 'Debes proporcionar tanto la fecha del torneo como la fecha límite de inscripción',
        variant: 'destructive'
      });
      return;
    }
    
    const tournamentDate = new Date(formData.date);
    const registrationDeadline = new Date(formData.registrationDeadline);
    
    if (isNaN(tournamentDate.getTime())) {
      toast({
        title: 'Fecha inválida',
        description: 'La fecha del torneo no es válida',
        variant: 'destructive'
      });
      return;
    }
    
    if (isNaN(registrationDeadline.getTime())) {
      toast({
        title: 'Fecha inválida',
        description: 'La fecha límite de inscripción no es válida',
        variant: 'destructive'
      });
      return;
    }
    
    if (registrationDeadline >= tournamentDate) {
      toast({
        title: 'Error de fechas',
        description: 'La fecha límite de inscripción debe ser antes de la fecha del torneo',
        variant: 'destructive'
      });
      return;
    }
    
    const maxParticipants = formData.maxParticipants ? parseInt(formData.maxParticipants) : null;
    if (maxParticipants !== null && (isNaN(maxParticipants) || maxParticipants < 1)) {
      toast({
        title: 'Valor inválido',
        description: 'El límite de participantes debe ser un número positivo',
        variant: 'destructive'
      });
      return;
    }
    
    const participationFee = parseFloat(formData.participationFee);
    if (isNaN(participationFee) || participationFee < 0) {
      toast({
        title: 'Valor inválido',
        description: 'La cuota de participación debe ser un número no negativo',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tournamentId = await createTournament({
        name: formData.name,
        venue: formData.venue,
        date: tournamentDate,
        time: formData.time,
        status: 'draft',
        type: formData.type,
        category: formData.category,
        config: {
          maxParticipants,
          registrationDeadline,
          participationFee,
          requiresActiveMembership: formData.requiresActiveMembership,
          drawType: formData.drawType,
          groupStage: {
            enabled: formData.groupStageEnabled,
            playersPerGroup: parseInt(formData.playersPerGroup) as 3 | 4 | 5,
            advancePerGroup: parseInt(formData.advancePerGroup) as 1 | 2 | 3 | 4
          },
          eliminationStage: {
            enabled: formData.eliminationEnabled,
            format: 'single_elimination'
          }
        },
        registrations: [],
        draw: null,
        director: null,
        createdBy: user.id
      });

      toast({ 
        title: 'Torneo creado exitosamente',
        description: `El torneo "${formData.name}" ha sido creado como borrador`
      });
      navigate(`/admin/tournaments/${tournamentId}`);
      
    } catch (error: any) {
      console.error('Error al crear torneo:', error);
      toast({ 
        title: 'Error al crear torneo', 
        description: error?.message || 'Hubo un problema al crear el torneo. Intenta de nuevo.',
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6" data-testid="text-title">Crear Nuevo Torneo</h1>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader data-testid="card-header-general">
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre del Torneo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Campeonato Nacional 2025"
                  required
                  data-testid="input-name"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Tipo de Torneo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger id="type" data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="singles_male">Singles Masculino</SelectItem>
                    <SelectItem value="singles_female">Singles Femenino</SelectItem>
                    <SelectItem value="doubles_male">Dobles Masculino</SelectItem>
                    <SelectItem value="doubles_female">Dobles Femenino</SelectItem>
                    <SelectItem value="doubles_mixed">Dobles Mixtos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger id="category" data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="U13">Sub-13</SelectItem>
                    <SelectItem value="U18">Sub-18</SelectItem>
                    <SelectItem value="Open">Abierto</SelectItem>
                    <SelectItem value="Elite">Elite</SelectItem>
                    <SelectItem value="Senior">Senior (+40)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="venue">Sede *</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  placeholder="Coliseo, dirección"
                  required
                  data-testid="input-venue"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                  data-testid="input-date"
                />
              </div>

              <div>
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  data-testid="input-time"
                />
              </div>

              <div>
                <Label htmlFor="registrationDeadline">Fecha Límite Inscripción *</Label>
                <Input
                  id="registrationDeadline"
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                  required
                  data-testid="input-registration-deadline"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader data-testid="card-header-registration">
            <CardTitle>Configuración de Inscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxParticipants">Límite de Participantes</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                  placeholder="Dejar vacío para sin límite"
                  data-testid="input-max-participants"
                />
              </div>

              <div>
                <Label htmlFor="participationFee">Cuota de Participación ($)</Label>
                <Input
                  id="participationFee"
                  type="number"
                  step="0.01"
                  value={formData.participationFee}
                  onChange={(e) => setFormData({...formData, participationFee: e.target.value})}
                  data-testid="input-participation-fee"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresActiveMembership"
                checked={formData.requiresActiveMembership}
                onCheckedChange={(checked) => 
                  setFormData({...formData, requiresActiveMembership: checked as boolean})
                }
                data-testid="checkbox-requires-membership"
              />
              <Label htmlFor="requiresActiveMembership">Requiere membresía activa</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader data-testid="card-header-format">
            <CardTitle>Formato de Competencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="drawType">Tipo de Sorteo</Label>
              <Select
                value={formData.drawType}
                onValueChange={(value: any) => setFormData({...formData, drawType: value})}
              >
                <SelectTrigger id="drawType" data-testid="select-draw-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automático (por ranking)</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="groupStageEnabled"
                  checked={formData.groupStageEnabled}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, groupStageEnabled: checked as boolean})
                  }
                  data-testid="checkbox-group-stage"
                />
                <Label htmlFor="groupStageEnabled" className="font-semibold">Fase de Grupos (Round Robin)</Label>
              </div>

              {formData.groupStageEnabled && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label htmlFor="playersPerGroup">Jugadores por Grupo</Label>
                    <Select
                      value={formData.playersPerGroup}
                      onValueChange={(value) => setFormData({...formData, playersPerGroup: value})}
                    >
                      <SelectTrigger id="playersPerGroup" data-testid="select-players-per-group">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 jugadores</SelectItem>
                        <SelectItem value="4">4 jugadores</SelectItem>
                        <SelectItem value="5">5 jugadores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="advancePerGroup">Clasifican por Grupo</Label>
                    <Select
                      value={formData.advancePerGroup}
                      onValueChange={(value) => setFormData({...formData, advancePerGroup: value})}
                    >
                      <SelectTrigger id="advancePerGroup" data-testid="select-advance-per-group">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Top 1</SelectItem>
                        <SelectItem value="2">Top 2</SelectItem>
                        <SelectItem value="3">Top 3</SelectItem>
                        <SelectItem value="4">Todos (Top 4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 border-t pt-4">
              <Checkbox
                id="eliminationEnabled"
                checked={formData.eliminationEnabled}
                onCheckedChange={(checked) => 
                  setFormData({...formData, eliminationEnabled: checked as boolean})
                }
                data-testid="checkbox-elimination-stage"
              />
              <Label htmlFor="eliminationEnabled" className="font-semibold">Fase de Eliminación</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isSubmitting}
            data-testid="button-create-tournament"
          >
            {isSubmitting ? 'Creando...' : 'Crear Torneo'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="lg" 
            onClick={() => navigate('/admin/tournaments')}
            data-testid="button-cancel"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
