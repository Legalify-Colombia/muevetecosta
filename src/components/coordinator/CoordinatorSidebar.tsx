
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  School, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Briefcase,
  Settings,
  BarChart3
} from 'lucide-react';

interface CoordinatorSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CoordinatorSidebar = ({ activeTab, onTabChange }: CoordinatorSidebarProps) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Resumen',
      icon: BarChart3,
      description: 'Vista general del dashboard'
    },
    {
      id: 'university',
      label: 'Universidad',
      icon: School,
      description: 'Gestionar perfil universitario'
    },
    {
      id: 'programs',
      label: 'Programas',
      icon: GraduationCap,
      description: 'Gestionar programas académicos'
    },
    {
      id: 'courses',
      label: 'Cursos',
      icon: BookOpen,
      description: 'Gestionar cursos'
    },
    {
      id: 'students',
      label: 'Estudiantes',
      icon: Users,
      description: 'Postulaciones de estudiantes'
    },
    {
      id: 'professors',
      label: 'Profesores',
      icon: Users,
      description: 'Movilidad de profesores'
    },
    {
      id: 'projects',
      label: 'Proyectos',
      icon: Briefcase,
      description: 'Proyectos de investigación'
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: Settings,
      description: 'Documentos requeridos'
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">Panel Coordinador</h2>
        <p className="text-sm text-gray-600 mt-1">Panel de coordinación</p>
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

export default CoordinatorSidebar;
