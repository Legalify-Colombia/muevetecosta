
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Building, Users, FileText, MessageSquare, Target } from 'lucide-react';

interface ProjectDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
  onSuccess: () => void;
}

export function ProjectDetailDialog({ 
  open, 
  onOpenChange, 
  project, 
  onSuccess 
}: ProjectDetailDialogProps) {
  if (!project) return null;

  const { data: projectDetails } = useQuery({
    queryKey: ['project-details', project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_projects')
        .select(`
          *,
          lead_university:universities!lead_university_id(name, city),
          project_universities(
            role,
            university:universities(name, city)
          ),
          project_participants(
            role,
            status,
            professor:profiles(full_name),
            university:universities(name)
          ),
          project_milestones(
            id,
            title,
            description,
            milestone_date,
            next_steps,
            professor:profiles(full_name)
          ),
          project_documents(
            id,
            file_name,
            document_type,
            description,
            uploaded_at,
            uploaded_by:profiles(full_name)
          ),
          project_comments(
            id,
            comment,
            created_at,
            professor:profiles(full_name)
          )
        `)
        .eq('id', project.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!project?.id && open,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl mb-2">{project.title}</DialogTitle>
              <Badge className={getStatusColor(project.status)}>
                {getStatusText(project.status)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="participants">Participantes</TabsTrigger>
            <TabsTrigger value="milestones">Hitos</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="comments">Comentarios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Descripción</h4>
                  <p className="text-muted-foreground">
                    {project.description || 'Sin descripción'}
                  </p>
                </div>

                {project.objectives && (
                  <div>
                    <h4 className="font-semibold mb-2">Objetivos</h4>
                    <p className="text-muted-foreground">{project.objectives}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Universidad Líder</p>
                      <p className="text-sm text-muted-foreground">
                        {project.lead_university?.name}
                      </p>
                    </div>
                  </div>

                  {project.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Duración</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(project.start_date).toLocaleDateString()} - {' '}
                          {project.end_date ? 
                            new Date(project.end_date).toLocaleDateString() : 
                            'En curso'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Universidades Participantes</h4>
                  <div className="space-y-2">
                    {project.project_universities?.map((pu: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>{pu.university?.name}</span>
                        <Badge variant="outline">
                          {pu.role === 'lead' ? 'Líder' : 'Participante'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participantes del Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectDetails?.project_participants?.map((participant: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{participant.professor?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {participant.university?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {participant.role === 'principal_investigator' ? 'Investigador Principal' :
                           participant.role === 'co_investigator' ? 'Co-investigador' : 'Colaborador'}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {participant.status === 'active' ? 'Activo' : participant.status}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!projectDetails?.project_participants || projectDetails.project_participants.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">
                      No hay participantes asignados aún
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones">
            <Card>
              <CardHeader>
                <CardTitle>Hitos del Proyecto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectDetails?.project_milestones?.map((milestone: any) => (
                    <div key={milestone.id} className="border-l-2 border-primary pl-4 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{milestone.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(milestone.milestone_date).toLocaleDateString()}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {milestone.description}
                        </p>
                      )}
                      {milestone.next_steps && (
                        <p className="text-sm">
                          <strong>Próximos pasos:</strong> {milestone.next_steps}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Por: {milestone.professor?.full_name}
                      </p>
                    </div>
                  ))}
                  
                  {(!projectDetails?.project_milestones || projectDetails.project_milestones.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">
                      No hay hitos registrados aún
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos del Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectDetails?.project_documents?.map((doc: any) => (
                    <div key={doc.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.document_type} • Subido por {doc.uploaded_by?.full_name}
                        </p>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {doc.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  
                  {(!projectDetails?.project_documents || projectDetails.project_documents.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">
                      No hay documentos subidos aún
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comentarios del Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectDetails?.project_comments?.map((comment: any) => (
                    <div key={comment.id} className="border-l-2 border-muted pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium">{comment.professor?.full_name}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.comment}</p>
                    </div>
                  ))}
                  
                  {(!projectDetails?.project_comments || projectDetails.project_comments.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">
                      No hay comentarios aún
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
