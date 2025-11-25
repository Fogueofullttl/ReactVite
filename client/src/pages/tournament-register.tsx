import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Users, AlertCircle, CheckCircle } from "lucide-react";
import type { Tournament, User } from "@shared/schema";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

const registerSchema = z.object({
  playerId: z.string().min(1, "Debes seleccionar un jugador"),
  events: z.array(z.string()).min(1, "Debes seleccionar al menos un evento"),
  athMovilReference: z
    .string()
    .length(5, "Debe ser exactamente 5 caracteres")
    .regex(/^[A-Z0-9]+$/, "Solo letras mayúsculas y números"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function TournamentRegister() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: tournament, isLoading: tournamentLoading } = useQuery<Tournament>({
    queryKey: [`/api/tournaments/${id}`],
  });

  // TODO: Replace with real authenticated user
  // For now, get first player from rankings
  const { data: players } = useQuery<User[]>({
    queryKey: ["/api/rankings"],
  });

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      playerId: "",
      events: [],
      athMovilReference: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      return await apiRequest("POST", `/api/tournaments/${id}/register`, {
        playerId: data.playerId,
        events: data.events,
        athMovilReference: data.athMovilReference,
      });
    },
    onSuccess: () => {
      toast({
        title: "¡Registro exitoso!",
        description: "Tu registro está pendiente de verificación del pago ATH Móvil.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${id}`] });
      navigate(`/tournaments/${id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al registrarse",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    console.log("Form data being submitted:", data);
    console.log("Events value:", data.events);
    // Ensure athMovilReference is uppercase
    const submissionData = {
      ...data,
      athMovilReference: data.athMovilReference.toUpperCase(),
    };
    console.log("Submission data:", submissionData);
    registerMutation.mutate(submissionData);
  };

  if (tournamentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Cargando torneo...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Torneo no encontrado</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <Button
          asChild
          variant="ghost"
          className="mb-4"
          data-testid="button-back"
        >
          <Link href={`/tournaments/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al torneo
          </Link>
        </Button>

        <h1 className="text-3xl font-bold text-[#1e3a8a] border-b-3 border-[#3b82f6] pb-2 inline-block">
          Registrarse al Torneo
        </h1>
      </div>

      {/* Tournament Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{tournament.name}</CardTitle>
          <CardDescription>
            {new Date(tournament.startDate).toLocaleDateString("es-PR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sede:</span>
              <span className="font-medium">{tournament.venue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <span className="font-medium">
                {tournament.type === "singles" ? "Individual" : "Dobles"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cuota de inscripción:</span>
              <span className="font-bold text-lg text-[#1e3a8a]">${tournament.entryFee}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card className="mb-6 border-[#3b82f6]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Instrucciones de Pago ATH Móvil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#3b82f6] text-white text-xs font-bold">
                1
              </span>
              <span>Abre ATH Móvil y selecciona <strong>Business / FPRTM</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#3b82f6] text-white text-xs font-bold">
                2
              </span>
              <span>
                En el campo <strong>"Add a message"</strong>, indica tu nombre completo
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#3b82f6] text-white text-xs font-bold">
                3
              </span>
              <span>Envía el pago de <strong>${tournament.entryFee}</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#3b82f6] text-white text-xs font-bold">
                4
              </span>
              <span>
                En la pantalla de confirmación, oprime <strong>"View details / Ver detalles"</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#3b82f6] text-white text-xs font-bold">
                5
              </span>
              <span>
                Copia los <strong>últimos 5 caracteres</strong> del <strong>Reference Number / Número de referencia</strong> y pégalos abajo
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Confirmar Registro</CardTitle>
          <CardDescription>
            Ingresa los últimos 5 caracteres de tu número de referencia de ATH Móvil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="playerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jugador</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-player">
                          <SelectValue placeholder="Selecciona tu nombre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {players?.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name} ({player.memberNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      TODO: Este campo será automático cuando implementemos autenticación.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="events"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Eventos</FormLabel>
                      <FormDescription>
                        Selecciona los eventos a los que deseas inscribirte
                      </FormDescription>
                    </div>
                    {tournament.events?.map((event) => (
                      <div
                        key={event}
                        className="flex flex-row items-start space-x-3 space-y-0 mb-3"
                      >
                        <Checkbox
                          data-testid={`checkbox-event-${event}`}
                          checked={Array.isArray(field.value) && field.value.includes(event)}
                          onCheckedChange={(checked) => {
                            const currentValue = Array.isArray(field.value) ? field.value : [];
                            const newValue = checked
                              ? [...currentValue, event]
                              : currentValue.filter((value) => value !== event);
                            console.log("Checkbox changed:", event, "checked:", checked, "newValue:", newValue);
                            field.onChange(newValue);
                          }}
                        />
                        <label className="font-normal cursor-pointer text-sm" onClick={() => {
                          const currentValue = Array.isArray(field.value) ? field.value : [];
                          const isChecked = currentValue.includes(event);
                          const newValue = isChecked
                            ? currentValue.filter((value) => value !== event)
                            : [...currentValue, event];
                          field.onChange(newValue);
                        }}>
                          {event}
                        </label>
                      </div>
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="athMovilReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Últimos 5 caracteres del Reference Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ej: A1B2C"
                        maxLength={5}
                        className="uppercase font-mono text-lg"
                        data-testid="input-ath-reference"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      Solo letras mayúsculas y números. Exactamente 5 caracteres.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Tu registro será revisado por un administrador. Recibirás una notificación
                  cuando tu pago sea verificado.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/tournaments/${id}`)}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="bg-[#3b82f6] hover:bg-[#1e3a8a]"
                  data-testid="button-submit-registration"
                >
                  {registerMutation.isPending ? "Registrando..." : "Confirmar Registro"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
