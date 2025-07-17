import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, BookOpen, GraduationCap, Building, BarChart3 } from 'lucide-react';
import CoordinatorProfile from '@/components/coordinator/CoordinatorProfile';
import ProgramsManagement from '@/components/coordinator/ProgramsManagement';
import CoursesManagement from '@/components/coordinator/CoursesManagement';
import StudentMobilityApplications from '@/components/coordinator/StudentMobilityApplications';
import ProfessorMobilityApplications from '@/components/coordinator/ProfessorMobilityApplications';
import Header from '@/components/common/Header';
import { useAuth } from '@/hooks/useAuth';

export default function CoordinatorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !profile) {
      // Redirect or handle no profile case
      console.warn('No profile found for coordinator');
    }
  }, [profile, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showLogout={true}
        userInfo={`Coordinador: ${profile?.full_name}`}
      />
      
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Panel del Coordinador</h1>
              <p className="text-muted-foreground">
                Gestiona postulaciones de movilidad estudiantil y profesoral
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Estudiantes
            </TabsTrigger>
            <TabsTrigger value="professor-applications" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Profesores
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Programas
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Cursos
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Mi Universidad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div>Resumen del Coordinador</div>
          </TabsContent>

          <TabsContent value="applications">
            <StudentMobilityApplications />
          </TabsContent>

          <TabsContent value="professor-applications">
            <ProfessorMobilityApplications />
          </TabsContent>

          <TabsContent value="programs">
            <ProgramsManagement />
          </TabsContent>

          <TabsContent value="courses">
            <CoursesManagement />
          </TabsContent>

          <TabsContent value="profile">
            <CoordinatorProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
