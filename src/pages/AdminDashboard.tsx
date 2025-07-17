
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/admin/UserManagement';
import { UniversityManagement } from '@/components/admin/UniversityManagement';
import { ProjectManagement } from '@/components/admin/ProjectManagement';
import { ProfessorMobilityManagement } from '@/components/admin/ProfessorMobilityManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import { EmailConfiguration } from '@/components/admin/EmailConfiguration';
import ReportsAnalytics from '@/components/admin/ReportsAnalytics';
import { Users, Building2, Briefcase, Plane, FileText, Mail, BarChart3 } from 'lucide-react';
import Header from '@/components/common/Header';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showLogout={true}
        userInfo="Administrador"
      />
      
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="universities" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Universidades
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Proyectos
            </TabsTrigger>
            <TabsTrigger value="mobility" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Movilidad
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contenido
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Correo
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reportes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="universities">
            <UniversityManagement />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectManagement />
          </TabsContent>

          <TabsContent value="mobility">
            <ProfessorMobilityManagement />
          </TabsContent>

          <TabsContent value="content">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="email">
            <EmailConfiguration />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
