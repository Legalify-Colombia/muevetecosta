import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversityProfile } from '@/components/coordinator/UniversityProfile';
import { ProgramManagement } from '@/components/coordinator/ProgramManagement';
import { ApplicationsList } from '@/components/coordinator/ApplicationsList';
import { ProfessorMobilityApplications } from '@/components/coordinator/ProfessorMobilityApplications';
import { ProjectManagement } from '@/components/coordinator/ProjectManagement';
import { UniversityRequiredDocuments } from '@/components/coordinator/UniversityRequiredDocuments';
import Header from '@/components/common/Header';
import { CoordinatorSidebar } from '@/components/coordinator/CoordinatorSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { 
  FileText, 
  GraduationCap, 
  BookOpen, 
  Briefcase
} from 'lucide-react';

const CoordinatorDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();

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

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <CoordinatorSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <SidebarInset className="flex-1">
          <Header 
            showLogout={true}
            userInfo={`Coordinador: ${profile?.full_name}`}
          />
          
          {isMobile && (
            <div className="flex items-center gap-2 px-4 py-2 border-b">
              <SidebarTrigger />
              <h1 className="font-semibold">Panel de Coordinación</h1>
            </div>
          )}
          
          <div className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <div>
                  {!isMobile && <h1 className="text-2xl font-bold">Panel de Coordinación</h1>}
                  <p className="text-muted-foreground">
                    Gestiona tu universidad y las postulaciones de movilidad
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-6">
            <Tabs value={activeTab} className="space-y-6">
              <TabsContent value="overview" className="space-y-6">
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
              </TabsContent>

              <TabsContent value="university">
                <UniversityProfile />
              </TabsContent>

              <TabsContent value="programs">
                <ProgramManagement />
              </TabsContent>

              <TabsContent value="courses">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Selecciona un programa para gestionar sus cursos
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="students">
                <ApplicationsList onViewApplication={handleViewApplication} />
              </TabsContent>

              <TabsContent value="professors">
                <ProfessorMobilityApplications />
              </TabsContent>

              <TabsContent value="projects">
                <ProjectManagement />
              </TabsContent>

              <TabsContent value="documents">
                {myUniversity ? (
                  <UniversityRequiredDocuments universityId={myUniversity.id} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No se encontró universidad asignada
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default CoordinatorDashboard;
