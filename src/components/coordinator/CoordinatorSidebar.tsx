
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
import { 
  School, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Briefcase,
  Settings
} from 'lucide-react';

interface CoordinatorSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const sidebarItems = [
  { id: 'overview', label: 'Resumen', icon: School },
  { id: 'university', label: 'Universidad', icon: School },
  { id: 'programs', label: 'Programas', icon: GraduationCap },
  { id: 'courses', label: 'Cursos', icon: BookOpen },
  { id: 'students', label: 'Estudiantes', icon: Users },
  { id: 'professors', label: 'Profesores', icon: Users },
  { id: 'projects', label: 'Proyectos', icon: Briefcase },
  { id: 'documents', label: 'Documentos', icon: Settings },
];

export function CoordinatorSidebar({ activeTab, onTabChange }: CoordinatorSidebarProps) {
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
