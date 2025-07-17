
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical, FileText, User, Search, FolderOpen } from 'lucide-react';
import { ProfessorProfile } from '@/components/professor/ProfessorProfile';
import { ProjectsOverview } from '@/components/professor/ProjectsOverview';
import { MyProjects } from '@/components/professor/MyProjects';
import { ProjectSearch } from '@/components/professor/ProjectSearch';
import ProjectCreation from '@/components/professor/ProjectCreation';
import Header from '@/components/common/Header';

export default function ProfessorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showProjectCreation, setShowProjectCreation] = useState(false);

  const handleCreateProject = () => {
    setShowProjectCreation(true);
  };

  const handleCloseProjectCreation = () => {
    setShowProjectCreation(false);
    setActiveTab('my-projects'); // Redirect to my projects after creation
  };

  if (showProjectCreation) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          showLogout={true}
          userInfo="Profesor"
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
        userInfo="Profesor"
      />
      
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Panel del Profesor</h1>
              <p className="text-muted-foreground">
                Gestiona tu perfil académico y proyectos de investigación
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="my-projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Mis Proyectos
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar Proyectos
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mi Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProjectsOverview onCreateProject={handleCreateProject} />
          </TabsContent>

          <TabsContent value="my-projects">
            <MyProjects onCreateProject={handleCreateProject} />
          </TabsContent>

          <TabsContent value="search">
            <ProjectSearch />
          </TabsContent>

          <TabsContent value="profile">
            <ProfessorProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
