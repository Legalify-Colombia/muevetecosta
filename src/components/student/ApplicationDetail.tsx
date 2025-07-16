
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, User, MessageSquare, ArrowLeft, BookOpen, GraduationCap, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ApplicationDetailProps {
  applicationId: string;
  onBack: () => void;
}

export const ApplicationDetail = ({ applicationId, onBack }: ApplicationDetailProps) => {
  const { user } = useAuth();

  const { data: application, isLoading } = useQuery({
    queryKey: ['student-application-detail', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobility_applications')
        .select(`
          *,
          profiles!mobility_applications_student_id_fkey(*),
          academic_programs(*),
          universities(*)
        `)
        .eq('id', applicationId)
        .eq('student_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: courseEquivalences = [] } = useQuery({
    queryKey: ['student-course-equivalences', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_equivalences')
        .select(`
          *,
          courses!course_equivalences_destination_course_id_fkey(name, code, credits)
        `)
        .eq('application_id', applicationId);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: publicNotes = [] } = useQuery({
    queryKey: ['student-application-notes', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('application_notes')
        .select(`
          *,
          profiles!application_notes_coordinator_id_fkey(full_name)
        `)
        .eq('application_id', applicationId)
        .eq('is_internal', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

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

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'in_review': 
        return "Tu postulación está siendo revisada por el coordinador de la universidad de destino.";
      case 'approved': 
        return "¡Felicitaciones! Tu postulación ha sido aprobada. Pronto recibirás más información sobre los siguientes pasos.";
      case 'pending': 
        return "Tu postulación ha sido recibida y está en cola para ser revisada.";
      case 'rejected': 
        return "Tu postulación no ha sido aprobada. Revisa los comentarios del coordinador para más detalles.";
      case 'completed': 
        return "El proceso de movilidad ha sido completado exitosamente.";
      default: 
        return "Estado desconocido.";
    }
  };

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
            <p className="text-gray-600">No se encontró la postulación.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a Mis Postulaciones
      </Button>

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
            Enviada el {new Date(application.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              <p className="font-medium text-blue-900">Estado Actual: {getStatusText(application.status)}</p>
            </div>
            <p className="text-sm text-blue-700">{getStatusDescription(application.status)}</p>
          </div>
        </CardContent>
      </Card>

      {/* University and Program Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Universidad y Programa de Destino
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Universidad de Destino</p>
              <p className="text-lg font-semibold">{application.universities?.name}</p>
              <p className="text-sm text-gray-600">{application.universities?.city}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Programa Académico</p>
              <p className="text-lg font-semibold">{application.academic_programs?.name}</p>
              <p className="text-sm text-gray-600">{application.academic_programs?.description}</p>
            </div>
          </div>
          
          {application.academic_programs?.duration_semesters && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <strong>Duración del programa:</strong> {application.academic_programs.duration_semesters} semestres
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Homologation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Cursos para Homologar
          </CardTitle>
          <CardDescription>
            Estos son los cursos que solicitas homologar en la universidad de destino
          </CardDescription>
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

      {/* Coordinator Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Comentarios del Coordinador
          </CardTitle>
          <CardDescription>
            Comunicaciones y observaciones del coordinador sobre tu postulación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {publicNotes.length > 0 ? (
            <div className="space-y-4">
              {publicNotes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-blue-900">{note.profiles?.full_name}</p>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Coordinador
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-600">
                      {new Date(note.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <p className="text-blue-800">{note.note}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No hay comentarios del coordinador aún
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Los comentarios aparecerán aquí cuando el coordinador revise tu postulación
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
