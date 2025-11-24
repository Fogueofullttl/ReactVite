import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal } from "lucide-react";

export default function AdminRegistrations() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1e3a8a] border-b-3 border-[#3b82f6] pb-2 inline-block">
          Registros de Torneos
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5" />
            Próximamente - Verificación ATH Móvil
          </CardTitle>
          <CardDescription>
            Gestión de registros y verificación de pagos ATH Móvil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aquí podrás verificar los códigos ATH Móvil de jugadores que se registran a torneos,
            aprobar o rechazar pagos, y gestionar inscripciones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
