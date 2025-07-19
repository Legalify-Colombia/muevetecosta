
import React from 'react';
import { LayoutDashboard, Briefcase, Search, Plane, FileText, User } from 'lucide-react';

interface ProfessorSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const ProfessorSidebar: React.FC<ProfessorSidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'overview', label: 'Resumen', icon: <LayoutDashboard className="h-5 w-5 mr-3" /> },
    { id: 'my-projects', label: 'Mis Proyectos', icon: <Briefcase className="h-5 w-5 mr-3" /> },
    { id: 'search', label: 'Buscar Proyectos', icon: <Search className="h-5 w-5 mr-3" /> },
    { id: 'mobility', label: 'Oportunidades de Movilidad', icon: <Plane className="h-5 w-5 mr-3" /> },
    { id: 'my-mobility', label: 'Mis Postulaciones', icon: <FileText className="h-5 w-5 mr-3" /> },
    { id: 'profile', label: 'Mi Perfil', icon: <User className="h-5 w-5 mr-3" /> },
  ];

  return (
    <div className="w-64 bg-white border-r h-full p-4 flex flex-col shadow-sm">
      <h3 className="text-lg font-semibold mb-6 text-gray-700">Panel del Profesor</h3>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${activeTab === item.id
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
