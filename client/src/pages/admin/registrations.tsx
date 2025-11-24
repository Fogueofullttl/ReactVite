import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Medal, CheckCircle, XCircle, Clock, User, Calendar, DollarSign } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import type { TournamentRegistration, User as UserType, Tournament, PaymentStatus } from "@shared/schema";

type RegistrationWithDetails = TournamentRegistration & {
  player?: UserType;
  partner?: UserType;
  tournament?: Tournament;
  verifiedBy?: UserType;
};

export default function AdminRegistrations() {
  const { toast } = useToast();
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  const { data: registrations, isLoading } = useQuery<RegistrationWithDetails[]>({
    queryKey: ["/api/registrations"],
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) => {
      return await apiRequest("PATCH", `/api/registrations/${id}/verify`, {
        status,
        rejectionReason,
      });
    },
    onSuccess: () => {
      toast({
        title: "¡Actualización exitosa!",
        description: "El estado del registro ha sido actualizado.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVerify = (id: string) => {
    verifyMutation.mutate({ id, status: "verified" });
  };

  const handleReject = (id: string) => {
    const reason = rejectionReasons[id];
    if (!reason || reason.trim().length === 0) {
      toast({
        title: "Razón requerida",
        description: "Por favor indica la razón del rechazo",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate({ id, status: "rejected", rejectionReason: reason });
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case "verified":
        return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-3 w-3 mr-1" />Verificado</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-PR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Cargando registros...</div>
      </div>
    );
  }

  const pendingRegistrations = registrations?.filter((r) => r.paymentStatus === "pending") || [];
  const verifiedRegistrations = registrations?.filter((r) => r.paymentStatus === "verified") || [];
  const rejectedRegistrations = registrations?.filter((r) => r.paymentStatus === "rejected") || [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1e3a8a] border-b-3 border-[#3b82f6] pb-2 inline-block">
          Verificación de Pagos ATH Móvil
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona los registros de torneos y verifica los pagos de los jugadores
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRegistrations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedRegistrations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedRegistrations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Registrations Section */}
      {pendingRegistrations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#1e3a8a] mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pagos Pendientes de Verificación
          </h2>
          <div className="space-y-4">
            {pendingRegistrations.map((registration) => (
              <Card key={registration.id} className="border-l-4 border-l-yellow-500" data-testid={`card-registration-${registration.id}`}>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column - Registration Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">{registration.tournament?.name}</h3>
                        {getStatusBadge(registration.paymentStatus)}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#3b82f6]" />
                          <span className="font-medium">{registration.player?.name}</span>
                          <span className="text-muted-foreground font-mono">
                            ({registration.player?.memberNumber})
                          </span>
                        </div>

                        {registration.partner && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-[#3b82f6]" />
                            <span className="font-medium">{registration.partner.name}</span>
                            <Badge variant="outline" className="text-xs">Compañero</Badge>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#3b82f6]" />
                          <span className="text-muted-foreground">
                            Registrado: {formatDate(registration.registeredAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-[#3b82f6]" />
                          <span className="font-medium">${registration.tournament?.entryFee}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-2 border-[#3b82f6]">
                          <p className="text-xs text-muted-foreground mb-1">Código ATH Móvil (últimos 5 caracteres):</p>
                          <p className="text-2xl font-mono font-bold text-[#1e3a8a] dark:text-[#3b82f6]" data-testid={`text-ath-reference-${registration.id}`}>
                            {registration.athMovilReference}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Razón de rechazo (opcional)
                        </label>
                        <Textarea
                          placeholder="Escribe aquí si vas a rechazar este pago..."
                          value={rejectionReasons[registration.id] || ""}
                          onChange={(e) =>
                            setRejectionReasons({
                              ...rejectionReasons,
                              [registration.id]: e.target.value,
                            })
                          }
                          className="min-h-[100px]"
                          data-testid={`textarea-rejection-reason-${registration.id}`}
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleVerify(registration.id)}
                          disabled={verifyMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          data-testid={`button-verify-${registration.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verificar Pago
                        </Button>
                        <Button
                          onClick={() => handleReject(registration.id)}
                          disabled={verifyMutation.isPending}
                          variant="destructive"
                          className="flex-1"
                          data-testid={`button-reject-${registration.id}`}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Pending Registrations */}
      {pendingRegistrations.length === 0 && (
        <Alert>
          <Medal className="h-4 w-4" />
          <AlertDescription>
            No hay registros pendientes de verificación en este momento.
          </AlertDescription>
        </Alert>
      )}

      {/* Verified Registrations */}
      {verifiedRegistrations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-green-700 dark:text-green-500 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Pagos Verificados ({verifiedRegistrations.length})
          </h2>
          <div className="space-y-2">
            {verifiedRegistrations.map((registration) => (
              <Card key={registration.id} className="border-l-4 border-l-green-500">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{registration.player?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {registration.tournament?.name} • ATH: {registration.athMovilReference}
                      </p>
                    </div>
                    {getStatusBadge(registration.paymentStatus)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Registrations */}
      {rejectedRegistrations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-red-700 dark:text-red-500 mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Pagos Rechazados ({rejectedRegistrations.length})
          </h2>
          <div className="space-y-2">
            {rejectedRegistrations.map((registration) => (
              <Card key={registration.id} className="border-l-4 border-l-red-500">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{registration.player?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {registration.tournament?.name} • ATH: {registration.athMovilReference}
                      </p>
                    </div>
                    {getStatusBadge(registration.paymentStatus)}
                  </div>
                  {registration.rejectionReason && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription className="text-xs">
                        <strong>Razón:</strong> {registration.rejectionReason}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
