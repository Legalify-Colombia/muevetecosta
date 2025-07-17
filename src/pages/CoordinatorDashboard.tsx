
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building, BookOpen, FileText, GraduationCap, Bell, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/common/DashboardHeader";
import DashboardSidebar from "@/components/common/DashboardSidebar";
import { Link } from "react-router-dom";

const CoordinatorDashboard = () => {
  const { profile, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: myUniversity } = useQuery({
    queryKey: ['coordinator-university', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('universities')
        .select(`
          *,
          academic_programs (
            id,
            name,
            description,
            duration_semesters,
            is_active
          )
        `)
        .eq('coordinator_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['coordinator-applications', myUniversity?.id],
    queryFn: async () => {
      if (!myUniversity?.id) return [];
      const { data, error } = await supabase
        .from('mobility_applications')
        .select(`
          *,
          profiles!mobility_applications_student_id_fkey(full_name, document_number),
          academic_programs(name)
        `)
        .eq('destination_university_id', myUniversity.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!myUniversity?.id
  });

  const stats = {
    totalPrograms: myUniversity?.academic_programs?.length || 0,
    activePrograms: myUniversity?.academic_programs?.filter(p => p.is_active).length || 0,
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'pending').length,
    approvedApplications: applications.filter(app => app.status === 'approved').length,
    inReviewApplications: applications.filter(app => app.status === 'in_review').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Panel de Coordinación"
        searchPlaceholder="Buscar postulaciones, programas..."
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
              {myUniversity ? `Gestiona ${myUniversity.name}` : 'Panel de coordinación universitaria'}
            </p>
          </div>

          {/* University Info Card */}
          {myUniversity && (
            <Card className="mb-8 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  {myUniversity.name}
                </CardTitle>
                <CardDescription>
                  {myUniversity.city && `${myUniversity.city} • `}
                  {myUniversity.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.totalPrograms}</p>
                    <p className="text-sm text-gray-600">Programas Totales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.activePrograms}</p>
                    <p className="text-sm text-gray-600">Programas Activos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{stats.totalApplications}</p>
                    <p className="text-sm text-gray-600">Postulaciones Totales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{stats.pendingApplications}</p>
                    <p className="text-sm text-gray-600">Pendientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Link to="/coordinator/applications">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pendientes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">En Revisión</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.inReviewApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.approvedApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link to="/coordinator/programs">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Programas</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activePrograms}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Postulaciones Recientes
                </CardTitle>
                <CardDescription>
                  Últimas postulaciones recibidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="space-y-1">
                        <p className="font-medium">{app.application_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.profiles?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(app.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {app.status === 'pending' && 'Pendiente'}
                        {app.status === 'in_review' && 'En Revisión'}
                        {app.status === 'approved' && 'Aprobado'}
                        {app.status === 'rejected' && 'Rechazado'}
                      </Badge>
                    </div>
                  ))}
                  {applications.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No hay postulaciones recientes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Estadísticas Universitarias
                </CardTitle>
                <CardDescription>
                  Resumen de actividad de tu universidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Programas Académicos</p>
                        <p className="text-xs text-muted-foreground">Total disponibles</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{stats.totalPrograms}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Postulaciones este mes</p>
                        <p className="text-xs text-muted-foreground">Nuevas solicitudes</p>
                      </div>
                    </div>
                    <Badge variant="secondary">+{stats.pendingApplications}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Tasa de aprobación</p>
                        <p className="text-xs text-muted-foreground">Histórico</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {stats.totalApplications > 0 
                        ? Math.round((stats.approvedApplications / stats.totalApplications) * 100)
                        : 0}%
                    </Badge>
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

export default CoordinatorDashboard;
