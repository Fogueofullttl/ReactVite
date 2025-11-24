import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function OwnerDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1e3a8a] border-b-3 border-[#3b82f6] pb-2 inline-block">
          Panel de Propietario
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Próximamente
          </CardTitle>
          <CardDescription>
            Panel de control principal del sistema FPTM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Panel ejecutivo con acceso completo a todas las funcionalidades del sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
