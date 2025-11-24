import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function OwnerUsers() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1e3a8a] border-b-3 border-[#3b82f6] pb-2 inline-block">
          Todos los Usuarios
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Próximamente
          </CardTitle>
          <CardDescription>
            Vista completa de todos los usuarios del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Gestión completa de usuarios, permisos y roles en el sistema FPTM.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
