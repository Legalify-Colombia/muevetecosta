
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardHeader from "@/components/common/DashboardHeader";
import DashboardSidebar from "@/components/common/DashboardSidebar";
import { BarChart3, Download, Calendar, TrendingUp, Users, Building, FileText, Activity } from "lucide-react";

const AdminReports = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Reportes y Analíticas"
        searchPlaceholder="Buscar reportes..."
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
                  Reportes y Analíticas
                </h1>
                <p className="text-muted-foreground">
                  Análisis estadístico y reportes del sistema de movilidad estudiantil
                </p>
              </div>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Exportar Datos
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Postulaciones Mes</p>
                      <p className="text-3xl font-bold text-primary">45</p>
                      <div className="flex items-center space-x-1 text-sm text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+12% vs mes anterior</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Usuarios Activos</p>
                      <p className="text-3xl font-bold text-primary">198</p>
                      <div className="flex items-center space-x-1 text-sm text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+8% vs mes anterior</span>
                      </div>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Universidades</p>
                      <p className="text-3xl font-bold text-primary">28</p>
                      <div className="flex items-center space-x-1 text-sm text-blue-600">
                        <Activity className="h-3 w-3" />
                        <span>Red activa</span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Building className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Proyectos</p>
                      <p className="text-3xl font-bold text-primary">15</p>
                      <div className="flex items-center space-x-1 text-sm text-orange-600">
                        <Activity className="h-3 w-3" />
                        <span>8 activos</span>
                      </div>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reports Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Reportes Disponibles
                  </CardTitle>
                  <CardDescription>
                    Reportes estadísticos del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <h3 className="font-medium">Postulaciones por Universidad</h3>
                        <p className="text-sm text-muted-foreground">Análisis de destinos más populares</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Generar
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <h3 className="font-medium">Usuarios por Rol</h3>
                        <p className="text-sm text-muted-foreground">Distribución de roles en el sistema</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Generar
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <h3 className="font-medium">Actividad Mensual</h3>
                        <p className="text-sm text-muted-foreground">Tendencias de uso del sistema</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Generar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Actividad Reciente
                  </CardTitle>
                  <CardDescription>
                    Últimas actividades del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nueva postulación procesada</p>
                        <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                      </div>
                      <Badge variant="secondary">Nuevo</Badge>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Usuario registrado</p>
                        <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                      </div>
                      <Badge variant="secondary">Usuario</Badge>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Building className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Universidad actualizada</p>
                        <p className="text-xs text-muted-foreground">Hace 6 horas</p>
                      </div>
                      <Badge variant="secondary">Sistema</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminReports;
