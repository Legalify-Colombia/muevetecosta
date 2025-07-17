import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserManagement } from '@/components/admin/UserManagement';
import { UniversityManagement } from '@/components/admin/UniversityManagement';
import { ReportsDashboard } from '@/components/admin/reports/ReportsDashboard';
import { EmailTemplateManager } from '@/components/admin/EmailTemplateManager';
import { EmailConfiguration } from '@/components/admin/EmailConfiguration';
import { EmailHistory } from '@/components/admin/EmailHistory';
import ContentManagement from '@/components/admin/ContentManagement';
import { ProfessorMobilityManagement } from '@/components/admin/ProfessorMobilityManagement';
import Header from '@/components/common/Header';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { 
  Users, 
  School, 
  FileText
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { profile } = useAuth();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <SidebarInset className="flex-1">
          <Header 
            showLogout={true}
            userInfo={`Administrador: ${profile?.full_name}`}
          />
          
          {isMobile && (
            <div className="flex items-center gap-2 px-4 py-2 border-b">
              <SidebarTrigger />
              <h1 className="font-semibold">Panel de Administración</h1>
            </div>
          )}
          
          <div className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <div>
                  {!isMobile && <h1 className="text-2xl font-bold">Panel de Administración</h1>}
                  <p className="text-muted-foreground">
                    Gestiona usuarios, universidades y configuraciones del sistema
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-6">
            <Tabs value={activeTab} className="space-y-6">
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
