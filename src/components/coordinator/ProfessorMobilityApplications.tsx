import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Download, Calendar, User, Building, FileText, FolderOpen, MessageSquare, Mail, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useEmail } from '@/hooks/useEmail';

interface ProfessorMobilityApplication {
  id: string;
  application_number: string;
  professor_id: string;
  mobility_type: string;
  status: string;
  created_at: string;
  profiles?: {
    full_name: string;
    document_number: string;
  };
}

interface ApplicationDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
}

interface EducationLevel {
  id: string;
  education_level: string;
  institution: string;
  graduation_year: number;
  title: string;
}

export const ProfessorMobilityApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<ProfessorMobilityApplication | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusNote, setStatusNote] = useState('');
  const [willNotifyProfessor, setWillNotifyProfessor] = useState(false);
  const { sendApplicationStatusUpdate } = useEmail();

  // Fetch applications for coordinator's university
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['coordinator-professor-mobility-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_mobility_applications' as any)
        .select(`
          *,
          profiles!professor_id(full_name, document_number)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }
      
      return (data || []).map((app: any) => ({
        id: app.id,
        application_number: app.application_number,
        professor_id: app.professor_id,
        mobility_type: app.mobility_type || 'teaching',
        status: app.status || 'pending',
        created_at: app.created_at,
        profiles: app.profiles
      })) as ProfessorMobilityApplication[];
    }
  });

  // Fetch documents for selected application
  const { data: documents = [] } = useQuery({
    queryKey: ['professor-application-documents', selectedApplication?.id],
    queryFn: async () => {
      if (!selectedApplication?.id) return [];
      
      const { data, error } = await supabase
        .from('professor_mobility_documents')
        .select('*')
        .eq('application_id', selectedApplication.id)
        .order('uploaded_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching documents:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!selectedApplication?.id
  });

  // Fetch notes for selected application
  const { data: notes = [] } = useQuery({
    queryKey: ['professor-application-notes', selectedApplication?.id],
    queryFn: async () => {
      if (!selectedApplication?.id) return [];
      
      const { data, error } = await supabase
        .from('professor_mobility_notes')
        .select(`
          *,
          profiles!professor_mobility_notes_coordinator_id_fkey(full_name)
        `)
        .eq('application_id', selectedApplication.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notes:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!selectedApplication?.id
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      applicationId, 
      status, 
      note, 
      shouldNotify 
    }: { 
      applicationId: string; 
      status: string; 
      note?: string; 
      shouldNotify: boolean;
    }) => {
      const { error: updateError } = await supabase
        .from('professor_mobility_applications' as any)
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      
      if (updateError) throw updateError;

      // Add note if provided
      if (note && note.trim()) {
        const { error: noteError } = await supabase
          .from('professor_mobility_notes')
          .insert({
            application_id: applicationId,
            coordinator_id: user?.id,
            note: note.trim(),
            is_internal: false
          });
        
        if (noteError) {
          console.error('Error adding note:', noteError);
        }
      }

      // Send email notification if requested
      if (shouldNotify && selectedApplication?.profiles?.full_name) {
        try {
          const { data: professorData } = await supabase.functions.invoke('get-coordinator-email', {
            body: { userId: selectedApplication.professor_id, isStudent: false }
          });

          if (professorData?.email) {
            await sendApplicationStatusUpdate(
              professorData.email,
              selectedApplication.profiles.full_name,
              selectedApplication.application_number,
              getStatusLabel(status),
              note || 'Estado actualizado por el coordinador',
              `${window.location.origin}/professor-dashboard`,
              selectedApplication.professor_id
            );
          }
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator-professor-mobility-applications'] });
      queryClient.invalidateQueries({ queryKey: ['professor-application-notes', selectedApplication?.id] });
      setStatusNote('');
      setWillNotifyProfessor(false);
      toast({
        title: 'Estado actualizado',
        description: 'El estado de la postulación se ha actualizado exitosamente.'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de la postulación.',
        variant: 'destructive'
      });
    }
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async ({ note, isPublic }: { note: string; isPublic: boolean }) => {
      if (!selectedApplication?.id || !user?.id) throw new Error('Missing data');
      
      const { error } = await supabase
        .from('professor_mobility_notes')
        .insert({
          application_id: selectedApplication.id,
          coordinator_id: user.id,
          note,
          is_internal: !isPublic
        });
      
      if (error) throw error;

      // Send email if public note
      if (isPublic) {
        try {
          const { data: professorData } = await supabase.functions.invoke('get-coordinator-email', {
            body: { userId: selectedApplication.professor_id, isStudent: false }
          });

          if (professorData?.email && selectedApplication?.profiles?.full_name) {
            await sendApplicationStatusUpdate(
              professorData.email,
              selectedApplication.profiles.full_name,
              selectedApplication.application_number,
              getStatusLabel(selectedApplication.status),
              note,
              `${window.location.origin}/professor-dashboard`,
              selectedApplication.professor_id
            );
          }
        } catch (emailError) {
          console.error('Error sending comment email:', emailError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-application-notes', selectedApplication?.id] });
      toast({
        title: 'Comentario agregado',
        description: 'El comentario se ha agregado correctamente.'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo agregar el comentario.',
        variant: 'destructive'
      });
    }
  });

  const handleDownloadDocument = async (document: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('professor-documents')
        .download(document.file_url);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Descarga iniciada',
        description: `Descargando ${document.file_name}`,
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Error de descarga',
        description: 'No se pudo descargar el documento.',
        variant: 'destructive'
      });
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.application_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_review': 'bg-blue-100 text-blue-800',
      'approved_origin': 'bg-green-100 text-green-800',
      'approved_destination': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'completed': 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'pending': 'Pendiente',
      'in_review': 'En Revisión',
      'approved_origin': 'Aprobada (Origen)',
      'approved_destination': 'Aprobada (Destino)',
      'rejected': 'Rechazada',
      'completed': 'Completada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'teaching': 'Docencia',
      'research': 'Investigación',
      'training': 'Capacitación'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Postulaciones de Movilidad - Profesores
        </CardTitle>
        <CardDescription>
          Gestiona y revisa las postulaciones de movilidad de profesores
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar por número, profesor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_review">En Revisión</SelectItem>
              <SelectItem value="approved_origin">Aprobada (Origen)</SelectItem>
              <SelectItem value="approved_destination">Aprobada (Destino)</SelectItem>
              <SelectItem value="rejected">Rechazada</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredApplications.length} postulación(es) encontrada(s)
        </div>

        <div className="grid gap-4">
          {filteredApplications.map((application) => (
            <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{application.application_number}</h3>
                    <Badge className={getStatusColor(application.status)} variant="secondary">
                      {getStatusLabel(application.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{application.profiles?.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Creada: {new Date(application.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{getTypeLabel(application.mobility_type)}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedApplication(application);
                    setIsDetailDialogOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Button>
              </div>
            </div>
          ))}
          
          {filteredApplications.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron postulaciones</p>
            </div>
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Gestión de Postulación - {selectedApplication?.application_number}
              </DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Información General</TabsTrigger>
                  <TabsTrigger value="documents">Documentos</TabsTrigger>
                  <TabsTrigger value="status">Estado</TabsTrigger>
                  <TabsTrigger value="comments">Comentarios</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Profesor</Label>
                      <p className="font-semibold">{selectedApplication.profiles?.full_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Documento</Label>
                      <p>{selectedApplication.profiles?.document_number}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Estado Actual</Label>
                      <Badge className={getStatusColor(selectedApplication.status)} variant="secondary">
                        {getStatusLabel(selectedApplication.status)}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tipo de Movilidad</Label>
                      <p>{getTypeLabel(selectedApplication.mobility_type)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Fecha de Solicitud</Label>
                      <p>{new Date(selectedApplication.created_at).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Documentos Presentados</h4>
                    {documents.length > 0 ? (
                      <div className="space-y-3">
                        {documents.map((document) => (
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
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Descargar
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No hay documentos cargados</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="status" className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Actualizar Estado de la Postulación</h4>
                    
                    <div className="grid gap-4">
                      <div>
                        <Label>Nuevo Estado</Label>
                        <Select 
                          value={selectedApplication.status}
                          onValueChange={(newStatus) => {
                            updateStatusMutation.mutate({
                              applicationId: selectedApplication.id,
                              status: newStatus,
                              note: statusNote,
                              shouldNotify: willNotifyProfessor
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="in_review">En Revisión</SelectItem>
                            <SelectItem value="approved_origin">Aprobada (Origen)</SelectItem>
                            <SelectItem value="approved_destination">Aprobada (Destino)</SelectItem>
                            <SelectItem value="rejected">Rechazada</SelectItem>
                            <SelectItem value="completed">Completada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Nota para el profesor (opcional)</Label>
                        <Textarea
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          placeholder="Agrega una nota que será visible para el profesor..."
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="notify-professor"
                          checked={willNotifyProfessor}
                          onCheckedChange={(checked) => setWillNotifyProfessor(checked === true)}
                        />
                        <Label htmlFor="notify-professor" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Notificar al profesor por correo electrónico
                        </Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Agregar Comentario</h4>
                    
                    <div className="space-y-4">
                      <Textarea
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="Escribe un comentario..."
                        rows={3}
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="public-comment"
                            checked={willNotifyProfessor}
                            onCheckedChange={(checked) => setWillNotifyProfessor(checked === true)}
                          />
                          <Label htmlFor="public-comment">Visible para el profesor</Label>
                        </div>
                        
                        <Button
                          onClick={() => {
                            if (statusNote.trim()) {
                              addNoteMutation.mutate({
                                note: statusNote,
                                isPublic: willNotifyProfessor
                              });
                              setStatusNote('');
                              setWillNotifyProfessor(false);
                            }
                          }}
                          disabled={!statusNote.trim() || addNoteMutation.isPending}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h5 className="font-medium mb-4">Historial de Comentarios</h5>
                      <div className="space-y-3">
                        {notes.map((note) => (
                          <div key={note.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{note.profiles?.full_name}</span>
                                <Badge variant={note.is_internal ? "secondary" : "default"}>
                                  {note.is_internal ? "Interno" : "Público"}
                                </Badge>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(note.created_at).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                            <p className="text-gray-700">{note.note}</p>
                          </div>
                        ))}
                        
                        {notes.length === 0 && (
                          <div className="text-center py-8">
                            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No hay comentarios aún</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
