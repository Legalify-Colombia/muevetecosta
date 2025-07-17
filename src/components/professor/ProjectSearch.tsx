
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Calendar, Users, Eye } from "lucide-react";

const ProjectSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Obtener proyectos públicos
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['public-projects', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('research_projects')
        .select(`
          *,
          project_universities (
            universities (
              name
            )
          ),
          project_participants (
            id,
            role,
            profiles (
              full_name
            )
          )
        `)
        .eq('is_public', true);

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
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

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Explorar Proyectos de Investigación</h2>
        <p className="text-muted-foreground mb-6">
          Descubre proyectos de investigación de otras universidades y encuentra oportunidades de colaboración
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por título, descripción o palabras clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="proposal">Propuestas</SelectItem>
              <SelectItem value="active">En Curso</SelectItem>
              <SelectItem value="completed">Finalizados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Proyectos */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Buscando proyectos...</p>
            </div>
          </CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron proyectos</h3>
            <p className="text-muted-foreground">
              Intenta ajustar tus criterios de búsqueda
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {project.title}
                      {getStatusBadge(project.status)}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {project.description}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Más
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Inicio:</span>
                    <span>
                      {project.start_date
                        ? new Date(project.start_date).toLocaleDateString()
                        : 'Por definir'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Participantes:</span>
                    <span>{project.project_participants?.length || 0}</span>
                  </div>
                </div>

                {/* Universidades participantes */}
                {project.project_universities && project.project_universities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Universidades participantes:</p>
                    <div className="flex flex-wrap gap-2">
                      {project.project_universities.map((pu: any, index: number) => (
                        <Badge key={index} variant="secondary">
                          {pu.universities?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Objetivos (si están disponibles) */}
                {project.objectives && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-1">Objetivos:</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.objectives}
                    </p>
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

export default ProjectSearch;
