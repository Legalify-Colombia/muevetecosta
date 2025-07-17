
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard, Users, Building, FileText, Settings, BookOpen, GraduationCap, UserCheck, Bell, BarChart3, Lightbulb, Search, User, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  badge?: string | number;
  disabled?: boolean;
}

interface DashboardSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const DashboardSidebar = ({
  collapsed = false,
  onToggle
}: DashboardSidebarProps) => {
  const location = useLocation();
  const { profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const getMenuItems = (): SidebarItem[] => {
    const role = profile?.role;
    const baseItems: SidebarItem[] = [{
      title: "Dashboard",
      href: `/dashboard/${role}`,
      icon: LayoutDashboard
    }];

    switch (role) {
      case 'admin':
        return [...baseItems, {
          title: "Usuarios",
          href: `/admin/users`,
          icon: Users
        }, {
          title: "Universidades",
          href: `/admin/universities`,
          icon: Building
        }, {
          title: "Postulaciones",
          href: `/admin/applications`,
          icon: FileText
        }, {
          title: "Proyectos",
          href: `/admin/projects`,
          icon: Lightbulb
        }, {
          title: "Reportes",
          href: `/admin/reports`,
          icon: BarChart3
        }, {
          title: "Configuración",
          href: `/admin/settings`,
          icon: Settings
        }];
      case 'coordinator':
        return [...baseItems, {
          title: "Postulaciones",
          href: `/coordinator/applications`,
          icon: FileText,
          badge: "3"
        }, {
          title: "Programas",
          href: `/coordinator/programs`,
          icon: GraduationCap
        }, {
          title: "Universidad",
          href: `/coordinator/university`,
          icon: Building
        }, {
          title: "Reportes",
          href: `/coordinator/reports`,
          icon: BarChart3
        }, {
          title: "Notificaciones",
          href: `/coordinator/notifications`,
          icon: Bell
        }];
      case 'professor':
        return [...baseItems, {
          title: "Investigación",
          href: `/professor/research`,
          icon: Lightbulb
        }, {
          title: "Mis Proyectos",
          href: `/professor/projects`,
          icon: BookOpen
        }, {
          title: "Explorar",
          href: `/professor/search`,
          icon: Search
        }, {
          title: "Mi Perfil",
          href: `/professor/profile`,
          icon: User
        }];
      case 'student':
        return [...baseItems, {
          title: "Universidades",
          href: `/universities`,
          icon: Building
        }, {
          title: "Mis Postulaciones",
          href: `/student/applications`,
          icon: FileText
        }];
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

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Mobile menu
  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="fixed top-4 left-4 z-50 md:hidden bg-background border shadow-md"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden" 
            onClick={() => setMobileMenuOpen(false)} 
          />
        )}

        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed left-0 top-0 z-40 h-full w-80 transform bg-background border-r transition-transform duration-300 md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 pt-16">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold">MobiCaribe</h2>
              <p className="text-sm text-muted-foreground capitalize">
                {profile?.role === 'admin' && 'Panel Administrativo'}
                {profile?.role === 'coordinator' && 'Panel de Coordinación'}
                {profile?.role === 'professor' && 'Portal de Investigación'}
                {profile?.role === 'student' && 'Portal Estudiantil'}
              </p>
            </div>
          </div>

          <ScrollArea className="flex-1 px-3">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} to={item.href} onClick={handleMenuClick}>
                    <Button 
                      variant={active ? "secondary" : "ghost"} 
                      className={cn(
                        "w-full justify-start h-12 text-left",
                        active && "bg-primary/10 text-primary font-medium",
                        item.disabled && "opacity-50 cursor-not-allowed"
                      )} 
                      disabled={item.disabled}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
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
        </div>
      </>
    );
  }

  // Desktop and Tablet Sidebar
  return (
    <div className={cn(
      "hidden md:flex flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
      collapsed || isTablet ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b">
        {!collapsed && !isTablet && (
          <div className="text-center">
            <h2 className="text-lg font-semibold">MobiCaribe</h2>
            <p className="text-sm text-muted-foreground">
              {profile?.role === 'admin' && 'Panel Administrativo'}
              {profile?.role === 'coordinator' && 'Panel de Coordinación'}
              {profile?.role === 'professor' && 'Portal de Investigación'}
              {profile?.role === 'student' && 'Portal Estudiantil'}
            </p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
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
                    (collapsed || isTablet) && "px-2",
                    active && "bg-primary/10 text-primary font-medium",
                    item.disabled && "opacity-50 cursor-not-allowed"
                  )} 
                  disabled={item.disabled}
                  title={collapsed || isTablet ? item.title : undefined}
                >
                  <Icon className={cn("h-4 w-4", !(collapsed || isTablet) && "mr-3")} />
                  {!(collapsed || isTablet) && (
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

      {!(collapsed || isTablet) && (
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
