import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1e3a8a] border-b-3 border-[#3b82f6] pb-2 inline-block">
          Panel de Administrador
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Próximamente
          </CardTitle>
          <CardDescription>
            Panel de control para administradores del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aquí podrás gestionar torneos, verificar pagos ATH Móvil, y administrar registros de jugadores.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
