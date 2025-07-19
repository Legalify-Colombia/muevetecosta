
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversityProfile } from '@/components/coordinator/UniversityProfile';
import { ProgramManagement } from '@/components/coordinator/ProgramManagement';
import { ApplicationsList } from '@/components/coordinator/ApplicationsList';
import { ProfessorMobilityApplications } from '@/components/coordinator/ProfessorMobilityApplications';
import { ProjectManagement } from '@/components/coordinator/ProjectManagement';
import { UniversityRequiredDocuments } from '@/components/coordinator/UniversityRequiredDocuments';
import Header from '@/components/common/Header';
import CoordinatorSidebar from '@/components/coordinator/CoordinatorSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  GraduationCap, 
  BookOpen, 
  Briefcase
} from 'lucide-react';

const CoordinatorDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch coordinator's university
  const { data: myUniversity } = useQuery({
    queryKey: ['coordinator-university', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('coordinator_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const handleViewApplication = (applicationId: string) => {
    console.log('Viewing application:', applicationId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Postulaciones Pendientes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">
                    Esperando revisión
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Programas Activos</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">
                    Programas disponibles
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cursos</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">
                    Cursos registrados
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Proyectos</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">
                    Proyectos de investigación
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'university':
        return <UniversityProfile />;
      case 'programs':
        return <ProgramManagement />;
      case 'courses':
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Selecciona un programa para gestionar sus cursos
            </p>
          </div>
        );
      case 'students':
        return <ApplicationsList onViewApplication={handleViewApplication} />;
      case 'professors':
        return <ProfessorMobilityApplications />;
      case 'projects':
        return <ProjectManagement />;
      case 'documents':
        return myUniversity ? (
          <UniversityRequiredDocuments universityId={myUniversity.id} />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No se encontró universidad asignada
            </p>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Selecciona una opción del menú
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación responsive */}
      <Header 
        showLogout={true}
        userInfo={`Coordinador: ${profile?.full_name || 'Usuario'}`}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - oculto en móvil, mostrado en desktop */}
        <div className="hidden md:block">
          <CoordinatorSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {/* Navegación móvil */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex overflow-x-auto px-2 py-2 space-x-1">
            {[
              { id: 'overview', label: 'Resumen', icon: '📊' },
              { id: 'university', label: 'Universidad', icon: '🏫' },
              { id: 'programs', label: 'Programas', icon: '🎓' },
              { id: 'courses', label: 'Cursos', icon: '📚' },
              { id: 'students', label: 'Estudiantes', icon: '🧑‍🎓' },
              { id: 'professors', label: 'Profesores', icon: '👨‍🏫' },
              { id: 'projects', label: 'Proyectos', icon: '💼' },
              { id: 'documents', label: 'Documentos', icon: '📄' },
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
};

export default CoordinatorDashboard;
