import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function OwnerAnalytics() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1e3a8a] border-b-3 border-[#3b82f6] pb-2 inline-block">
          Analíticas
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Próximamente
          </CardTitle>
          <CardDescription>
            Estadísticas y analíticas del sistema FPTM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aquí podrás ver métricas de jugadores activos, ingresos por torneos, estadísticas de participación y más.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
