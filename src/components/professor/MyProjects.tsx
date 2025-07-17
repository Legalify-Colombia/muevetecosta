
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Calendar, Users, Eye, Plus } from "lucide-react";
import ProjectDetail from "./ProjectDetail";

const MyProjects = () => {
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Obtener proyectos del profesor
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['professor-projects', user?.id],
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
        .order('joined_at', { ascending: false });
      
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

  const getRoleBadge = (role: string) => {
    const roleMap = {
      'principal_investigator': 'Investigador Principal',
      'co_investigator': 'Co-investigador',
      'collaborator': 'Colaborador'
    };
    
    return roleMap[role as keyof typeof roleMap] || role;
  };

  if (selectedProjectId) {
    return (
      <div>
        <Button 
          variant="outline" 
          onClick={() => setSelectedProjectId(null)}
          className="mb-4"
        >
          ← Volver a Mis Proyectos
        </Button>
        <ProjectDetail projectId={selectedProjectId} />
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mis Proyectos de Investigación</h2>
          <p className="text-muted-foreground">
            Gestiona tu participación en proyectos de investigación colaborativa
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Proponer Proyecto
        </Button>
      </div>

      {/* Lista de Proyectos */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes proyectos aún</h3>
            <p className="text-muted-foreground mb-4">
              Comienza a colaborar en proyectos de investigación con otras universidades
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Proponer tu primer proyecto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((participation) => (
            <Card key={participation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {participation.research_projects?.title}
                      {getStatusBadge(participation.research_projects?.status || 'proposal')}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {participation.research_projects?.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedProjectId(participation.research_projects?.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Mi Rol:</span>
                    <Badge variant="outline">{getRoleBadge(participation.role)}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Inicio:</span>
                    <span>
                      {participation.research_projects?.start_date
                        ? new Date(participation.research_projects.start_date).toLocaleDateString()
                        : 'Por definir'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Universidades:</span>
                    <span>
                      {participation.research_projects?.project_universities?.length || 0} participantes
                    </span>
                  </div>
                </div>

                {/* Universidades participantes */}
                {participation.research_projects?.project_universities && 
                 participation.research_projects.project_universities.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {participation.research_projects.project_universities.map((pu: any, index: number) => (
                        <Badge key={index} variant="secondary">
                          {pu.universities?.name}
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
    </div>
  );
};

export default MyProjects;
