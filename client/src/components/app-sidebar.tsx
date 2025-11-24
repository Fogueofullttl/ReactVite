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
import { Link, useLocation } from "wouter";
import type { UserRole } from "@shared/schema";

// Mock user - will be replaced with real auth
const mockUser = {
  name: "Usuario Invitado",
  email: "invitado@example.com",
  role: "publico" as UserRole,
  memberNumber: "PRTTM-000000",
  membershipStatus: "expired" as const,
  photoUrl: null,
};

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

const menuItemsByRole: Record<UserRole, Array<{ title: string; url: string; icon: any }>> = {
  publico: [
    { title: "Inicio", url: "/", icon: Home },
    { title: "Torneos", url: "/tournaments", icon: Trophy },
    { title: "Rankings", url: "/rankings", icon: TrendingUp },
  ],
  jugador: [
    { title: "Panel", url: "/dashboard", icon: Home },
    { title: "Torneos", url: "/tournaments", icon: Trophy },
    { title: "Mis Partidos", url: "/my-matches", icon: Calendar },
    { title: "Rankings", url: "/rankings", icon: TrendingUp },
    { title: "Perfil", url: "/profile", icon: User },
  ],
  arbitro: [
    { title: "Panel", url: "/arbitro", icon: Home },
    { title: "Partidos Asignados", url: "/arbitro/matches", icon: Gavel },
    { title: "Torneos", url: "/tournaments", icon: Trophy },
    { title: "Rankings", url: "/rankings", icon: TrendingUp },
  ],
  admin: [
    { title: "Panel", url: "/admin", icon: Home },
    { title: "Torneos", url: "/tournaments", icon: Trophy },
    { title: "Gestión de Usuarios", url: "/admin/users", icon: Users },
    { title: "Registros", url: "/admin/registrations", icon: Medal },
    { title: "Rankings", url: "/rankings", icon: TrendingUp },
  ],
  owner: [
    { title: "Panel", url: "/owner", icon: Home },
    { title: "Analíticas", url: "/owner/analytics", icon: TrendingUp },
    { title: "Torneos", url: "/tournaments", icon: Trophy },
    { title: "Todos los Usuarios", url: "/owner/users", icon: Users },
    { title: "Configuración", url: "/owner/settings", icon: Settings },
  ],
};

export function AppSidebar() {
  const [location] = useLocation();
  const items = menuItemsByRole[mockUser.role] || menuItemsByRole.publico;
  const RoleIcon = roleIcons[mockUser.role] || User;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getMembershipBadgeVariant = () => {
    if (mockUser.membershipStatus === "active") return "default";
    if (mockUser.membershipStatus === "expired") return "destructive";
    return "secondary";
  };

  const getMembershipLabel = () => {
    switch (mockUser.membershipStatus) {
      case "active":
        return "Activa";
      case "expired":
        return "Expirada";
      case "pending":
        return "Pendiente";
      default:
        return mockUser.membershipStatus;
    }
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
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={mockUser.photoUrl || undefined} />
              <AvatarFallback>{getInitials(mockUser.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{mockUser.name}</span>
              <span className="truncate text-xs text-muted-foreground font-mono">
                {mockUser.memberNumber}
              </span>
            </div>
            <RoleIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getMembershipBadgeVariant()} className="text-xs">
              {getMembershipLabel()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {roleLabels[mockUser.role]}
            </Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
