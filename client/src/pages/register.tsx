import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trophy, Upload, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { SiGoogle } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { createUserProfile } from "@/lib/firebaseHelpers";
import { googleProvider } from "@/lib/firebase";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthYear: "",
    club: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu nombre y apellido",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (!formData.birthYear) {
      toast({
        title: "Error",
        description: "Por favor selecciona tu año de nacimiento",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Crear cuenta en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Crear perfil en Firestore
      const userProfile = await createUserProfile(userCredential.user.uid, {
        email: formData.email,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        birthYear: parseInt(formData.birthYear),
        club: formData.club.trim(),
      });

      toast({
        title: "¡Registro Exitoso!",
        description: `Tu número de miembro es: ${userProfile.memberNumber}`,
      });

      // Redirigir al login
      setTimeout(() => {
        setLocation("/login");
      }, 2000);

    } catch (error: any) {
      console.error("Error en registro:", error);
      
      let errorMessage = "Ocurrió un error durante el registro";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este correo electrónico ya está registrado";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Correo electrónico inválido";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña es muy débil";
      }
      
      toast({
        title: "Error en Registro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Extraer nombre y apellido del displayName
      const nameParts = user.displayName?.split(" ") || ["Usuario", "Google"];
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || nameParts[0];
      
      // TODO: Implementar flujo para capturar año de nacimiento real después del registro
      // Por ahora usar valor predeterminado para no bloquear el registro con Google
      const currentYear = new Date().getFullYear();
      const defaultBirthYear = currentYear - 25; // Edad predeterminada 25 años
      
      // Crear o obtener perfil en Firestore
      const userProfile = await createUserProfile(user.uid, {
        email: user.email!,
        firstName,
        lastName,
        birthYear: defaultBirthYear,
        photoURL: user.photoURL || undefined,
      });

      toast({
        title: "¡Bienvenido!",
        description: userProfile.memberNumber.startsWith('PRTTM') 
          ? `Tu número de miembro es: ${userProfile.memberNumber}`
          : "Has iniciado sesión exitosamente",
      });

      // Redirigir al dashboard
      setTimeout(() => {
        setLocation("/");
      }, 2000);

    } catch (error: any) {
      console.error("Error en registro con Google:", error);
      
      let errorMessage = "Ocurrió un error durante el registro con Google";
      
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Registro cancelado";
      } else if (error.code === "auth/account-exists-with-different-credential") {
        errorMessage = "Ya existe una cuenta con este correo electrónico";
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Registro cancelado";
      }
      
      toast({
        title: "Error en Registro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar tamaño (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "La foto debe ser menor a 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Trophy className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-2xl">Crear Cuenta - FPTM</CardTitle>
          <CardDescription>Únete a la Federación Puertorriqueña de Tenis de Mesa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleRegister}
            disabled={isLoading}
            data-testid="button-google-register"
          >
            <SiGoogle className="mr-2 h-4 w-4" />
            Continuar con Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O regístrate con email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  placeholder="Juan"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  disabled={isLoading}
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  placeholder="Pérez"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  disabled={isLoading}
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                data-testid="input-email"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  data-testid="input-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={isLoading}
                  data-testid="input-confirm-password"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="birthYear">Año de Nacimiento *</Label>
                <Select
                  value={formData.birthYear}
                  onValueChange={(value) => setFormData({ ...formData, birthYear: value })}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger id="birthYear" data-testid="select-birth-year">
                    <SelectValue placeholder="Selecciona año" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="club">Club / Organización</Label>
                <Input
                  id="club"
                  placeholder="San Juan TT Club"
                  value={formData.club}
                  onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                  disabled={isLoading}
                  data-testid="input-club"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-register"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-sm text-center text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
              Iniciar sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
