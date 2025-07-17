
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, University, FileText, Settings, Plane } from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';
import UniversityManagement from '@/components/admin/UniversityManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import ProjectManagement from '@/components/admin/ProjectManagement';
import { ProfessorMobilityManagement } from '@/components/admin/ProfessorMobilityManagement';
import Header from '@/components/common/Header';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showLogout={true}
        userInfo="Administrador"
      />
      
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-muted-foreground">
                Gestiona usuarios, universidades y contenido del sistema MobiCaribe
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="universities" className="flex items-center gap-2">
              <University className="h-4 w-4" />
              Universidades
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Proyectos
            </TabsTrigger>
            <TabsTrigger value="mobility" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Movilidad Profesores
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Contenido
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
        </Tabs>
      </div>
    </div>
  );
}
