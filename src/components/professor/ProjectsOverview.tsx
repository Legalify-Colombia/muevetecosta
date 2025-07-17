
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Calendar, Users, Search, Filter, Plus, Eye } from "lucide-react";
import ProjectCreation from "./ProjectCreation";
import ProjectDetail from "./ProjectDetail";

const ProjectsOverview = () => {
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Obtener todos los proyectos públicos para búsqueda general
  const { data: publicProjects = [], isLoading } = useQuery({
    queryKey: ['public-research-projects', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('research_projects')
        .select(`
          *,
          project_participants (
            *,
            profiles (
              full_name
            ),
            universities (
              name
            )
          ),
          project_universities (
            role,
            universities (
              name
            )
          )
        `)
        .eq('is_public', true);
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });

  // Obtener proyectos del profesor actual
  const { data: myProjects = [] } = useQuery({
    queryKey: ['my-professor-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('project_participants')
        .select(`
          *,
          research_projects (
            *,
            project_universities (
              universities (
                name
              )
            )
          )
        `)
        .eq('professor_id', user.id)
        .eq('status', 'active');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'proposal': { label: 'Propuesta', variant: 'outline' as const },
      'active': { label: 'En Curso', variant: 'default' as const },
      'completed': { label: 'Finalizado', variant: 'secondary' as const },
      'cancelled': { label: 'Cancelado', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.proposal;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const isMyProject = (projectId: string) => {
    return myProjects.some(mp => mp.research_projects?.id === projectId);
  };

  if (selectedProjectId) {
    return (
      <div>
        <Button 
          variant="outline" 
          onClick={() => setSelectedProjectId(null)}
          className="mb-4"
        >
          ← Volver a Proyectos
        </Button>
        <ProjectDetail projectId={selectedProjectId} />
      </div>
    );
  }

  if (showCreateProject) {
    return (
      <div>
        <Button 
          variant="outline" 
          onClick={() => setShowCreateProject(false)}
          className="mb-4"
        >
          ← Volver a Proyectos
        </Button>
        <ProjectCreation onClose={() => setShowCreateProject(false)} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando proyectos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis Proyectos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              Proyectos en los que participo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {publicProjects.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              En toda la red MobiCaribe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevas Oportunidades</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {publicProjects.filter(p => p.status === 'proposal').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Propuestas para colaborar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles de búsqueda y filtros */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Proyectos de Investigación Colaborativa</CardTitle>
              <CardDescription>
                Explora y gestiona proyectos de investigación en la red MobiCaribe
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateProject(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Proponer Proyecto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, descripción o investigador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="proposal">Propuestas</SelectItem>
                <SelectItem value="active">En Curso</SelectItem>
                <SelectItem value="completed">Finalizados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Proyectos */}
          {publicProjects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron proyectos</h3>
              <p className="text-muted-foreground mb-4">
                No hay proyectos que coincidan con los criterios de búsqueda
              </p>
              <Button onClick={() => setShowCreateProject(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear el primer proyecto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {publicProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className={`hover:shadow-md transition-shadow ${
                    isMyProject(project.id) ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{project.title}</h3>
                          {getStatusBadge(project.status)}
                          {isMyProject(project.id) && (
                            <Badge variant="secondary">Mi Proyecto</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Inicio:</span>
                        <span>
                          {project.start_date
                            ? new Date(project.start_date).toLocaleDateString()
                            : 'Por definir'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Participantes:</span>
                        <span>{project.project_participants?.length || 0} investigadores</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Universidades:</span>
                        <span>{project.project_universities?.length || 0} instituciones</span>
                      </div>
                    </div>

                    {/* Universidades participantes */}
                    {project.project_universities && project.project_universities.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {project.project_universities.map((pu: any, index: number) => (
                            <Badge key={index} variant="outline">
                              {pu.universities?.name}
                              {pu.role === 'lead' && ' (Líder)'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsOverview;
