
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Users, Building, BookOpen, FileText, Settings, LogOut, GraduationCap, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const { signOut, profile, user } = useAuth();

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
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MobiCaribe</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Coordinador: {profile?.full_name}
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
            Dashboard de Coordinación
          </h1>
          <p className="text-lg text-gray-600">
            {myUniversity ? `Gestiona ${myUniversity.name}` : 'Panel de coordinación universitaria'}
          </p>
        </div>

        {/* University Info Card */}
        {myUniversity && (
          <Card className="mb-8">
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
              <div className="grid md:grid-cols-3 gap-4">
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
                  <p className="text-sm text-gray-600">Solicitudes Recibidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
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

          <Card>
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

          <Card>
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
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">Postulaciones</TabsTrigger>
            <TabsTrigger value="programs">Programas</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Postulaciones Recibidas
                </CardTitle>
                <CardDescription>
                  Solicitudes de movilidad estudiantil a tu universidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{app.application_number}</p>
                            <Badge className={getStatusColor(app.status)} variant="secondary">
                              {getStatusText(app.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Estudiante:</strong> {app.profiles?.full_name} 
                            ({app.profiles?.document_number})
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Programa:</strong> {app.academic_programs?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Solicitud enviada: {new Date(app.created_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button size="sm" variant="outline">
                            Ver Detalles
                          </Button>
                          {app.status === 'pending' && (
                            <Button size="sm">
                              Revisar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No hay postulaciones recibidas aún
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Programas Académicos
                </CardTitle>
                <CardDescription>
                  Gestiona los programas disponibles para movilidad estudiantil
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myUniversity?.academic_programs && myUniversity.academic_programs.length > 0 ? (
                  <div className="space-y-4">
                    {myUniversity.academic_programs.map((program) => (
                      <div key={program.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{program.name}</h3>
                            <Badge variant={program.is_active ? "default" : "secondary"}>
                              {program.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                          {program.description && (
                            <p className="text-sm text-gray-600 mb-1">{program.description}</p>
                          )}
                          {program.duration_semesters && (
                            <p className="text-xs text-gray-500">
                              Duración: {program.duration_semesters} semestres
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      No hay programas configurados
                    </p>
                    <Button>Agregar Programa</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuración de Universidad
                </CardTitle>
                <CardDescription>
                  Actualiza la información de tu institución
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Panel de configuración en desarrollo
                  </p>
                  <Button>Próximamente</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
