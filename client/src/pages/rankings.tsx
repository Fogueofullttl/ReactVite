import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, TrendingUp, TrendingDown, Minus, Medal } from "lucide-react";
import type { User } from "@shared/schema";
import { Link } from "wouter";

export default function Rankings() {
  const [category, setCategory] = useState("singles");
  const [gender, setGender] = useState("all");

  const { data: players = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/rankings"],
  });

  // Note: Category and gender filtering will be implemented when User schema is extended
  // For now, showing all players sorted by rating
  const filteredPlayers = players;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankChange = (currentRank: number, previousRank: number = currentRank) => {
    const change = previousRank - currentRank;
    if (change > 0) {
      return { icon: TrendingUp, color: "text-green-600", value: `+${change}` };
    } else if (change < 0) {
      return { icon: TrendingDown, color: "text-red-600", value: change.toString() };
    }
    return { icon: Minus, color: "text-muted-foreground", value: "0" };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Cargando rankings...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Rankings</h1>
          <p className="text-muted-foreground">
            Rankings oficiales de jugadores de Puerto Rico
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]" data-testid="select-category">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="singles">Individual</SelectItem>
              <SelectItem value="doubles">Dobles</SelectItem>
            </SelectContent>
          </Select>

          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="w-[200px]" data-testid="select-gender">
              <SelectValue placeholder="Género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="male">Masculino</SelectItem>
              <SelectItem value="female">Femenino</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredPlayers.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          {filteredPlayers.slice(0, 3).map((player, index) => {
            const medals = [
              { color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
              { color: "text-gray-400", bgColor: "bg-gray-400/10" },
              { color: "text-amber-700", bgColor: "bg-amber-700/10" },
            ];
            const medal = medals[index];

            return (
              <Card key={player.id} className="hover-elevate" data-testid={`card-top-player-${index + 1}`}>
                <CardHeader className="text-center pb-3">
                  <div className="flex justify-center mb-4">
                    <div className={`${medal.bgColor} p-3 rounded-full`}>
                      <Medal className={`h-8 w-8 ${medal.color}`} />
                    </div>
                  </div>
                  <div className="flex justify-center mb-3">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={player.photoUrl || undefined} alt={player.name} />
                      <AvatarFallback className="text-lg">
                        {getInitials(player.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl" data-testid={`text-player-name-${index + 1}`}>
                    {player.name}
                  </CardTitle>
                  <CardDescription>{player.club}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rating</span>
                    <Badge variant="default" className="font-mono text-base">
                      {player.rating}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Miembro</span>
                    <span className="font-mono text-sm">{player.memberNumber}</span>
                  </div>
                  <Button asChild variant="outline" className="w-full mt-4" data-testid={`button-view-profile-${index + 1}`}>
                    <Link href={`/players/${player.id}`}>Ver Perfil</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Clasificación Completa</CardTitle>
          <CardDescription>
            Actualizado con los resultados más recientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No hay jugadores disponibles</p>
              <p className="text-sm text-muted-foreground">
                Los rankings se actualizarán después de los torneos
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Jugador</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead className="text-right">Cambio</TableHead>
                  <TableHead className="hidden md:table-cell">Club</TableHead>
                  <TableHead className="hidden lg:table-cell text-center">Membresía</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player, index) => {
                  const rankChange = getRankChange(index + 1, index + 1);
                  const RankIcon = rankChange.icon;

                  return (
                    <TableRow key={player.id} className="hover-elevate" data-testid={`row-player-${index + 1}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={player.photoUrl || undefined} alt={player.name} />
                            <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium" data-testid={`text-player-name-row-${index + 1}`}>
                              {player.name}
                            </div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {player.memberNumber}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="font-mono">
                          {player.rating}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`flex items-center justify-end gap-1 ${rankChange.color}`}>
                          <RankIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{rankChange.value}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {player.club}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-center">
                        <Badge
                          variant={
                            player.membershipStatus === "active" ? "default" : "secondary"
                          }
                        >
                          {player.membershipStatus === "active" ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          data-testid={`button-view-profile-row-${index + 1}`}
                        >
                          <Link href={`/players/${player.id}`}>Ver Perfil</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
