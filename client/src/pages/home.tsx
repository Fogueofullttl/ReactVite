import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, TrendingUp, Medal, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/table_tennis_tournament_hero_image.png";

export default function Home() {
  const topPlayers = [
    { rank: 1, name: "Carlos Rivera", rating: 1850, club: "San Juan TT", wins: 45, photoUrl: null },
    { rank: 2, name: "María González", rating: 1820, club: "Ponce Club", wins: 42, photoUrl: null },
    { rank: 3, name: "José Martínez", rating: 1795, club: "Mayagüez TT", wins: 38, photoUrl: null },
    { rank: 4, name: "Ana Rodríguez", rating: 1770, club: "Caguas TT", wins: 35, photoUrl: null },
    { rank: 5, name: "Luis Torres", rating: 1745, club: "San Juan TT", wins: 32, photoUrl: null },
  ];

  const upcomingTournaments = [
    {
      id: 1,
      name: "Puerto Rico Open 2025",
      date: "January 15-17, 2025",
      venue: "Centro de Convenciones, San Juan",
      type: "Singles",
      category: "Mixed",
      participants: 32,
      maxParticipants: 64,
      status: "registration_open",
    },
    {
      id: 2,
      name: "Doubles Championship",
      date: "February 5-6, 2025",
      venue: "Coliseo Municipal, Ponce",
      type: "Doubles",
      category: "Mixed",
      participants: 16,
      maxParticipants: 32,
      status: "registration_open",
    },
    {
      id: 3,
      name: "Women's Invitational",
      date: "February 20, 2025",
      venue: "Club Deportivo, Mayagüez",
      type: "Singles",
      category: "Female",
      participants: 12,
      maxParticipants: 24,
      status: "upcoming",
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const steps = [
    {
      icon: Users,
      title: "Register",
      description: "Create your account and complete your player profile",
    },
    {
      icon: Trophy,
      title: "Join Tournaments",
      description: "Browse and register for upcoming competitions",
    },
    {
      icon: Medal,
      title: "Compete",
      description: "Play matches and track your performance",
    },
    {
      icon: TrendingUp,
      title: "Climb Rankings",
      description: "Improve your rating and become a champion",
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Table tennis tournament action"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        </div>
        <div className="relative flex h-full items-center justify-center px-4">
          <div className="max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Join Puerto Rico's Premier
              <br />
              Table Tennis Community
            </h1>
            <p className="mb-8 text-lg text-white/90 md:text-xl">
              Compete in tournaments, track your rankings, and connect with players across the island
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-primary hover-elevate active-elevate-2"
                data-testid="button-register"
              >
                <Link href="/register">Get Started</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="backdrop-blur-sm bg-white/10 border-white/30 text-white hover-elevate active-elevate-2"
                data-testid="button-view-tournaments"
              >
                <Link href="/tournaments">View Tournaments</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Featured Tournaments</h2>
            <p className="text-muted-foreground">
              Register now for upcoming competitions
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
                        {tournament.date}
                      </CardDescription>
                    </div>
                    <Badge variant={tournament.status === "registration_open" ? "default" : "secondary"}>
                      {tournament.status === "registration_open" ? "Open" : "Upcoming"}
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
                      {tournament.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {tournament.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {tournament.participants}/{tournament.maxParticipants} Players
                    </Badge>
                  </div>
                  <Button
                    className="w-full"
                    variant={tournament.status === "registration_open" ? "default" : "secondary"}
                    asChild
                    data-testid={`button-register-tournament-${tournament.id}`}
                  >
                    <Link href={`/tournaments/${tournament.id}`}>
                      {tournament.status === "registration_open" ? "Register Now" : "View Details"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Top Ranked Players</h2>
            <p className="text-muted-foreground">
              Current leaders in the singles category
            </p>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {topPlayers.map((player) => (
                  <div
                    key={player.rank}
                    className="flex items-center gap-4 p-4 hover-elevate"
                    data-testid={`row-player-${player.rank}`}
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 font-bold text-primary">
                      #{player.rank}
                    </div>
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={player.photoUrl || undefined} />
                      <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{player.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{player.club}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="text-2xl font-bold font-mono">{player.rating}</div>
                      <div className="text-xs text-muted-foreground">{player.wins} wins</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 text-center">
            <Button variant="outline" asChild data-testid="button-view-rankings">
              <Link href="/rankings">View Full Rankings</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground">
              Get started in four simple steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">Contact</h3>
              <p className="text-sm text-muted-foreground">info@prtt.org</p>
              <p className="text-sm text-muted-foreground">+1 (787) 555-0123</p>
            </div>
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">Quick Links</h3>
              <div className="flex flex-col gap-1">
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
                <Link href="/rules" className="text-sm text-muted-foreground hover:text-foreground">
                  Tournament Rules
                </Link>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </div>
            </div>
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">Follow Us</h3>
              <p className="text-sm text-muted-foreground">Stay updated on social media</p>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © 2025 Puerto Rico Table Tennis Tournament Management. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  );
}
