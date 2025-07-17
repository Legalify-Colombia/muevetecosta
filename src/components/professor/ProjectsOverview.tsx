import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Users, Calendar, Plus, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function ProjectsOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['professor-projects-overview', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('research_projects')
        .select(`
          *,
          project_participants!inner(*)
        `)
        .eq('project_participants.professor_id', user.id)
        .eq('project_participants.status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const handleCreateProject = () => {
    // Navigate to a project creation page instead of opening a dialog
    navigate('/project/create');
  };

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FlaskConical className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-gray-600 text-sm">Proyectos Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {projects.reduce((acc, project) => acc + (project.project_participants?.length || 0), 0)}
                </p>
                <p className="text-gray-600 text-sm">Colaboradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'active').length}
                </p>
                <p className="text-gray-600 text-sm">En Progreso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Proyectos Recientes</CardTitle>
              <CardDescription>Tus proyectos de investigación más recientes</CardDescription>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => navigate('/projects')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Todos
              </Button>
              <Button onClick={handleCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
                    <Badge 
                      variant={project.status === 'active' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {project.status}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {project.project_participants?.length || 0} colaborador(es)
                    </span>
                    <span>
                      {project.start_date ? new Date(project.start_date).toLocaleDateString('es-ES') : 'Sin fecha'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes proyectos aún</h3>
              <p className="text-gray-600 mb-4">Comienza creando tu primer proyecto de investigación</p>
              <Button onClick={handleCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Proyecto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
