
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Users, 
  GraduationCap, 
  Building, 
  Mail, 
  FileText, 
  BarChart3, 
  Settings,
  BookOpen,
  Handshake
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const menuItems = [
    { id: 'users', label: 'Gestión de Usuarios', icon: Users },
    { id: 'universities', label: 'Universidades', icon: Building },
    { id: 'coordinators', label: 'Asignar Coordinadores', icon: GraduationCap },
    { id: 'professor-mobility', label: 'Movilidad Profesores', icon: BookOpen },
    { id: 'convenios-muevete', label: 'Convenios "Muévete"', icon: Handshake },
    { id: 'projects', label: 'Proyectos Investigación', icon: FileText },
    { id: 'content', label: 'Gestión de Contenido', icon: FileText },
    { id: 'email-config', label: 'Configuración Email', icon: Mail },
    { id: 'email-history', label: 'Historial de Emails', icon: Mail },
    { id: 'email-templates', label: 'Plantillas de Email', icon: Mail },
    { id: 'reports', label: 'Reportes y Analytics', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">Panel de Administración</h2>
      </div>
      <nav className="mt-4">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
