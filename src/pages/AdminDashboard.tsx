
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
import Header from '@/components/common/Header';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const { profile } = useAuth();
  const isMobile = useIsMobile();

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
                Gestiona usuarios, universidades y configuraciones del sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4 lg:grid-cols-8'}`}>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {!isMobile && "Resumen"}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {!isMobile && "Usuarios"}
            </TabsTrigger>
            <TabsTrigger value="universities" className="flex items-center gap-2">
              <School className="h-4 w-4" />
              {!isMobile && "Universidades"}
            </TabsTrigger>
            <TabsTrigger value="coordinators" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {!isMobile && "Coordinadores"}
            </TabsTrigger>
            <TabsTrigger value="mobility" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              {!isMobile && "Movilidad"}
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {!isMobile && "Email"}
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {!isMobile && "Contenido"}
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {!isMobile && "Reportes"}
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
              <TabsList className={isMobile ? "grid w-full grid-cols-3" : ""}>
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
    </div>
  );
};

export default AdminDashboard;
