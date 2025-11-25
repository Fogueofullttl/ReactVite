import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatchCard from "@/components/MatchCard";
import { mockMatches } from "@/data/mockMatches";

export default function ArbitroDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const refereeMatches = mockMatches.filter(m => m.referee === user?.id);
  const pendingMatches = refereeMatches.filter(m => m.status === 'pending');
  const completedMatches = refereeMatches.filter(m => m.status === 'completed');

  const completedTodayCount = completedMatches.filter(m => {
    if (!m.result) return false;
    const today = new Date();
    const enteredDate = new Date(m.result.enteredAt);
    return (
      enteredDate.getDate() === today.getDate() &&
      enteredDate.getMonth() === today.getMonth() &&
      enteredDate.getFullYear() === today.getFullYear()
    );
  }).length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Partidos Asignados</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold" data-testid="stat-pending">
              {pendingMatches.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Completados Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold" data-testid="stat-today">
              {completedTodayCount}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Total Arbitrados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold" data-testid="stat-total">
              {completedMatches.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full" data-testid="tabs-matches">
          <TabsTrigger value="pending" className="flex-1" data-testid="tab-pending">
            Pendientes ({pendingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1" data-testid="tab-completed">
            Completados ({completedMatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingMatches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No tienes partidos pendientes en este momento
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                onEnterResult={() => setLocation(`/arbitro/match/${match.id}`)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedMatches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No has completado ningún partido todavía
                </p>
              </CardContent>
            </Card>
          ) : (
            completedMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
