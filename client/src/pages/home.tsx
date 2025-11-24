import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, TrendingUp, Medal, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/table_tennis_tournament_hero_image.png";
import type { User, Tournament } from "@shared/schema";

export default function Home() {
  const { data: players = [] } = useQuery<User[]>({
    queryKey: ["/api/rankings"],
  });

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const topPlayers = players.slice(0, 5);
  const upcomingTournaments = tournaments
    .filter((t) => t.status === "registration_open" || t.status === "upcoming")
    .slice(0, 3);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
    
    if (startDate === endDate) {
      return start.toLocaleDateString("es-PR", options);
    }
    
    return `${start.toLocaleDateString("es-PR", { month: "long", day: "numeric" })} - ${end.toLocaleDateString("es-PR", { day: "numeric", year: "numeric" })}`;
  };

  const steps = [
    {
      icon: Users,
      title: "Regístrate",
      description: "Crea tu cuenta y completa tu perfil de jugador",
    },
    {
      icon: Trophy,
      title: "Únete a Torneos",
      description: "Explora y regístrate en las competencias próximas",
    },
    {
      icon: Medal,
      title: "Compite",
      description: "Juega partidos y registra tu rendimiento",
    },
    {
      icon: TrendingUp,
      title: "Escala en los Rankings",
      description: "Mejora tu rating y conviértete en campeón",
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Acción de torneo de tenis de mesa"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        </div>
        <div className="relative flex h-full items-center justify-center px-4">
          <div className="max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Únete a la Comunidad
              <br />
              Premier de Tenis de Mesa de Puerto Rico
            </h1>
            <p className="mb-8 text-lg text-white/90 md:text-xl">
              Compite en torneos, rastrea tus rankings y conecta con jugadores de toda la isla
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-primary hover-elevate active-elevate-2"
                data-testid="button-register"
              >
                <Link href="/register">Comenzar</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="backdrop-blur-sm bg-white/10 border-white/30 text-white hover-elevate active-elevate-2"
                data-testid="button-view-tournaments"
              >
                <Link href="/tournaments">Ver Torneos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Torneos Destacados</h2>
            <p className="text-muted-foreground">
              Regístrate ahora para las próximas competencias
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingTournaments.map((tournament) => (
              <Card key={tournament.id} className="hover-elevate" data-testid={`card-tournament-${tournament.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="mb-1">{tournament.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(tournament.startDate, tournament.endDate)}
                      </CardDescription>
                    </div>
                    <Badge variant={tournament.status === "registration_open" ? "default" : "secondary"}>
                      {tournament.status === "registration_open" ? "Abierto" : "Próximamente"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>{tournament.venue}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {tournament.type === "singles" ? "Individual" : "Dobles"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {tournament.genderCategory === "mixed" ? "Mixto" : 
                       tournament.genderCategory === "male" ? "Masculino" : "Femenino"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {tournament.maxParticipants} Jugadores
                    </Badge>
                  </div>
                  <Button
                    className="w-full"
                    variant={tournament.status === "registration_open" ? "default" : "secondary"}
                    asChild
                    data-testid={`button-register-tournament-${tournament.id}`}
                  >
                    <Link href={`/tournaments/${tournament.id}`}>
                      {tournament.status === "registration_open" ? "Registrarse" : "Ver Detalles"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline" size="lg" data-testid="button-view-all-tournaments">
              <Link href="/tournaments">Ver Todos los Torneos</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Top Jugadores</h2>
            <p className="text-muted-foreground">
              Los mejores competidores de Puerto Rico
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-5">
            {topPlayers.map((player, index) => (
              <Card key={player.id} className="hover-elevate" data-testid={`card-top-player-${index + 1}`}>
                <CardHeader className="text-center pb-3">
                  <div className="flex justify-center mb-3">
                    <Badge variant="secondary" className="font-mono text-sm">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="flex justify-center mb-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={player.photoUrl || undefined} alt={player.name} />
                      <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-base">{player.name}</CardTitle>
                  <CardDescription className="text-xs">{player.club}</CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <Badge className="font-mono">{player.rating}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline" size="lg" data-testid="button-view-full-rankings">
              <Link href="/rankings">Ver Rankings Completos</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Cómo Funciona</h2>
            <p className="text-muted-foreground">
              Tu camino hacia la competencia profesional
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center" data-testid={`step-${index + 1}`}>
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            ¿Listo para Competir?
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Únete a cientos de jugadores en la comunidad de tenis de mesa más activa de Puerto Rico
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              asChild
              data-testid="button-cta-register"
            >
              <Link href="/register">Crear Cuenta</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-transparent border-white/30 text-white hover-elevate active-elevate-2"
              data-testid="button-cta-learn-more"
            >
              <Link href="/about">Conoce Más</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
