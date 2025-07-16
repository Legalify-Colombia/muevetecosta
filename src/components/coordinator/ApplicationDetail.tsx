import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, User, MessageSquare, Send, ArrowLeft } from "lucide-react";
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

  const { data: application, isLoading } = useQuery({
    queryKey: ['application-detail', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobility_applications')
        .select(`
          *,
          profiles!mobility_applications_student_id_fkey(*),
          student_info!mobility_applications_student_id_fkey(*),
          academic_programs(*),
          universities(*)
        `)
        .eq('id', applicationId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['application-notes', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('application_notes')
        .select(`
          *,
          profiles!application_notes_coordinator_id_fkey(full_name)
        `)
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from('mobility_applications')
        .update({ status: status as any })
        .eq('id', applicationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-detail', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-applications'] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la postulación se ha actualizado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la postulación.",
        variant: "destructive",
      });
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ note, isPublic }: { note: string; isPublic: boolean }) => {
      const { error } = await supabase
        .from('application_notes')
        .insert({
          application_id: applicationId,
          coordinator_id: user?.id,
          note,
          is_internal: !isPublic
        });
      
      if (error) throw error;

      // If it's a public note, also create a notification for the student
      if (isPublic && application?.student_id) {
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
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el comentario.",
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_review':
        return "bg-yellow-100 text-yellow-800";
      case 'approved':
        return "bg-green-100 text-green-800";
      case 'pending':
        return "bg-blue-100 text-blue-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      case 'completed':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_review':
        return "En Revisión";
      case 'approved':
        return "Aprobado";
      case 'pending':
        return "Pendiente";
      case 'rejected':
        return "Rechazado";
      case 'completed':
        return "Completado";
      default:
        return status;
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
        Volver
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
            Recibida el {new Date(application.created_at).toLocaleDateString('es-ES')}
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
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
              <p className="text-lg">{application.profiles?.full_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Documento</p>
              <p>{application.profiles?.document_type.toUpperCase()} {application.profiles?.document_number}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Universidad de Origen</p>
              <p>{application.student_info?.origin_university}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Programa Actual</p>
              <p>{application.student_info?.academic_program}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Semestre Actual</p>
            <p>{application.student_info?.current_semester}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Programa de Destino</p>
            <p>{application.academic_programs?.name}</p>
          </div>
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
          {/* Add New Note */}
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

          {/* Existing Notes */}
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
                    {new Date(note.created_at).toLocaleDateString('es-ES')}
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
