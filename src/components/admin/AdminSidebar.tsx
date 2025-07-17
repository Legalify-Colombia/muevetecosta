
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Users, 
  School, 
  BarChart3, 
  Mail, 
  Settings, 
  FileText, 
  Plane,
  User
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const sidebarItems = [
  { id: 'overview', label: 'Resumen', icon: BarChart3 },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'universities', label: 'Universidades', icon: School },
  { id: 'coordinators', label: 'Coordinadores', icon: User },
  { id: 'mobility', label: 'Movilidad', icon: Plane },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'content', label: 'Contenido', icon: FileText },
  { id: 'reports', label: 'Reportes', icon: BarChart3 },
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
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
