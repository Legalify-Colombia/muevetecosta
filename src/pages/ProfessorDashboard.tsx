
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
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';

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
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <ProfessorSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <SidebarInset className="flex-1">
          <Header 
            showLogout={true}
            userInfo={`Profesor: ${profile?.full_name}`}
          />
          
          {isMobile && (
            <div className="flex items-center gap-2 px-4 py-2 border-b">
              <SidebarTrigger />
              <h1 className="font-semibold">Panel del Profesor</h1>
            </div>
          )}
          
          <div className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <div>
                  {!isMobile && <h1 className="text-2xl font-bold">Panel del Profesor</h1>}
                  <p className="text-muted-foreground">
                    Gestiona tu perfil académico, proyectos de investigación y oportunidades de movilidad
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-6">
            <Tabs value={activeTab} className="space-y-6">
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
