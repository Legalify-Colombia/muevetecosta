
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building, BookOpen, FileText, LogOut, GraduationCap, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UniversityProfile } from "@/components/coordinator/UniversityProfile";
import { ProgramManagement } from "@/components/coordinator/ProgramManagement";
import { ApplicationsList } from "@/components/coordinator/ApplicationsList";
import { ApplicationDetail } from "@/components/coordinator/ApplicationDetail";

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const { signOut, profile, user } = useAuth();
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

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

  const { data: notifications = [] } = useQuery({
    queryKey: ['coordinator-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const stats = {
    totalPrograms: myUniversity?.academic_programs?.length || 0,
    activePrograms: myUniversity?.academic_programs?.filter(p => p.is_active).length || 0,
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'pending').length,
    approvedApplications: applications.filter(app => app.status === 'approved').length,
    inReviewApplications: applications.filter(app => app.status === 'in_review').length,
    unreadNotifications: notifications.length,
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleViewApplication = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
  };

  const handleBackToList = () => {
    setSelectedApplicationId(null);
  };

  // If viewing application detail, show that component
  if (selectedApplicationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/df25e485-5dd4-485d-958a-b48ea880cc0f.png" 
                  alt="Muévete por la Costa" 
                  className="h-8 w-auto"
                />
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
          <ApplicationDetail 
            applicationId={selectedApplicationId} 
            onBack={handleBackToList}
          />
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
            </div>
            <div className="flex items-center space-x-4">
              {stats.unreadNotifications > 0 && (
                <div className="relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {stats.unreadNotifications}
                  </Badge>
                </div>
              )}
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications">Postulaciones</TabsTrigger>
            <TabsTrigger value="programs">Programas</TabsTrigger>
            <TabsTrigger value="university">Universidad</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <ApplicationsList onViewApplication={handleViewApplication} />
          </TabsContent>

          <TabsContent value="programs">
            <ProgramManagement />
          </TabsContent>

          <TabsContent value="university">
            <UniversityProfile />
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notificaciones
                </CardTitle>
                <CardDescription>
                  Alertas y comunicaciones del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(notification.created_at).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <Badge variant="secondary">{notification.type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay notificaciones pendientes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
