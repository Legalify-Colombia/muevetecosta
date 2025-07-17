
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversityProfile } from '@/components/coordinator/UniversityProfile';
import { ProgramManagement } from '@/components/coordinator/ProgramManagement';
import { CourseManagement } from '@/components/coordinator/CourseManagement';
import { ApplicationsList } from '@/components/coordinator/ApplicationsList';
import { ProfessorMobilityApplications } from '@/components/coordinator/ProfessorMobilityApplications';
import { ProjectManagement } from '@/components/coordinator/ProjectManagement';
import { UniversityRequiredDocuments } from '@/components/coordinator/UniversityRequiredDocuments';
import { useAuth } from '@/hooks/useAuth';
import { 
  School, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Users, 
  Briefcase,
  Settings
} from 'lucide-react';

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Panel de Coordinación</h1>
        <p className="text-muted-foreground">
          Gestiona tu universidad y las postulaciones de movilidad
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="overview">
            <School className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="university">
            <School className="h-4 w-4 mr-2" />
            Universidad
          </TabsTrigger>
          <TabsTrigger value="programs">
            <GraduationCap className="h-4 w-4 mr-2" />
            Programas
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            Estudiantes
          </TabsTrigger>
          <TabsTrigger value="professors">
            <Users className="h-4 w-4 mr-2" />
            Profesores
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Briefcase className="h-4 w-4 mr-2" />
            Proyectos
          </TabsTrigger>
          <TabsTrigger value="documents">
            <Settings className="h-4 w-4 mr-2" />
            Documentos
          </TabsTrigger>
        </TabsList>

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
          <CourseManagement />
        </TabsContent>

        <TabsContent value="students">
          <ApplicationsList />
        </TabsContent>

        <TabsContent value="professors">
          <ProfessorMobilityApplications />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectManagement />
        </TabsContent>

        <TabsContent value="documents">
          <UniversityRequiredDocuments />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoordinatorDashboard;
