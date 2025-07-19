
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Users, 
  GraduationCap, 
  Plane, 
  FileText, 
  FolderOpen, 
  Mail, 
  History, 
  Template,
  BarChart3,
  FileContract 
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const menuItems = [
    {
      id: 'users',
      label: 'Usuarios',
      icon: Users,
      description: 'Gestionar usuarios y coordinadores'
    },
    {
      id: 'universities',
      label: 'Universidades',
      icon: GraduationCap,
      description: 'Gestionar universidades'
    },
    {
      id: 'professor-mobility',
      label: 'Movilidad Docente',
      icon: Plane,
      description: 'Gestionar movilidad de profesores'
    },
    {
      id: 'convenios-muevete',
      label: 'Convenio Muévete',
      icon: FileContract,
      description: 'Gestionar convenios y postulaciones'
    },
    {
      id: 'projects',
      label: 'Proyectos',
      icon: FolderOpen,
      description: 'Gestionar proyectos de investigación'
    },
    {
      id: 'content',
      label: 'Contenido',
      icon: FileText,
      description: 'Gestionar contenido del sitio'
    },
    {
      id: 'email-config',
      label: 'Config. Email',
      icon: Mail,
      description: 'Configurar correo electrónico'
    },
    {
      id: 'email-history',
      label: 'Historial Email',
      icon: History,
      description: 'Ver historial de correos'
    },
    {
      id: 'email-templates',
      label: 'Plantillas Email',
      icon: Template,
      description: 'Gestionar plantillas de correo'
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: BarChart3,
      description: 'Ver reportes y análisis'
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-600 mt-1">Panel de administración</p>
      </div>
      
      <nav className="px-4 pb-6">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3 text-left",
                  activeTab === item.id && "bg-blue-50 text-blue-700 border-blue-200"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {item.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
