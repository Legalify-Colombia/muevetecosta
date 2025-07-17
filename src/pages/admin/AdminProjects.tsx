
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Calendar, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit,
  Trash2,
  Archive,
  BarChart3,
  Building,
  User,
  FileText,
  Settings,
  Lightbulb,
  Globe
} from "lucide-react";

const AdminProjects = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    objectives: "",
    status: "proposal",
    start_date: "",
    end_date: "",
    lead_university_id: "",
    is_public: true
  });

  // Obtener todos los proyectos de investigación
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['admin-research-projects', searchTerm, statusFilter, universityFilter],
    queryFn: async () => {
      let query = supabase
        .from('research_projects')
        .select(`
          *,
          project_participants (
            *,
            profiles (
              full_name,
              role
            ),
            universities (
              name
            )
          ),
          project_universities (
            role,
            universities (
              name,
              id
            )
          ),
          universities!research_projects_lead_university_id_fkey (
            name
          )
        `);
      
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

  // Obtener universidades para filtros y formularios
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Obtener profesores para asignación
  const { data: professors = [] } = useQuery({
    queryKey: ['professors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          professor_info (
            university
          )
        `)
        .eq('role', 'professor');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Estadísticas de proyectos
  const { data: projectStats } = useQuery({
    queryKey: ['project-stats'],
    queryFn: async () => {
      const { data: allProjects, error } = await supabase
        .from('research_projects')
        .select('status');
      
      if (error) throw error;
      
      const stats = {
        total: allProjects.length,
        active: allProjects.filter(p => p.status === 'active').length,
        proposals: allProjects.filter(p => p.status === 'proposal').length,
        completed: allProjects.filter(p => p.status === 'completed').length
      };
      
      return stats;
    }
  });

  // Mutación para crear proyecto
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const { data, error } = await supabase
        .from('research_projects')
        .insert([projectData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-research-projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      setShowCreateProject(false);
      setFormData({
        title: "",
        description: "",
        objectives: "",
        status: "proposal",
        start_date: "",
        end_date: "",
        lead_university_id: "",
        is_public: true
      });
      toast({
        title: "Proyecto creado",
        description: "El proyecto de investigación ha sido creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error al crear el proyecto: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Mutación para actualizar proyecto
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...projectData }: any) => {
      const { data, error } = await supabase
        .from('research_projects')
        .update(projectData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-research-projects'] });
      setShowEditProject(false);
      setSelectedProject(null);
      toast({
        title: "Proyecto actualizado",
        description: "El proyecto ha sido actualizado exitosamente.",
      });
    }
  });

  // Mutación para eliminar proyecto
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('research_projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-research-projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto ha sido eliminado permanentemente.",
      });
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

  const handleCreateProject = () => {
    createProjectMutation.mutate(formData);
  };

  const handleUpdateProject = () => {
    if (selectedProject) {
      updateProjectMutation.mutate({ id: selectedProject.id, ...formData });
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.')) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  const openEditDialog = (project: any) => {
    setSelectedProject(project);
    setFormData({
      title: project.title,
      description: project.description || "",
      objectives: project.objectives || "",
      status: project.status,
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      lead_university_id: project.lead_university_id || "",
      is_public: project.is_public
    });
    setShowEditProject(true);
  };

  if (projectsLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Proyectos de Investigación</h1>
          <p className="text-muted-foreground">
            Control total sobre todos los proyectos de investigación colaborativa
          </p>
        </div>
        <Button onClick={() => setShowCreateProject(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Proyecto
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">En toda la red</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">En desarrollo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propuestas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats?.proposals || 0}</div>
            <p className="text-xs text-muted-foreground">Por aprobar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats?.completed || 0}</div>
            <p className="text-xs text-muted-foreground">Completados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, descripción..."
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

            <Select value={universityFilter} onValueChange={setUniversityFilter}>
              <SelectTrigger className="w-48">
                <Building className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Universidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Universidades</SelectItem>
                {universities.map((university) => (
                  <SelectItem key={university.id} value={university.id}>
                    {university.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Proyectos */}
      <Card>
        <CardHeader>
          <CardTitle>Proyectos de Investigación</CardTitle>
          <CardDescription>
            Gestión completa de todos los proyectos en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{project.title}</h3>
                          {getStatusBadge(project.status)}
                          {project.is_public && (
                            <Badge variant="outline">
                              <Globe className="h-3 w-3 mr-1" />
                              Público
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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
                        <span>{project.project_participants?.length || 0}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Universidades:</span>
                        <span>{project.project_universities?.length || 0}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Líder:</span>
                        <span>{project.universities?.name || 'Sin asignar'}</span>
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

      {/* Dialog para crear proyecto */}
      <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proyecto de Investigación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título del Proyecto</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ingrese el título del proyecto"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción detallada del proyecto"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="objectives">Objetivos</Label>
              <Textarea
                id="objectives"
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                placeholder="Objetivos del proyecto"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposal">Propuesta</SelectItem>
                    <SelectItem value="active">En Curso</SelectItem>
                    <SelectItem value="completed">Finalizado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="lead_university">Universidad Líder</Label>
                <Select value={formData.lead_university_id} onValueChange={(value) => setFormData({ ...formData, lead_university_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar universidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((university) => (
                      <SelectItem key={university.id} value={university.id}>
                        {university.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Fecha de Inicio</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="end_date">Fecha de Finalización</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              />
              <Label htmlFor="is_public">Proyecto público (visible en búsquedas)</Label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateProject(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateProject} disabled={createProjectMutation.isPending}>
                {createProjectMutation.isPending ? 'Creando...' : 'Crear Proyecto'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar proyecto */}
      <Dialog open={showEditProject} onOpenChange={setShowEditProject}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Proyecto de Investigación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_title">Título del Proyecto</Label>
              <Input
                id="edit_title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ingrese el título del proyecto"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_description">Descripción</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción detallada del proyecto"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit_objectives">Objetivos</Label>
              <Textarea
                id="edit_objectives"
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                placeholder="Objetivos del proyecto"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposal">Propuesta</SelectItem>
                    <SelectItem value="active">En Curso</SelectItem>
                    <SelectItem value="completed">Finalizado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit_lead_university">Universidad Líder</Label>
                <Select value={formData.lead_university_id} onValueChange={(value) => setFormData({ ...formData, lead_university_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar universidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((university) => (
                      <SelectItem key={university.id} value={university.id}>
                        {university.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_start_date">Fecha de Inicio</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_end_date">Fecha de Finalización</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              />
              <Label htmlFor="edit_is_public">Proyecto público (visible en búsquedas)</Label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditProject(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateProject} disabled={updateProjectMutation.isPending}>
                {updateProjectMutation.isPending ? 'Actualizando...' : 'Actualizar Proyecto'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjects;
