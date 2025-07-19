
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, User, MessageSquare, Send, ArrowLeft, BookOpen, Download, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ApplicationDetailProps {
  applicationId: string;
  onBack: () => void;
}

export const ApplicationDetail = ({ applicationId, onBack }: ApplicationDetailProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [isPublicNote, setIsPublicNote] = useState(false);
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

  const { data: courseEquivalences = [] } = useQuery({
    queryKey: ['course-equivalences', applicationId],
    queryFn: async () => {
      console.log('Fetching course equivalences for application ID:', applicationId);
      
      const { data, error } = await supabase
        .from('course_equivalences')
        .select(`
          *,
          courses!course_equivalences_destination_course_id_fkey(name, code, credits)
        `)
        .eq('application_id', applicationId);
      
      if (error) {
        console.error('Error fetching course equivalences:', error);
        return [];
      }
      
      console.log('Course equivalences fetched:', data);
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
    mutationFn: async (status: string) => {
      console.log('Updating status to:', status);
      
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
      
      console.log('Status updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-detail', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-applications'] });
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
        await supabase
          .from('notifications')
          .insert({
            user_id: application.student_id,
            title: 'Nuevo comentario en tu postulación',
            message: `El coordinador ha agregado un comentario a tu postulación ${application.application_number}: ${note}`,
            type: 'info',
            related_application_id: applicationId
          });
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
      updateStatusMutation.mutate(newStatus);
      setNewStatus("");
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

      {/* Course Homologation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Cursos a Homologar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courseEquivalences.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso de Origen</TableHead>
                  <TableHead>Código Origen</TableHead>
                  <TableHead>Curso de Destino</TableHead>
                  <TableHead>Código Destino</TableHead>
                  <TableHead>Créditos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseEquivalences.map((equivalence) => (
                  <TableRow key={equivalence.id}>
                    <TableCell className="font-medium">{equivalence.origin_course_name}</TableCell>
                    <TableCell>{equivalence.origin_course_code || 'N/A'}</TableCell>
                    <TableCell>{equivalence.courses?.name || 'No disponible'}</TableCell>
                    <TableCell>{equivalence.courses?.code || 'N/A'}</TableCell>
                    <TableCell>{equivalence.courses?.credits || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay cursos para homologar registrados</p>
          )}
        </CardContent>
      </Card>

      {/* Status Update */}
      <Card>
        <CardHeader>
          <CardTitle>Actualizar Estado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_review">En Revisión</SelectItem>
                <SelectItem value="approved">Aprobado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleStatusUpdate} 
              disabled={!newStatus || updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Actualizando..." : "Actualizar Estado"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes and Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Comentarios y Notas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="newNote">Agregar Comentario</Label>
              <Textarea
                id="newNote"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Escribe tu comentario..."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublicNote}
                  onChange={(e) => setIsPublicNote(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isPublic" className="text-sm">
                  Visible para el estudiante
                </Label>
              </div>
              <Button 
                onClick={handleAddNote} 
                disabled={!newNote.trim() || addNoteMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                {addNoteMutation.isPending ? "Enviando..." : "Agregar Comentario"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4">
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
              <p className="text-gray-500 text-center py-4">
                No hay comentarios aún
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
