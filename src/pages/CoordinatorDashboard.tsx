
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  University, 
  BookOpen, 
  GraduationCap,
  FlaskConical,
  LogOut,
  Plane,
  FileText
} from 'lucide-react';
import { ApplicationsList } from '@/components/coordinator/ApplicationsList';
import { UniversityProfile } from '@/components/coordinator/UniversityProfile';
import { ProgramManagement } from '@/components/coordinator/ProgramManagement';
import { CourseManagement } from '@/components/coordinator/CourseManagement';
import { ProjectManagement } from '@/components/coordinator/ProjectManagement';
import { ApplicationDetail } from '@/components/coordinator/ApplicationDetail';
import { ProfessorMobilityApplications } from '@/components/coordinator/ProfessorMobilityApplications';
import { UniversityRequiredDocuments } from '@/components/coordinator/UniversityRequiredDocuments';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useUniversities } from '@/hooks/useUniversities';
import Header from '@/components/common/Header';

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  const { data: universities = [] } = useUniversities();
  const coordinatorUniversity = universities.find(u => u.coordinator_id === user?.id);

  const handleViewApplication = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
  };

  const handleBackFromApplication = () => {
    setSelectedApplicationId(null);
  };

  const handleManageCourses = (program: any) => {
    setSelectedProgram(program);
    setActiveTab('courses');
  };

  const handleBackFromCourses = () => {
    setSelectedProgram(null);
    setActiveTab('programs');
  };

  // If viewing application detail, show that instead of tabs
  if (selectedApplicationId) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          showLogout={true}
          userInfo="Coordinador"
        />
        <ApplicationDetail 
          applicationId={selectedApplicationId}
          onBack={handleBackFromApplication}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showLogout={true}
        userInfo="Coordinador"
      />
      
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Panel de Coordinación</h1>
              <p className="text-muted-foreground">
                Gestiona aplicaciones, programas y proyectos de movilidad
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Estudiantes
            </TabsTrigger>
            <TabsTrigger value="professor-mobility" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Profesores
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Programas
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Cursos
            </TabsTrigger>
            <TabsTrigger value="university" className="flex items-center gap-2">
              <University className="h-4 w-4" />
              Universidad
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Proyectos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <ApplicationsList onViewApplication={handleViewApplication} />
          </TabsContent>

          <TabsContent value="professor-mobility">
            <ProfessorMobilityApplications />
          </TabsContent>

          <TabsContent value="documents">
            {coordinatorUniversity ? (
              <UniversityRequiredDocuments universityId={coordinatorUniversity.id} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Documentos Requeridos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No se encontró la universidad asignada. Contacta al administrador para configurar tu universidad.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="programs">
            <ProgramManagement />
          </TabsContent>

          <TabsContent value="courses">
            {selectedProgram ? (
              <CourseManagement 
                program={selectedProgram} 
                onBack={handleBackFromCourses}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Cursos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Selecciona un programa específico para gestionar sus cursos desde la pestaña "Programas".
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="university">
            <UniversityProfile />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
