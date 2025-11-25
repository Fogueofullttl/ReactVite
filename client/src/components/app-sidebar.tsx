import {
  Home,
  Trophy,
  Users,
  Calendar,
  TrendingUp,
  Medal,
  Settings,
  User,
  Shield,
  Gavel,
  LogOut,
  LogIn,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@shared/schema";

const roleIcons = {
  owner: Shield,
  admin: Shield,
  arbitro: Gavel,
  jugador: User,
  publico: User,
};

const roleLabels: Record<UserRole, string> = {
  owner: "Propietario",
  admin: "Administrador",
  arbitro: "Árbitro",
  jugador: "Jugador",
  publico: "Público",
};

const menuItemsByRole: Record<string, Array<{ title: string; url: string; icon: any }>> = {
  publico: [
    { title: "Inicio", url: "/", icon: Home },
    { title: "Torneos", url: "/tournaments", icon: Trophy },
    { title: "Rankings", url: "/rankings", icon: TrendingUp },
  ],
  jugador: [
    { title: "Panel", url: "/dashboard", icon: Home },
    { title: "Mis Partidos", url: "/jugador/dashboard", icon: Calendar },
    { title: "Torneos", url: "/tournaments", icon: Trophy },
    { title: "Rankings", url: "/rankings", icon: TrendingUp },
    { title: "Perfil", url: "/profile", icon: User },
  ],
  arbitro: [
    { title: "Mis Partidos", url: "/arbitro/dashboard", icon: Gavel },
    { title: "Torneos", url: "/tournaments", icon: Trophy },
  ],
  admin: [
    { title: "Dashboard Admin", url: "/admin/registrations", icon: Home },
    { title: "Verificar Resultados", url: "/admin/verify-results", icon: Shield },
    { title: "Gestion Torneos", url: "/admin/tournaments", icon: Calendar },
    { title: "Torneos Publicos", url: "/tournaments", icon: Trophy },
    { title: "Jugadores", url: "/admin/users", icon: Users },
    { title: "Pagos", url: "/admin/registrations", icon: Medal },
    { title: "Rankings", url: "/rankings", icon: TrendingUp },
  ],
  owner: [
    { title: "Dashboard Owner", url: "/owner", icon: Home },
    { title: "Analíticas", url: "/owner/analytics", icon: TrendingUp },
    { title: "Torneos", url: "/tournaments", icon: Trophy },
    { title: "Usuarios", url: "/owner/users", icon: Users },
    { title: "Configuración", url: "/owner/settings", icon: Settings },
  ],
};

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  
  const userRole = user?.role || 'publico';
  const items = menuItemsByRole[userRole] || menuItemsByRole.publico;
  const RoleIcon = roleIcons[userRole] || User;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">FPTM</span>
            <span className="text-xs text-muted-foreground">Federación PR</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {isAuthenticated && user ? (
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground font-mono">
                  {user.memberNumber}
                </span>
              </div>
              <RoleIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-xs">
                {roleLabels[userRole as UserRole]}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-7 gap-2"
                data-testid="button-logout"
              >
                <LogOut className="h-3 w-3" />
                <span className="text-xs">Salir</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3">
            <Button
              asChild
              className="w-full"
              data-testid="button-login-sidebar"
            >
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar Sesión
              </Link>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
