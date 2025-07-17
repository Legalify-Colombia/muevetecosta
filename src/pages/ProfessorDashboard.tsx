
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical, FileText, User, Search, FolderOpen, Plane } from 'lucide-react';
import ProfessorProfile from '@/components/professor/ProfessorProfile';
import ProjectsOverview from '@/components/professor/ProjectsOverview';
import MyProjects from '@/components/professor/MyProjects';
import ProjectSearch from '@/components/professor/ProjectSearch';
import ProjectCreation from '@/components/professor/ProjectCreation';
import MobilityOpportunities from '@/components/professor/mobility/MobilityOpportunities';
import { MobilityApplications } from '@/components/professor/mobility/MobilityApplications';
import Header from '@/components/common/Header';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ProfessorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showProjectCreation, setShowProjectCreation] = useState(false);
  const { profile } = useAuth();
  const isMobile = useIsMobile();

  const handleCreateProject = () => {
    setShowProjectCreation(true);
  };

  const handleCloseProjectCreation = () => {
    setShowProjectCreation(false);
    setActiveTab('my-projects');
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
    <div className="min-h-screen bg-background">
      <Header 
        showLogout={true}
        userInfo={`Profesor: ${profile?.full_name}`}
      />
      
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Panel del Profesor</h1>
              <p className="text-muted-foreground">
                Gestiona tu perfil académico, proyectos de investigación y oportunidades de movilidad
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-6'}`}>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              {!isMobile && "Resumen"}
            </TabsTrigger>
            <TabsTrigger value="my-projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              {!isMobile && "Mis Proyectos"}
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {!isMobile && "Buscar Proyectos"}
            </TabsTrigger>
            <TabsTrigger value="mobility" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              {!isMobile && "Movilidad"}
            </TabsTrigger>
            <TabsTrigger value="my-mobility" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {!isMobile && "Mis Postulaciones"}
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {!isMobile && "Mi Perfil"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProjectsOverview />
          </TabsContent>

          <TabsContent value="my-projects">
            <MyProjects />
          </TabsContent>

          <TabsContent value="search">
            <ProjectSearch />
          </TabsContent>

          <TabsContent value="mobility">
            <MobilityOpportunities />
          </TabsContent>

          <TabsContent value="my-mobility">
            <MobilityApplications />
          </TabsContent>

          <TabsContent value="profile">
            <ProfessorProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
