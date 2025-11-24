import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gavel } from "lucide-react";

export default function ArbitroMatches() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1e3a8a] border-b-3 border-[#3b82f6] pb-2 inline-block">
          Partidos Asignados
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Próximamente
          </CardTitle>
          <CardDescription>
            Esta sección mostrará todos los partidos asignados a ti como árbitro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aquí podrás ver los partidos que debes arbitrar, con información detallada de horarios y jugadores.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
