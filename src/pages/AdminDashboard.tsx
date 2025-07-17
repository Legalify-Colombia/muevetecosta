import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building, FileText, Settings, LogOut, BarChart3, UserCog, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserManagement } from "@/components/admin/UserManagement";
import { UniversityManagement } from "@/components/admin/UniversityManagement";
import ContentManagement from "@/components/admin/ContentManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        universitiesResult,
        applicationsResult,
        studentsResult,
        coordinatorsResult
      ] = await Promise.all([
        supabase.from('universities').select('id').eq('is_active', true),
        supabase.from('mobility_applications').select('id, status'),
        supabase.from('profiles').select('id').eq('role', 'student'),
        supabase.from('profiles').select('id').eq('role', 'coordinator')
      ]);

      return {
        universities: universitiesResult.data?.length || 0,
        applications: applicationsResult.data?.length || 0,
        pendingApplications: applicationsResult.data?.filter(app => app.status === 'pending').length || 0,
        students: studentsResult.data?.length || 0,
        coordinators: coordinatorsResult.data?.length || 0,
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

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/df25e485-5dd4-485d-958a-b48ea880cc0f.png" 
                alt="Muévete por la Costa" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">Panel de Administración</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Administrador: {profile?.full_name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <p className="text-lg text-gray-600">
            Centro de control para gestionar el programa de movilidad estudiantil
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Universidades</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.universities || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.students || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Postulaciones</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.applications || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <UserCog className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Coordinadores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.coordinators || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="universities">Universidades</TabsTrigger>
            <TabsTrigger value="applications">Postulaciones</TabsTrigger>
            <TabsTrigger value="content">Contenidos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Applications */}
              <Card>
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
                      <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{app.application_number}</p>
                          <p className="text-sm text-gray-600">
                            {app.profiles?.full_name} → {app.universities?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(app.created_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <Badge className={getStatusColor(app.status)} variant="secondary">
                          {getStatusText(app.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Acciones Rápidas
                  </CardTitle>
                  <CardDescription>
                    Gestión del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Building className="h-4 w-4 mr-2" />
                    Gestionar Universidades
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Administrar Usuarios
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Configurar Contenidos
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Reportes
                  </Button>
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

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Postulaciones</CardTitle>
                <CardDescription>
                  Revisar y procesar solicitudes de movilidad estudiantil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Panel de gestión de postulaciones en desarrollo
                  </p>
                  <Button>Próximamente</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <ContentManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
