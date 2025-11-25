import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trophy } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !role) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    const success = login(email, password, role);

    if (success) {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente",
      });

      if (role === "arbitro") {
        setLocation("/arbitro/dashboard");
      } else if (role === "admin") {
        setLocation("/admin/registrations");
      } else if (role === "owner") {
        setLocation("/owner");
      } else if (role === "jugador") {
        setLocation("/");
      } else {
        setLocation("/");
      }
    } else {
      toast({
        title: "Error",
        description: "Email, contraseña o rol incorrectos",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Iniciar Sesión - FPTM
          </CardTitle>
          <CardDescription>
            Federación Puertorriqueña de Tenis de Mesa
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Seleccionar Rol</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" data-testid="select-role">
                  <SelectValue placeholder="Selecciona tu rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="arbitro">Árbitro</SelectItem>
                  <SelectItem value="jugador">Jugador</SelectItem>
                  <SelectItem value="publico">Público</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">Usuarios de prueba:</p>
              <ul className="space-y-1 text-xs">
                <li>• admin@fptm.pr (Admin)</li>
                <li>• arbitro@fptm.pr (Árbitro)</li>
                <li>• jugador@fptm.pr (Jugador)</li>
                <li>• owner@fptm.pr (Owner)</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Contraseña: cualquiera
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              data-testid="button-login"
            >
              Iniciar Sesión
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <a href="#" className="text-primary hover:underline">
                Regístrate
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
