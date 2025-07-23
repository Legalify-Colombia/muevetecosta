
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, User, MessageSquare, Send, ArrowLeft, Download, GraduationCap, FolderOpen, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEmail } from "@/hooks/useEmail";

interface ApplicationDetailProps {
  applicationId: string;
  onBack: () => void;
}

export const ApplicationDetail = ({ applicationId, onBack }: ApplicationDetailProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendApplicationStatusUpdate } = useEmail();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [isPublicNote, setIsPublicNote] = useState(false);
  const [willNotifyStudent, setWillNotifyStudent] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  console.log('ApplicationDetail - Loading application ID:', applicationId);

  const { data: application, isLoading, error } = useQuery({
    queryKey: ['application-detail', applicationId],
    queryFn: async () => {
      console.log('Fetching application details for ID:', applicationId);
      
      const { data, error } = await supabase
        .from('mobility_applications')
        .select(`
          *,
          profiles!mobility_applications_student_id_fkey(*),
          academic_programs(*),
          universities(*)
        `)
        .eq('id', applicationId)
        .single();
      
      if (error) {
        console.error('Error fetching application:', error);
        throw error;
      }
      
      console.log('Application data fetched:', data);
      return data;
    },
    retry: 1,
    enabled: !!applicationId
  });

  const { data: studentInfo, isLoading: isLoadingStudentInfo } = useQuery({
    queryKey: ['student-info', application?.student_id],
    queryFn: async () => {
      if (!application?.student_id) {
        console.log('No student ID available');
        return null;
      }
      
      console.log('Fetching student info for ID:', application.student_id);
      
      const { data, error } = await supabase
        .from('student_info')
        .select('*')
        .eq('id', application.student_id)
        .single();
      
      if (error) {
        console.error('Error fetching student info:', error);
        // Don't throw error, just return null to handle gracefully
        return null;
      }
      
      console.log('Student info fetched:', data);
      return data;
    },
    enabled: !!application?.student_id,
    retry: 1
  });

  const { data: applicationDocuments = [] } = useQuery({
    queryKey: ['application-documents', applicationId],
    queryFn: async () => {
      console.log('Fetching documents for application ID:', applicationId);
      
      const { data, error } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('uploaded_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching documents:', error);
        return [];
      }
      
      console.log('Documents fetched:', data);
      return data || [];
    },
    enabled: !!applicationId
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['application-notes', applicationId],
    queryFn: async () => {
      console.log('Fetching notes for application ID:', applicationId);
      
      const { data, error } = await supabase
        .from('application_notes')
        .select(`
          *,
          profiles!application_notes_coordinator_id_fkey(full_name)
        `)
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notes:', error);
        return [];
      }
      
      console.log('Notes fetched:', data);
      return data || [];
    },
    enabled: !!applicationId
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, shouldNotify }: { status: string; shouldNotify: boolean }) => {
      console.log('Updating status to:', status, 'with notification:', shouldNotify);
      
      const { error } = await supabase
        .from('mobility_applications')
        .update({ 
          status: status as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      
      if (error) {
        console.error('Error updating status:', error);
        throw error;
      }

      // Send email notification if requested and application data is available
      if (shouldNotify && application?.profiles?.full_name && application?.application_number) {
        try {
          // Get student email from auth.users via edge function
          const { data: coordinatorData } = await supabase.functions.invoke('get-coordinator-email', {
            body: { userId: application.student_id, isStudent: true }
          });

          if (coordinatorData?.email) {
            await sendApplicationStatusUpdate(
              coordinatorData.email,
              application.profiles.full_name,
              application.application_number,
              getStatusText(status),
              newNote || 'Estado actualizado por el coordinador',
              `${window.location.origin}/student-dashboard`,
              application.student_id
            );
            console.log('Email notification sent successfully');
          }
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // Don't fail the entire operation if email fails
        }
      }
      
      console.log('Status updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-detail', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-applications'] });
      setWillNotifyStudent(false);
      toast({
        title: "Estado actualizado",
        description: "El estado de la postulación se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      console.error('Error in status update mutation:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la postulación.",
        variant: "destructive",
      });
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ note, isPublic }: { note: string; isPublic: boolean }) => {
      console.log('Adding note:', { note, isPublic });
      
      const { error } = await supabase
        .from('application_notes')
        .insert({
          application_id: applicationId,
          coordinator_id: user?.id,
          note,
          is_internal: !isPublic
        });
      
      if (error) {
        console.error('Error adding note:', error);
        throw error;
      }

      if (isPublic && application?.student_id) {
        console.log('Creating notification for student');
        
        // Create in-app notification
        await supabase
          .from('notifications')
          .insert({
            user_id: application.student_id,
            title: 'Nuevo comentario en tu postulación',
            message: `El coordinador ha agregado un comentario a tu postulación ${application.application_number}: ${note}`,
            type: 'info',
            related_application_id: applicationId
          });

        // Send email notification
        try {
          const { data: studentData } = await supabase.functions.invoke('get-coordinator-email', {
            body: { userId: application.student_id, isStudent: true }
          });

          if (studentData?.email && application?.profiles?.full_name && application?.application_number) {
            await sendApplicationStatusUpdate(
              studentData.email,
              application.profiles.full_name,
              application.application_number,
              getStatusText(application.status),
              note,
              `${window.location.origin}/student-dashboard`,
              application.student_id
            );
          }
        } catch (emailError) {
          console.error('Error sending comment email:', emailError);
          // Don't fail if email fails
        }
      }
      
      console.log('Note added successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-notes', applicationId] });
      setNewNote("");
      setIsPublicNote(false);
      toast({
        title: "Comentario agregado",
        description: "El comentario se ha agregado correctamente.",
      });
    },
    onError: (error) => {
      console.error('Error in add note mutation:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el comentario.",
        variant: "destructive",
      });
    }
  });

  const exportToCsv = () => {
    if (!application) {
      console.log('No application data to export');
      return;
    }

    console.log('Exporting application to CSV');

    const csvData = [
      ['Campo', 'Valor'],
      ['Número de Postulación', application.application_number || ''],
      ['Estado', getStatusText(application.status)],
      ['Fecha de Postulación', new Date(application.created_at).toLocaleDateString('es-ES')],
      ['Nombre del Estudiante', application.profiles?.full_name || ''],
      ['Documento', `${application.profiles?.document_type?.toUpperCase()} ${application.profiles?.document_number}`],
      ['Universidad de Origen', studentInfo?.origin_university || ''],
      ['Programa Actual', studentInfo?.academic_program || ''],
      ['Semestre Actual', studentInfo?.current_semester?.toString() || ''],
      ['GPA Acumulado', studentInfo?.cumulative_gpa?.toString() || ''],
      ['Programa de Destino', application.academic_programs?.name || ''],
      ['Universidad de Destino', application.universities?.name || ''],
      ['Director Académico', studentInfo?.academic_director_name || ''],
      ['Email Director', studentInfo?.academic_director_email || ''],
      ['Teléfono Director', studentInfo?.academic_director_phone || '']
    ];

    const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `postulacion_${application.application_number}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_review': return "bg-yellow-100 text-yellow-800";
      case 'approved': return "bg-green-100 text-green-800";
      case 'pending': return "bg-blue-100 text-blue-800";
      case 'rejected': return "bg-red-100 text-red-800";
      case 'completed': return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_review': return "En Revisión";
      case 'approved': return "Aprobado";
      case 'pending': return "Pendiente";
      case 'rejected': return "Rechazado";
      case 'completed': return "Completado";
      default: return status;
    }
  };

  const handleStatusUpdate = () => {
    if (newStatus) {
      updateStatusMutation.mutate({ 
        status: newStatus, 
        shouldNotify: willNotifyStudent 
      });
      setNewStatus("");
      setWillNotifyStudent(false);
    }
  };

  const handleDownloadDocument = async (document: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('student-documents')
        .download(document.file_url);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Descarga iniciada",
        description: `Descargando ${document.file_name}`,
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error de descarga",
        description: "No se pudo descargar el documento.",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate({ note: newNote.trim(), isPublic: isPublicNote });
    }
  };

  if (error) {
    console.error('ApplicationDetail error:', error);
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error al cargar la postulación</p>
              <p className="text-sm text-gray-500">{error.message}</p>
              <Button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['application-detail', applicationId] })}
                className="mt-4"
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">No se encontró la postulación.</p>
              <Button onClick={onBack}>Volver al listado</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Button onClick={exportToCsv} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Application Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Postulación {application.application_number}
            </CardTitle>
            <Badge className={getStatusColor(application.status)} variant="secondary">
              {getStatusText(application.status)}
            </Badge>
          </div>
          <CardDescription>
            Recibida el {new Date(application.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Información del Estudiante
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                <p className="text-lg font-semibold">{application.profiles?.full_name || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Documento</p>
                <p>{application.profiles?.document_type?.toUpperCase()} {application.profiles?.document_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                <p>{application.profiles?.phone || 'No disponible'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {isLoadingStudentInfo ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : studentInfo ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Género</p>
                    <p>{studentInfo.gender || 'No disponible'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de Nacimiento</p>
                    <p>{studentInfo.birth_date ? new Date(studentInfo.birth_date).toLocaleDateString('es-ES') : 'No disponible'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Lugar de Nacimiento</p>
                    <p>{studentInfo.birth_place || 'No disponible'}{studentInfo.birth_country ? `, ${studentInfo.birth_country}` : ''}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Información adicional no disponible</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold mb-4">Información Académica</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {isLoadingStudentInfo ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ) : studentInfo ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Universidad de Origen</p>
                      <p className="font-semibold">{studentInfo.origin_university || 'No disponible'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Programa Actual</p>
                      <p>{studentInfo.academic_program || 'No disponible'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Código Estudiantil</p>
                      <p>{studentInfo.student_code || 'No disponible'}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-gray-500">Información académica no disponible</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {isLoadingStudentInfo ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ) : studentInfo ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Semestre Actual</p>
                      <p>{studentInfo.current_semester || 'No disponible'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">GPA Acumulado</p>
                      <p>{studentInfo.cumulative_gpa || 'No disponible'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Director Académico</p>
                      <p>{studentInfo.academic_director_name || 'No disponible'}</p>
                      {studentInfo.academic_director_email && (
                        <p className="text-sm text-gray-600">{studentInfo.academic_director_email}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-gray-500">Información académica adicional no disponible</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold mb-4">Programa de Destino</h4>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
                <p className="font-semibold text-blue-900">{application.academic_programs?.name || 'No disponible'}</p>
              </div>
              <p className="text-sm text-blue-700">{application.universities?.name}</p>
              {application.academic_programs?.description && (
                <p className="text-sm text-blue-600">{application.academic_programs.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents and Management Tabs */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Documentos del Estudiante
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Actualizar Estado
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comentarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderOpen className="h-5 w-5 mr-2" />
                Documentos Presentados por el Estudiante
              </CardTitle>
              <CardDescription>
                Documentos cargados por el estudiante para esta postulación
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applicationDocuments.length > 0 ? (
                <div className="space-y-3">
                  {applicationDocuments.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">{document.file_name}</p>
                          <p className="text-sm text-gray-500">
                            Tipo: {document.document_type} • 
                            Subido: {new Date(document.uploaded_at).toLocaleDateString('es-ES')}
                          </p>
                          {document.file_size && (
                            <p className="text-xs text-gray-400">
                              Tamaño: {(document.file_size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(document)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay documentos cargados</p>
                  <p className="text-sm text-gray-400">El estudiante aún no ha subido documentos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Gestión de Estado de la Postulación
              </CardTitle>
              <CardDescription>
                Actualiza el estado de la postulación y notifica al estudiante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="status-select" className="text-base font-medium">Nuevo Estado</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar nuevo estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_review">En Revisión</SelectItem>
                      <SelectItem value="approved">Aprobado</SelectItem>
                      <SelectItem value="rejected">Rechazado</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify-student"
                    checked={willNotifyStudent}
                    onCheckedChange={(checked) => setWillNotifyStudent(checked === true)}
                  />
                  <Label htmlFor="notify-student" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Notificar al estudiante por correo electrónico
                  </Label>
                </div>

                {willNotifyStudent && (
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800">
                      <strong>Notificación automática:</strong> Se enviará un correo electrónico al estudiante 
                      informando sobre el cambio de estado de su postulación.
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleStatusUpdate} 
                  disabled={!newStatus || updateStatusMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {updateStatusMutation.isPending ? (
                    "Actualizando..."
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Actualizar Estado
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Comentarios y Notas
              </CardTitle>
              <CardDescription>
                Agrega comentarios internos o públicos para el seguimiento de la postulación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newNote" className="text-base font-medium">Agregar Comentario</Label>
                  <Textarea
                    id="newNote"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Escribe tu comentario aquí..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={isPublicNote}
                    onCheckedChange={(checked) => setIsPublicNote(checked === true)}
                  />
                  <Label htmlFor="isPublic" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Visible para el estudiante (enviará notificación por email)
                  </Label>
                </div>

                {isPublicNote && (
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <p className="text-sm text-green-800">
                      <strong>Comentario público:</strong> Este comentario será visible para el estudiante 
                      y se enviará una notificación por correo electrónico.
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={handleAddNote} 
                  disabled={!newNote.trim() || addNoteMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {addNoteMutation.isPending ? "Enviando..." : "Agregar Comentario"}
                </Button>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Historial de Comentarios</h4>
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{note.profiles?.full_name}</p>
                          <Badge variant={note.is_internal ? "secondary" : "default"}>
                            {note.is_internal ? "Interno" : "Público"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(note.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <p className="text-gray-700">{note.note}</p>
                    </div>
                  ))}
                  
                  {notes.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay comentarios aún</p>
                      <p className="text-sm text-gray-400">Los comentarios aparecerán aquí una vez agregados</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
