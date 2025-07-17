import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical, FileText, User, Search, FolderOpen, Plane, Users, GraduationCap, BookOpen, BarChart3 } from 'lucide-react';
import AdminProfile from '@/components/admin/AdminProfile';
import ProjectsOverview from '@/components/admin/ProjectsOverview';
import ProjectManagement from '@/components/admin/ProjectManagement';
import ProfessorManagement from '@/components/admin/ProfessorManagement';
import UniversityManagement from '@/components/admin/UniversityManagement';
import StudentManagement from '@/components/admin/StudentManagement';
import ReportsDashboard from '@/components/admin/reports/ReportsDashboard';
import { ProfessorMobilityManagement } from '@/components/admin/ProfessorMobilityManagement';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { ProgramManagement } from '@/components/admin/ProgramManagement';
import Header from '@/components/common/Header';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = React.useState('overview');
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showLogout={true}
        userInfo={`Administrador: ${profile?.full_name}`}
      />
      
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-muted-foreground">
                Gestiona usuarios, proyectos, universidades y más
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Proyectos
            </TabsTrigger>
            <TabsTrigger value="professors" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Profesores
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Estudiantes
            </TabsTrigger>
            <TabsTrigger value="universities" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Universidades
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Programas
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Cursos
            </TabsTrigger>
            <TabsTrigger value="professor-mobility" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Movilidad Docente
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reportes
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mi Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ReportsDashboard />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectManagement />
          </TabsContent>

          <TabsContent value="professors">
            <ProfessorManagement />
          </TabsContent>

          <TabsContent value="students">
            <StudentManagement />
          </TabsContent>

          <TabsContent value="universities">
            <UniversityManagement />
          </TabsContent>

          <TabsContent value="programs">
            <ProgramManagement />
          </TabsContent>

          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>

          <TabsContent value="professor-mobility">
            <ProfessorMobilityManagement />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsDashboard />
          </TabsContent>

          <TabsContent value="profile">
            <AdminProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
