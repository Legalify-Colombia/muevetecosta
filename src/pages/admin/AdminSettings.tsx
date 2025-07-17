
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentManagement from "@/components/admin/ContentManagement";
import DashboardHeader from "@/components/common/DashboardHeader";
import DashboardSidebar from "@/components/common/DashboardSidebar";
import { Settings, FileText, Mail, Shield, Database, Bell } from "lucide-react";

const AdminSettings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Configuración del Sistema"
        searchPlaceholder="Buscar configuraciones..."
      />
      
      <div className="flex">
        <DashboardSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Configuración del Sistema
                </h1>
                <p className="text-muted-foreground">
                  Administra las configuraciones generales del sistema
                </p>
              </div>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="content" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 bg-muted p-1 rounded-lg">
                <TabsTrigger value="content" className="rounded-md">
                  <FileText className="h-4 w-4 mr-2" />
                  Contenido
                </TabsTrigger>
                <TabsTrigger value="notifications" className="rounded-md">
                  <Bell className="h-4 w-4 mr-2" />
                  Notificaciones
                </TabsTrigger>
                <TabsTrigger value="email" className="rounded-md">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="security" className="rounded-md">
                  <Shield className="h-4 w-4 mr-2" />
                  Seguridad
                </TabsTrigger>
                <TabsTrigger value="database" className="rounded-md">
                  <Database className="h-4 w-4 mr-2" />
                  Base de Datos
                </TabsTrigger>
                <TabsTrigger value="general" className="rounded-md">
                  <Settings className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content">
                <ContentManagement />
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Configuración de Notificaciones
                    </CardTitle>
                    <CardDescription>
                      Gestiona las configuraciones de notificaciones del sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Configuración de Notificaciones</h3>
                      <p className="text-muted-foreground">
                        Próximamente - Panel de configuración de notificaciones
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Configuración de Email
                    </CardTitle>
                    <CardDescription>
                      Configura los ajustes de correo electrónico del sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Configuración de Email</h3>
                      <p className="text-muted-foreground">
                        Próximamente - Panel de configuración de email
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Configuración de Seguridad
                    </CardTitle>
                    <CardDescription>
                      Administra los ajustes de seguridad del sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Configuración de Seguridad</h3>
                      <p className="text-muted-foreground">
                        Próximamente - Panel de configuración de seguridad
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="database">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Configuración de Base de Datos
                    </CardTitle>
                    <CardDescription>
                      Administra los ajustes de la base de datos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Configuración de Base de Datos</h3>
                      <p className="text-muted-foreground">
                        Próximamente - Panel de configuración de base de datos
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Configuración General
                    </CardTitle>
                    <CardDescription>
                      Ajustes generales del sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Configuración General</h3>
                      <p className="text-muted-foreground">
                        Próximamente - Panel de configuración general
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
