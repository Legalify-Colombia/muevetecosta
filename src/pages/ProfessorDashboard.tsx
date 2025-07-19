
import React, { useState } from 'react';
import ProfessorProfile from '@/components/professor/ProfessorProfile';
import ProjectsOverview from '@/components/professor/ProjectsOverview';
import MyProjects from '@/components/professor/MyProjects';
import ProjectSearch from '@/components/professor/ProjectSearch';
import ProjectCreation from '@/components/professor/ProjectCreation';
import MobilityOpportunities from '@/components/professor/mobility/MobilityOpportunities';
import { MobilityApplications } from '@/components/professor/mobility/MobilityApplications';
import Header from '@/components/common/Header';
import { ProfessorSidebar } from '@/components/professor/ProfessorSidebar';
import { useAuth } from '@/hooks/useAuth';

export default function ProfessorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showProjectCreation, setShowProjectCreation] = useState(false);
  const { profile } = useAuth();

  const handleCreateProject = () => {
    setShowProjectCreation(true);
  };

  const handleCloseProjectCreation = () => {
    setShowProjectCreation(false);
    setActiveTab('my-projects');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProjectsOverview />;
      case 'my-projects':
        return <MyProjects />;
      case 'search':
        return <ProjectSearch />;
      case 'mobility':
        return <MobilityOpportunities />;
      case 'my-mobility':
        return <MobilityApplications />;
      case 'profile':
        return <ProfessorProfile />;
      default:
        return <ProjectsOverview />;
    }
  };

  if (showProjectCreation) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          showLogout={true}
          userInfo={`Profesor: ${profile?.full_name}`}
        />
        <div className="container mx-auto px-4 py-6">
          <ProjectCreation onClose={handleCloseProjectCreation} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación responsive */}
      <Header 
        showLogout={true}
        userInfo={`Profesor: ${profile?.full_name || 'Usuario'}`}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - oculto en móvil, mostrado en desktop */}
        <div className="hidden md:block">
          <ProfessorSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {/* Navegación móvil */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex overflow-x-auto px-2 py-2 space-x-1">
            {[
              { id: 'overview', label: 'Resumen', icon: '📊' },
              { id: 'my-projects', label: 'Proyectos', icon: '💼' },
              { id: 'search', label: 'Buscar', icon: '🔍' },
              { id: 'mobility', label: 'Movilidad', icon: '✈️' },
              { id: 'my-mobility', label: 'Mis Solicitudes', icon: '📋' },
              { id: 'profile', label: 'Perfil', icon: '👤' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-lg text-xs transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg mb-1">{item.icon}</span>
                <span className="truncate max-w-16">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 pb-20 md:pb-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
