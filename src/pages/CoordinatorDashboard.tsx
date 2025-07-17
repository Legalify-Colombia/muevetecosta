
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  University, 
  Settings, 
  BookOpen,
  FlaskConical,
  LogOut
} from 'lucide-react';
import { ApplicationsList } from '@/components/coordinator/ApplicationsList';
import { UniversityProfile } from '@/components/coordinator/UniversityProfile';
import { ProgramManagement } from '@/components/coordinator/ProgramManagement';
import { CourseManagement } from '@/components/coordinator/CourseManagement';
import { ProjectManagement } from '@/components/coordinator/ProjectManagement';
import { ApplicationDetail } from '@/components/coordinator/ApplicationDetail';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

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
        <ApplicationDetail 
          applicationId={selectedApplicationId}
          onBack={handleBackFromApplication}
        />
      </div>
    );
  }

  // If managing courses for a specific program, show course management
  if (selectedProgram) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <CourseManagement 
            program={selectedProgram}
            onBack={handleBackFromCourses}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Panel de Coordinador</h1>
              <p className="text-muted-foreground">
                Gestiona aplicaciones, programas y proyectos de investigación
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Aplicaciones
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Programas
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Cursos
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Proyectos
            </TabsTrigger>
            <TabsTrigger value="university" className="flex items-center gap-2">
              <University className="h-4 w-4" />
              Universidad
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <ApplicationsList onViewApplication={handleViewApplication} />
          </TabsContent>

          <TabsContent value="programs">
            <ProgramManagement onManageCourses={handleManageCourses} />
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Cursos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Selecciona un programa desde la pestaña "Programas" para gestionar sus cursos.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <ProjectManagement />
          </TabsContent>

          <TabsContent value="university">
            <UniversityProfile />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configuración del perfil disponible próximamente.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
