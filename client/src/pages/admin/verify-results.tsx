import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, Trophy, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { matchStore } from "@/lib/matchStore";

export default function AdminVerifyResults() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState(matchStore.getMatches());
  const [rejectingMatchId, setRejectingMatchId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    setMatches(matchStore.getMatches());
  }, []);

  const pendingMatches = matches.filter(m => m.status === 'pending_verification');
  const verifiedMatches = matches.filter(m => m.status === 'verified');
  const rejectedMatches = matches.filter(m => m.status === 'rejected');

  const verifiedTodayCount = verifiedMatches.filter(m => {
    if (!m.verifiedAt) return false;
    const today = new Date();
    const verifiedDate = new Date(m.verifiedAt);
    return verifiedDate.toDateString() === today.toDateString();
  }).length;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const handleApprove = (matchId: string) => {
    if (!user) return;

    try {
      const updatedMatch = matchStore.approveResult(matchId, user.id);
      
      if (updatedMatch) {
        setMatches(matchStore.getMatches());
        
        toast({
          title: "✓ Resultado Aprobado",
          description: "El resultado ha sido verificado y los ratings se actualizarán.",
        });
      } else {
        throw new Error("No se pudo aprobar el resultado");
      }
    } catch (error) {
      console.error("Error aprobando resultado:", error);
      toast({
        title: "Error",
        description: "No se pudo aprobar el resultado.",
        variant: "destructive",
      });
    }
  };

  const handleReject = () => {
    if (!user || !rejectingMatchId || !rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Debes proporcionar una razón para rechazar el resultado.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedMatch = matchStore.rejectResult(rejectingMatchId, user.id, rejectReason);
      
      if (updatedMatch) {
        setMatches(matchStore.getMatches());
        
        toast({
          title: "Resultado Rechazado",
          description: "Los jugadores han sido notificados y pueden volver a ingresar el resultado.",
        });

        setRejectingMatchId(null);
        setRejectReason("");
      } else {
        throw new Error("No se pudo rechazar el resultado");
      }
    } catch (error) {
      console.error("Error rechazando resultado:", error);
      toast({
        title: "Error",
        description: "No se pudo rechazar el resultado.",
        variant: "destructive",
      });
    }
  };

  const MatchVerificationCard = ({ match }: { match: typeof matches[0] }) => {
    if (!match.result) return null;

    return (
      <Card className="mb-4" data-testid={`match-card-${match.id}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{match.tournamentName}</h3>
              <p className="text-sm text-muted-foreground">
                {match.stage === 'final' ? 'Final' : match.stage === 'semifinals' ? 'Semifinal' : 'Fase de Grupos'} • Mesa {match.mesa}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ingresado el {formatDate(match.result.enteredAt)}
              </p>
            </div>
            {match.status === 'pending_verification' && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <Clock className="h-3 w-3 mr-1" />
                Pendiente Verificación
              </Badge>
            )}
            {match.status === 'verified' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verificado
              </Badge>
            )}
            {match.status === 'rejected' && (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Rechazado
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Players and Result */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <Avatar className="w-16 h-16 mx-auto mb-2">
                <AvatarImage src={match.player1.photoURL} />
                <AvatarFallback>{getInitials(match.player1.name)}</AvatarFallback>
              </Avatar>
              <div className="font-semibold">{match.player1.name}</div>
              <div className="text-sm text-muted-foreground font-mono">
                Rating: {match.player1.rating}
              </div>
            </div>

            {/* Result */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-2xl font-bold mb-2 font-mono">
                {match.result.setsCount?.player1 || 0} - {match.result.setsCount?.player2 || 0}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {match.result.sets.map(s => `${s.player1}-${s.player2}`).join(', ')}
              </div>
              <Badge variant="default" className="bg-green-600">
                <Trophy className="h-3 w-3 mr-1" />
                Ganador: {match.result.winner === match.player1.id 
                  ? match.player1.name.split(' ')[0]
                  : match.player2.name.split(' ')[0]}
              </Badge>
            </div>

            <div className="text-center">
              <Avatar className="w-16 h-16 mx-auto mb-2">
                <AvatarImage src={match.player2.photoURL} />
                <AvatarFallback>{getInitials(match.player2.name)}</AvatarFallback>
              </Avatar>
              <div className="font-semibold">{match.player2.name}</div>
              <div className="text-sm text-muted-foreground font-mono">
                Rating: {match.player2.rating}
              </div>
            </div>
          </div>

          {/* Validation Info */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg mb-4">
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>{match.player1.name} validó su identidad</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(match.result.validatedBy[match.player1.id].timestamp)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>{match.player2.name} validó su identidad</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(match.result.validatedBy[match.player2.id].timestamp)}
                </span>
              </div>
            </div>
          </div>

          {/* Observations */}
          {match.result.observations && (
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mb-4">
              <p className="text-sm font-semibold mb-1">Observaciones:</p>
              <p className="text-sm text-muted-foreground">{match.result.observations}</p>
            </div>
          )}

          {/* Entered By */}
          <div className="text-sm text-muted-foreground mb-4">
            <p>
              Ingresado por: <span className="font-semibold">
                {match.result.enteredBy === match.player1.id 
                  ? match.player1.name 
                  : match.player2.name}
              </span>
            </p>
          </div>

          {/* Verification Info */}
          {match.status === 'verified' && match.verifiedAt && (
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg mb-4 border border-green-200">
              <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Verificado el {formatDate(match.verifiedAt)}
                </span>
              </div>
            </div>
          )}

          {/* Rejection Info */}
          {match.status === 'rejected' && match.rejectionReason && (
            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg mb-4 border border-red-200">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                Razón del Rechazo:
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {match.rejectionReason}
              </p>
              {match.rejectedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Rechazado el {formatDate(match.rejectedAt)}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {match.status === 'pending_verification' && (
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleApprove(match.id)}
                data-testid={`button-approve-${match.id}`}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                ✓ Aprobar Resultado
              </Button>
              <Button
                className="flex-1"
                variant="destructive"
                onClick={() => setRejectingMatchId(match.id)}
                data-testid={`button-reject-${match.id}`}
              >
                <XCircle className="mr-2 h-4 w-4" />
                ✗ Rechazar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Verificación de Resultados</h1>
        <p className="text-muted-foreground">
          Aprueba o rechaza los resultados reportados por los jugadores
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes de Verificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {pendingMatches.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verificados Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {verifiedTodayCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rechazados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {rejectedMatches.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pendientes ({pendingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verificados ({verifiedMatches.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rechazados ({rejectedMatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingMatches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay resultados pendientes</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Todos los resultados han sido verificados
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingMatches.map(match => <MatchVerificationCard key={match.id} match={match} />)
          )}
        </TabsContent>

        <TabsContent value="verified" className="mt-6">
          {verifiedMatches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay resultados verificados</p>
              </CardContent>
            </Card>
          ) : (
            verifiedMatches.map(match => <MatchVerificationCard key={match.id} match={match} />)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedMatches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay resultados rechazados</p>
              </CardContent>
            </Card>
          ) : (
            rejectedMatches.map(match => <MatchVerificationCard key={match.id} match={match} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectingMatchId !== null} onOpenChange={(open) => !open && setRejectingMatchId(null)}>
        <DialogContent data-testid="dialog-reject">
          <DialogHeader>
            <DialogTitle>Rechazar Resultado</DialogTitle>
            <DialogDescription>
              Indica la razón por la cual rechazas este resultado.
              El partido volverá a estado "pendiente" y los jugadores podrán volver a ingresar el resultado.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Ej: El resultado no coincide con la planilla física..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            className="mt-4"
            data-testid="textarea-reject-reason"
          />

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setRejectingMatchId(null);
                setRejectReason("");
              }}
              data-testid="button-cancel-reject"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              data-testid="button-confirm-reject"
            >
              Confirmar Rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
