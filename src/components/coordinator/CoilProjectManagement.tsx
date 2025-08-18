import { useState } from "react";
import { useMyCoilProjects, useCoilProjectApplications, useReviewCoilApplication } from "@/hooks/useCoilProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Users, Calendar, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import CoilProjectForm from "@/components/coil/CoilProjectForm";

export function CoilProjectManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  
  const { data: myProjects = [], isLoading: projectsLoading, refetch: refetchProjects } = useMyCoilProjects();
  const { data: applications = [], isLoading: applicationsLoading, refetch: refetchApplications } = useCoilProjectApplications();
  const reviewApplication = useReviewCoilApplication();

  const handleReviewApplication = async (status: 'approved' | 'rejected') => {
    if (!selectedApplication) return;
    
    await reviewApplication.mutateAsync({
      applicationId: selectedApplication.id,
      status,
      reviewNotes
    });
    
    setSelectedApplication(null);
    setReviewNotes("");
    refetchApplications();
    refetchProjects();
  };

  if (projectsLoading || applicationsLoading) {
    return <div className="flex justify-center p-8">Cargando proyectos COIL...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Proyectos COIL</h2>
          <p className="text-muted-foreground">
            Administra tus proyectos de Collaborative Online International Learning
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear Proyecto COIL
        </Button>
      </div>

      {/* Mis Proyectos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Mis Proyectos COIL</h3>
        {myProjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No tienes proyectos COIL creados
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear tu primer proyecto COIL
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myProjects.map(project => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {project.host_university_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{project.host_university_name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Máximo {project.max_participants} participantes</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Creado: {format(new Date(project.created_at), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    asChild
                  >
                    <a href={`/coil?project=${project.id}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver en Portal COIL
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Solicitudes de Participación */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Solicitudes de Participación</h3>
        {applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No hay solicitudes de participación pendientes
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map(application => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{application.project?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Solicitante: {application.professor?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Solicitud del {format(new Date(application.created_at), 'dd MMM yyyy', { locale: es })}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        application.status === 'approved' ? 'default' :
                        application.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {application.status === 'approved' ? 'Aprobado' :
                       application.status === 'rejected' ? 'Rechazado' :
                       'Pendiente'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div>
                      <h5 className="font-medium text-sm">Motivación:</h5>
                      <p className="text-sm text-muted-foreground">{application.motivation}</p>
                    </div>
                    
                    {application.experience && (
                      <div>
                        <h5 className="font-medium text-sm">Experiencia:</h5>
                        <p className="text-sm text-muted-foreground">{application.experience}</p>
                      </div>
                    )}
                  </div>

                  {application.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedApplication(application)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Revisar Solicitud
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo de Creación de Proyecto */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proyecto COIL</DialogTitle>
          </DialogHeader>
          <CoilProjectForm 
            open={showCreateDialog} 
            onOpenChange={setShowCreateDialog}
            onSuccess={() => {
              setShowCreateDialog(false);
              refetchProjects();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de Revisión de Solicitud */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Revisar Solicitud de Participación</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{selectedApplication.project?.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Solicitante: {selectedApplication.professor?.full_name}
                </p>
              </div>

              <div>
                <Label>Motivación del profesor</Label>
                <p className="text-sm bg-muted p-3 rounded mt-1">{selectedApplication.motivation}</p>
              </div>

              {selectedApplication.experience && (
                <div>
                  <Label>Experiencia relevante</Label>
                  <p className="text-sm bg-muted p-3 rounded mt-1">{selectedApplication.experience}</p>
                </div>
              )}

              <div>
                <Label htmlFor="review-notes">Comentarios de revisión (opcional)</Label>
                <Textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Agrega comentarios sobre la decisión..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleReviewApplication('rejected')}
                  disabled={reviewApplication.isPending}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
                <Button 
                  onClick={() => handleReviewApplication('approved')}
                  disabled={reviewApplication.isPending}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}