
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Archive, Users, Calendar, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ProjectCreationDialog } from './ProjectCreationDialog';
import { ProjectDetailDialog } from './ProjectDetailDialog';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  lead_university: {
    name: string;
  };
  project_universities: Array<{
    university: {
      name: string;
    };
    role: string;
  }>;
  project_participants: Array<{
    professor: {
      full_name: string;
    };
    role: string;
  }>;
}

export function ProjectManagement() {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ['coordinator-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_projects')
        .select(`
          *,
          lead_university:universities!lead_university_id(name),
          project_universities(
            role,
            university:universities(name)
          ),
          project_participants(
            role,
            professor:profiles(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
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
          <h2 className="text-2xl font-bold">Gestión de Proyectos de Investigación</h2>
          <p className="text-muted-foreground">
            Administra y supervisa proyectos de investigación colaborativa
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear Proyecto
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
                <Badge className={getStatusColor(project.status)}>
                  {getStatusText(project.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{project.lead_university?.name}</span>
              </div>

              {project.start_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(project.start_date).toLocaleDateString()} - {' '}
                    {project.end_date ? 
                      new Date(project.end_date).toLocaleDateString() : 
                      'En curso'
                    }
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {project.project_participants?.length || 0} participantes
                </span>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedProject(project);
                    setShowDetailDialog(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Detalles
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedProject(project);
                    setShowCreateDialog(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects?.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No hay proyectos de investigación disponibles
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear tu primer proyecto
            </Button>
          </CardContent>
        </Card>
      )}

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
}
