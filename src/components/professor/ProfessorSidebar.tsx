
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { FlaskConical, FileText, User, Search, FolderOpen, Plane } from 'lucide-react';

interface ProfessorSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const sidebarItems = [
  { id: 'overview', label: 'Resumen', icon: FlaskConical },
  { id: 'my-projects', label: 'Mis Proyectos', icon: FolderOpen },
  { id: 'search', label: 'Buscar Proyectos', icon: Search },
  { id: 'mobility', label: 'Movilidad', icon: Plane },
  { id: 'my-mobility', label: 'Mis Postulaciones', icon: FileText },
  { id: 'profile', label: 'Mi Perfil', icon: User },
];

export function ProfessorSidebar({ activeTab, onTabChange }: ProfessorSidebarProps) {
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "none"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => handleTabClick(item.id)}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
