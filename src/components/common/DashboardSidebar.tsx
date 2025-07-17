
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  FileText, 
  Settings, 
  BookOpen,
  GraduationCap,
  UserCheck,
  Bell,
  BarChart3,
  Lightbulb,
  Search,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
}

interface DashboardSidebarProps {
  collapsed?: boolean;
}

const DashboardSidebar = ({ collapsed = false }: DashboardSidebarProps) => {
  const location = useLocation();
  const { profile } = useAuth();

  const getMenuItems = (): SidebarItem[] => {
    const role = profile?.role;
    
    const baseItems: SidebarItem[] = [
      {
        title: "Dashboard",
        href: `/dashboard/${role}`,
        icon: LayoutDashboard,
      },
    ];

    switch (role) {
      case 'admin':
        return [
          ...baseItems,
          {
            title: "Usuarios",
            href: "/admin/users",
            icon: Users,
          },
          {
            title: "Universidades",
            href: "/admin/universities",
            icon: Building,
          },
          {
            title: "Postulaciones",
            href: "/admin/applications",
            icon: FileText,
          },
          {
            title: "Contenidos",
            href: "/admin/content",
            icon: BookOpen,
          },
          {
            title: "Reportes",
            href: "/admin/reports",
            icon: BarChart3,
          },
          {
            title: "Configuración",
            href: "/admin/settings",
            icon: Settings,
          },
        ];

      case 'coordinator':
        return [
          ...baseItems,
          {
            title: "Postulaciones",
            href: "/coordinator/applications",
            icon: FileText,
            badge: "3", // This would come from data
          },
          {
            title: "Programas",
            href: "/coordinator/programs",
            icon: GraduationCap,
          },
          {
            title: "Universidad",
            href: "/coordinator/university",
            icon: Building,
          },
          {
            title: "Notificaciones",
            href: "/coordinator/notifications",
            icon: Bell,
          },
        ];

      case 'professor':
        return [
          ...baseItems,
          {
            title: "Investigación",
            href: "/professor/research",
            icon: Lightbulb,
          },
          {
            title: "Mis Proyectos",
            href: "/professor/projects",
            icon: BookOpen,
          },
          {
            title: "Explorar",
            href: "/professor/search",
            icon: Search,
          },
          {
            title: "Mi Perfil",
            href: "/professor/profile",
            icon: User,
          },
        ];

      case 'student':
        return [
          ...baseItems,
          {
            title: "Universidades",
            href: "/universities",
            icon: Building,
          },
          {
            title: "Mis Postulaciones",
            href: "/student/applications",
            icon: FileText,
          },
        ];

      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  const isActive = (href: string) => {
    if (href === `/dashboard/${profile?.role}`) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className={cn(
      "flex flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4">
        {!collapsed && (
          <div className="text-center">
            <h2 className="text-lg font-semibold">MobiCaribe</h2>
            <p className="text-sm text-muted-foreground capitalize">
              {profile?.role === 'admin' && 'Panel Administrativo'}
              {profile?.role === 'coordinator' && 'Panel de Coordinación'}
              {profile?.role === 'professor' && 'Portal de Investigación'}
              {profile?.role === 'student' && 'Portal Estudiantil'}
            </p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10",
                    collapsed && "px-2",
                    active && "bg-primary/10 text-primary font-medium",
                    item.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={item.disabled}
                >
                  <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {!collapsed && (
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.full_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.role === 'admin' && 'Administrador'}
                {profile?.role === 'coordinator' && 'Coordinador'}
                {profile?.role === 'professor' && 'Profesor'}
                {profile?.role === 'student' && 'Estudiante'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSidebar;
