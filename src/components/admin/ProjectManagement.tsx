import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Eye, Edit, Archive, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProjectCreationDialog } from '@/components/coordinator/ProjectCreationDialog';
import { ProjectDetailDialog } from '@/components/coordinator/ProjectDetailDialog';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  created_at: string;
  lead_university: {
    name: string;
  };
  project_participants: Array<{
    professor: {
      full_name: string;
    };
  }>;
}

export const ProjectManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_projects')
        .select(`
          *,
          lead_university:universities!lead_university_id(name),
          project_participants(
            professor:profiles(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('research_projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto ha sido eliminado exitosamente.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el proyecto.",
        variant: "destructive",
      });
      console.error('Error deleting project:', error);
    },
  });

  const togglePublicMutation = useMutation({
    mutationFn: async ({ projectId, isPublic }: { projectId: string; isPublic: boolean }) => {
      const { error } = await supabase
        .from('research_projects')
        .update({ is_public: !isPublic })
        .eq('id', projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Proyecto actualizado",
        description: "La visibilidad del proyecto ha sido actualizada.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el proyecto.",
        variant: "destructive",
      });
      console.error('Error updating project:', error);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'proposal': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'completed': return 'Completado';
      case 'proposal': return 'Propuesta';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando proyectos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Proyectos (Administrador)</h2>
          <p className="text-muted-foreground">
            Control total sobre todos los proyectos de investigación
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear Proyecto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Proyectos de Investigación</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Universidad Líder</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>Visibilidad</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects?.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-semibold">{project.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{project.lead_university?.name || 'Sin asignar'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusText(project.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {project.project_participants?.length || 0} participantes
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.is_public ? "default" : "secondary"}>
                      {project.is_public ? 'Público' : 'Privado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(project.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedProject(project);
                            setShowDetailDialog(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedProject(project);
                            setShowCreateDialog(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => togglePublicMutation.mutate({
                            projectId: project.id,
                            isPublic: project.is_public
                          })}
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          {project.is_public ? 'Hacer Privado' : 'Hacer Público'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteMutation.mutate(project.id)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {projects?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No hay proyectos de investigación registrados
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primer proyecto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ProjectCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        project={selectedProject}
        onSuccess={() => {
          refetch();
          setShowCreateDialog(false);
          setSelectedProject(null);
        }}
      />

      <ProjectDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        project={selectedProject}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};
