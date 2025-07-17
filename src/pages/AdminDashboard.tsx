
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building, FileText, BarChart3, UserCog, TrendingUp, Activity, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/common/DashboardHeader";
import DashboardSidebar from "@/components/common/DashboardSidebar";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        universitiesResult,
        applicationsResult,
        studentsResult,
        coordinatorsResult,
        projectsResult
      ] = await Promise.all([
        supabase.from('universities').select('id').eq('is_active', true),
        supabase.from('mobility_applications').select('id, status'),
        supabase.from('profiles').select('id').eq('role', 'student'),
        supabase.from('profiles').select('id').eq('role', 'coordinator'),
        supabase.from('research_projects').select('id, status')
      ]);

      return {
        universities: universitiesResult.data?.length || 0,
        applications: applicationsResult.data?.length || 0,
        pendingApplications: applicationsResult.data?.filter(app => app.status === 'pending').length || 0,
        students: studentsResult.data?.length || 0,
        coordinators: coordinatorsResult.data?.length || 0,
        projects: projectsResult.data?.length || 0,
        activeProjects: projectsResult.data?.filter(p => p.status === 'active').length || 0,
      };
    }
  });

  const { data: recentApplications = [] } = useQuery({
    queryKey: ['recent-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobility_applications')
        .select(`
          *,
          profiles!mobility_applications_student_id_fkey(full_name),
          universities(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_review':
        return "bg-yellow-100 text-yellow-800";
      case 'approved':
        return "bg-green-100 text-green-800";
      case 'pending':
        return "bg-blue-100 text-blue-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      case 'completed':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_review':
        return "En Revisión";
      case 'approved':
        return "Aprobado";
      case 'pending':
        return "Pendiente";
      case 'rejected':
        return "Rechazado";
      case 'completed':
        return "Completado";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Panel de Administración"
        searchPlaceholder="Buscar usuarios, universidades..."
      />
      
      <div className="flex">
        <DashboardSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              ¡Bienvenido, {profile?.full_name}!
            </h1>
            <p className="text-muted-foreground">
              Centro de control para gestionar el programa de movilidad estudiantil
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link to="/admin/universities">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Universidades</p>
                      <p className="text-3xl font-bold text-primary">{stats?.universities || 0}</p>
                      <div className="flex items-center space-x-1 text-sm text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+12% vs mes anterior</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/users">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estudiantes</p>
                      <p className="text-3xl font-bold text-primary">{stats?.students || 0}</p>
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
            </Link>

            <Link to="/admin/applications">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Postulaciones</p>
                      <p className="text-3xl font-bold text-primary">{stats?.applications || 0}</p>
                      <div className="flex items-center space-x-1 text-sm text-yellow-600">
                        <Activity className="h-3 w-3" />
                        <span>{stats?.pendingApplications || 0} pendientes</span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Proyectos</p>
                    <p className="text-3xl font-bold text-primary">{stats?.projects || 0}</p>
                    <div className="flex items-center space-x-1 text-sm text-blue-600">
                      <Activity className="h-3 w-3" />
                      <span>{stats?.activeProjects || 0} activos</span>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Lightbulb className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Postulaciones Recientes
                </CardTitle>
                <CardDescription>
                  Últimas solicitudes de movilidad estudiantil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="font-medium">{app.application_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.profiles?.full_name} → {app.universities?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(app.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <Badge className={getStatusColor(app.status)} variant="secondary">
                        {getStatusText(app.status)}
                      </Badge>
                    </div>
                  ))}
                  {recentApplications.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No hay postulaciones recientes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Activity */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Actividad del Sistema
                </CardTitle>
                <CardDescription>
                  Resumen de actividad en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Nuevos usuarios</p>
                        <p className="text-xs text-muted-foreground">Últimos 7 días</p>
                      </div>
                    </div>
                    <Badge variant="secondary">+15</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Postulaciones procesadas</p>
                        <p className="text-xs text-muted-foreground">Esta semana</p>
                      </div>
                    </div>
                    <Badge variant="secondary">+8</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Building className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Universidades activas</p>
                        <p className="text-xs text-muted-foreground">En el sistema</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{stats?.universities || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
