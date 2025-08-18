import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical, Search, Filter, Plus, Calendar, Users, Eye, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProjectPermissions } from '@/hooks/useProjectPermissions';
import { useMyCoilProjects } from '@/hooks/useCoilProjects';
import ProjectDetail from './ProjectDetail';

export default function MyProjects() {
  const { user } = useAuth();
  const { canCreateProject } = useProjectPermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedTab, setSelectedTab] = useState("research");

  // Proyectos de investigación
  const { data: researchProjects = [], isLoading: loadingResearch } = useQuery({
    queryKey: ['my-research-projects', user?.id, statusFilter],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('research_projects')
        .select(`
          *,
          project_participants!inner(*),
          project_universities(
            universities(name, city)
          )
        `)
        .eq('project_participants.professor_id', user.id)
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && selectedTab === "research"
  });

  // Proyectos COIL
  const { data: coilProjects = [], isLoading: loadingCoil } = useMyCoilProjects();

  const handleCreateProject = () => {
    if (!canCreateProject()) {
      console.warn('User does not have permission to create projects');
      return;
    }
    setShowCreateProject(true);
  };

  const filteredResearchProjects = researchProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCoilProjects = coilProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'proposal':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'proposal':
        return 'Propuesta';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loadingResearch && selectedTab === "research") {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FlaskConical className="h-5 w-5 mr-2" />
                Mis Proyectos
              </CardTitle>
              <CardDescription>
                Gestiona y visualiza todos tus proyectos de investigación y COIL
              </CardDescription>
            </div>
            {canCreateProject() && (
              <Button onClick={handleCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="proposal">Propuestas</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs para diferentes tipos de proyectos */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="research" className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                Proyectos de Investigación
              </TabsTrigger>
              <TabsTrigger value="coil" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Proyectos COIL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="research">
              {filteredResearchProjects.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResearchProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg line-clamp-2 mb-2 flex items-center gap-2">
                            <FlaskConical className="h-5 w-5" />
                            {project.title}
                          </h3>
                          <Badge className={getStatusColor(project.status)} variant="secondary">
                            {getStatusText(project.status)}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {project.description}
                      </p>
                      
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {project.start_date 
                              ? new Date(project.start_date).toLocaleDateString('es-ES')
                              : 'Sin fecha de inicio'
                            }
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{project.project_participants?.length || 0} colaborador(es)</span>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProject(project)}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FlaskConical className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No se encontraron proyectos de investigación'
                      : 'No tienes proyectos de investigación aún'
                    }
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Intenta cambiar los filtros de búsqueda'
                      : 'Comienza creando tu primer proyecto de investigación'
                    }
                  </p>
                  {canCreateProject() && !searchTerm && statusFilter === 'all' && (
                    <Button onClick={handleCreateProject}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Proyecto
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="coil">
              {filteredCoilProjects.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCoilProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg line-clamp-2 mb-2 flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            {project.title}
                          </h3>
                          <Badge className={getStatusColor(project.status)} variant="secondary">
                            {getStatusText(project.status)}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {project.description}
                      </p>
                      
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Máximo: {project.max_participants} participantes</span>
                        </div>
                        
                        {project.host_university_name && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{project.host_university_name}</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/coil?project=${project.id}`, '_blank')}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Proyecto COIL
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No se encontraron proyectos COIL'
                      : 'No participas en proyectos COIL aún'
                    }
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Intenta cambiar los filtros de búsqueda'
                      : 'Busca proyectos COIL disponibles para aplicar'
                    }
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Project Detail Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.title}</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <ProjectDetail 
              projectId={selectedProject.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
