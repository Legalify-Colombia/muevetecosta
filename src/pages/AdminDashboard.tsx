
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserManagement } from '@/components/admin/UserManagement';
import { UniversityManagement } from '@/components/admin/UniversityManagement';
import { ReportsDashboard } from '@/components/admin/reports/ReportsDashboard';
import { EmailTemplateManager } from '@/components/admin/EmailTemplateManager';
import { EmailConfiguration } from '@/components/admin/EmailConfiguration';
import { EmailHistory } from '@/components/admin/EmailHistory';
import ContentManagement from '@/components/admin/ContentManagement';
import { ProfessorMobilityManagement } from '@/components/admin/ProfessorMobilityManagement';
import { UniversityCoordinatorAssignment } from '@/components/admin/UniversityCoordinatorAssignment';
import { 
  Users, 
  School, 
  BarChart3, 
  Mail, 
  Settings, 
  FileText, 
  Plane,
  User
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Gestiona usuarios, universidades y configuraciones del sistema
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="universities">
            <School className="h-4 w-4 mr-2" />
            Universidades
          </TabsTrigger>
          <TabsTrigger value="coordinators">
            <User className="h-4 w-4 mr-2" />
            Coordinadores
          </TabsTrigger>
          <TabsTrigger value="mobility">
            <Plane className="h-4 w-4 mr-2" />
            Movilidad
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="h-4 w-4 mr-2" />
            Contenido
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  Usuarios registrados en el sistema
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Universidades</CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  Universidades activas
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Postulaciones</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  Total de postulaciones
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="universities">
          <UniversityManagement />
        </TabsContent>

        <TabsContent value="coordinators">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Función de asignación de coordinadores disponible en la gestión de universidades
            </p>
          </div>
        </TabsContent>

        <TabsContent value="mobility">
          <ProfessorMobilityManagement />
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Tabs defaultValue="templates">
            <TabsList>
              <TabsTrigger value="templates">Plantillas</TabsTrigger>
              <TabsTrigger value="config">Configuración</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates">
              <EmailTemplateManager />
            </TabsContent>
            
            <TabsContent value="config">
              <EmailConfiguration />
            </TabsContent>
            
            <TabsContent value="history">
              <EmailHistory />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="content">
          <ContentManagement />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
