
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, FileText, MessageSquare, Plus, Download } from "lucide-react";
import ProjectMilestones from "./ProjectMilestones";
import ProjectDocuments from "./ProjectDocuments";
import ProjectComments from "./ProjectComments";

interface ProjectDetailProps {
  projectId: string;
}

const ProjectDetail = ({ projectId }: ProjectDetailProps) => {
  // Obtener detalles completos del proyecto
  const { data: project, isLoading } = useQuery({
    queryKey: ['project-detail', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      return data;
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

  const getRoleBadge = (role: string) => {
    const roleMap = {
      'principal_investigator': 'Investigador Principal',
      'co_investigator': 'Co-investigador',
      'collaborator': 'Colaborador'
    };
    
    return roleMap[role as keyof typeof roleMap] || role;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando proyecto...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Proyecto no encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información General del Proyecto */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {project.title}
                {getStatusBadge(project.status)}
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                {project.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Objetivos</h4>
              <p className="text-muted-foreground">
                {project.objectives || "No se han definido objetivos específicos"}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Fecha de Inicio:</span>
                <span>
                  {project.start_date
                    ? new Date(project.start_date).toLocaleDateString()
                    : 'Por definir'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Fecha de Fin:</span>
                <span>
                  {project.end_date
                    ? new Date(project.end_date).toLocaleDateString()
                    : 'Por definir'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participantes del Proyecto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participantes del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.project_participants?.map((participant: any) => (
              <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{participant.profiles?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {participant.universities?.name}
                  </p>
                </div>
                <Badge variant="outline">
                  {getRoleBadge(participant.role)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Universidades Participantes */}
      <Card>
        <CardHeader>
          <CardTitle>Universidades Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {project.project_universities?.map((pu: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant={pu.role === 'lead' ? 'default' : 'secondary'}>
                  {pu.universities?.name}
                </Badge>
                {pu.role === 'lead' && (
                  <span className="text-xs text-muted-foreground">(Líder)</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pestañas para Gestión del Proyecto */}
      <Tabs defaultValue="milestones" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="milestones">Avances y Hitos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="comments">Comentarios</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones">
          <ProjectMilestones projectId={projectId} />
        </TabsContent>

        <TabsContent value="documents">
          <ProjectDocuments projectId={projectId} />
        </TabsContent>

        <TabsContent value="comments">
          <ProjectComments projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
