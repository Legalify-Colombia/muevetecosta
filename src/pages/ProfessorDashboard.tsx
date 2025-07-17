
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, User, Search, FileText, Bell, Plus, Users, Lightbulb } from "lucide-react";
import ProfessorProfile from "@/components/professor/ProfessorProfile";
import MyProjects from "@/components/professor/MyProjects";
import ProjectSearch from "@/components/professor/ProjectSearch";
import ProjectsOverview from "@/components/professor/ProjectsOverview";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ProfessorDashboard = () => {
  const { user, profile } = useAuth();

  // Obtener proyectos activos del profesor
  const { data: activeProjects = [] } = useQuery({
    queryKey: ['professor-active-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('project_participants')
        .select(`
          *,
          research_projects (
            id,
            title,
            status,
            start_date,
            end_date
          )
        `)
        .eq('professor_id', user.id)
        .eq('status', 'active');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Obtener estadísticas generales de investigación
  const { data: researchStats } = useQuery({
    queryKey: ['research-stats'],
    queryFn: async () => {
      const [projectsResult, opportunitiesResult] = await Promise.all([
        supabase
          .from('research_projects')
          .select('status')
          .eq('is_public', true),
        supabase
          .from('research_projects')
          .select('id')
          .eq('status', 'proposal')
          .eq('is_public', true)
      ]);
      
      return {
        totalProjects: projectsResult.data?.length || 0,
        activeProjects: projectsResult.data?.filter(p => p.status === 'active').length || 0,
        opportunities: opportunitiesResult.data?.length || 0
      };
    }
  });

  // Obtener notificaciones recientes
  const { data: notifications = [] } = useQuery({
    queryKey: ['professor-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Bienvenida */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ¡Bienvenido, Prof. {profile?.full_name}!
          </h1>
          <p className="text-muted-foreground">
            Centro de gestión para proyectos de investigación colaborativa en la red MobiCaribe
          </p>
        </div>

        {/* Resumen Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Proyectos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects.length}</div>
              <p className="text-xs text-muted-foreground">
                Proyectos en los que participo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Red MobiCaribe</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{researchStats?.activeProjects || 0}</div>
              <p className="text-xs text-muted-foreground">
                Proyectos activos en la red
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{researchStats?.opportunities || 0}</div>
              <p className="text-xs text-muted-foreground">
                Propuestas para colaborar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notificaciones</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
              <p className="text-xs text-muted-foreground">
                Notificaciones recientes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notificaciones Recientes */}
        {notifications.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notificaciones Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pestañas principales */}
        <Tabs defaultValue="research" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="research">Investigación</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
            <TabsTrigger value="projects">Mis Proyectos</TabsTrigger>
            <TabsTrigger value="search">Explorar</TabsTrigger>
          </TabsList>

          <TabsContent value="research" className="space-y-6">
            <ProjectsOverview />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Proyectos Activos Resumidos */}
              <Card>
                <CardHeader>
                  <CardTitle>Mis Proyectos Activos</CardTitle>
                  <CardDescription>
                    Resumen de tus proyectos de investigación en curso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeProjects.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No tienes proyectos activos en este momento
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activeProjects.slice(0, 3).map((participation) => (
                        <div key={participation.id} className="border rounded-lg p-3">
                          <h4 className="font-medium">{participation.research_projects?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Rol: {participation.role === 'principal_investigator' ? 'Investigador Principal' : 
                                 participation.role === 'co_investigator' ? 'Co-investigador' : 'Colaborador'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Estado: {participation.research_projects?.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enlaces Rápidos */}
              <Card>
                <CardHeader>
                  <CardTitle>Enlaces Rápidos</CardTitle>
                  <CardDescription>
                    Acceso directo a las funciones más utilizadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Editar Mi Perfil
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Ver Todos Mis Proyectos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Explorar Proyectos de la Red
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Proponer Nuevo Proyecto
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <ProfessorProfile />
          </TabsContent>

          <TabsContent value="projects">
            <MyProjects />
          </TabsContent>

          <TabsContent value="search">
            <ProjectSearch />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default ProfessorDashboard;
