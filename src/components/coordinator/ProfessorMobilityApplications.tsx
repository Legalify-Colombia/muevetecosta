
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FileText, Eye, Download, MessageSquare, Calendar, User, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const ProfessorMobilityApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: myUniversity } = useQuery({
    queryKey: ['coordinator-university', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('coordinator_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['professor-mobility-applications', myUniversity?.id, statusFilter],
    queryFn: async () => {
      if (!myUniversity?.id) return [];
      
      let query = supabase
        .from('professor_mobility_applications')
        .select(`
          *,
          profiles!professor_mobility_applications_professor_id_fkey(full_name, document_number, document_type),
          professor_mobility_calls!professor_mobility_applications_mobility_call_id_fkey(title, mobility_type, host_institution_id),
          universities!professor_mobility_calls_host_institution_id_fkey(name)
        `)
        .eq('professor_mobility_calls.host_institution_id', myUniversity.id)
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!myUniversity?.id
  });

  const { data: applicationDocuments = [], refetch: refetchDocuments } = useQuery({
    queryKey: ['professor-mobility-documents', selectedApplication?.id],
    queryFn: async () => {
      if (!selectedApplication?.id) return [];
      
      const { data, error } = await supabase
        .from('professor_mobility_documents')
        .select('*')
        .eq('application_id', selectedApplication.id)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedApplication?.id
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const { error } = await supabase
        .from('professor_mobility_applications')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-mobility-applications'] });
      toast({
        title: 'Estado actualizado',
        description: 'El estado de la postulación se ha actualizado exitosamente.'
      });
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ applicationId, note, isInternal }: { applicationId: string; note: string; isInternal: boolean }) => {
      const { error } = await supabase
        .from('professor_mobility_notes')
        .insert({
          application_id: applicationId,
          coordinator_id: user?.id,
          note,
          is_internal: isInternal
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-mobility-notes'] });
      toast({
        title: 'Nota agregada',
        description: 'La nota se ha guardado exitosamente.'
      });
    }
  });

  const downloadDocument = async (document: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('professor-mobility-docs')
        .download(document.file_path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo descargar el documento.',
        variant: 'destructive'
      });
    }
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    addNoteMutation.mutate({
      applicationId: selectedApplication.id,
      note: formData.get('note') as string,
      isInternal: formData.get('is_internal') === 'on'
    });
    
    (e.target as HTMLFormElement).reset();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-blue-100 text-blue-800',
      approved_origin: 'bg-green-100 text-green-800',
      approved_destination: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      pending: 'Pendiente',
      in_review: 'En Revisión',
      approved_origin: 'Aprobada por Origen',
      approved_destination: 'Aprobada por Destino',
      rejected: 'Rechazada',
      completed: 'Completada'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const filteredApplications = applications.filter(app =>
    app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.application_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.professor_mobility_calls?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Postulaciones de Movilidad - Profesores
          </CardTitle>
          <CardDescription>
            Gestiona las postulaciones de movilidad de profesores a tu universidad
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, número de radicación o convocatoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="in_review">En Revisión</SelectItem>
                <SelectItem value="approved_origin">Aprobadas por Origen</SelectItem>
                <SelectItem value="approved_destination">Aprobadas por Destino</SelectItem>
                <SelectItem value="rejected">Rechazadas</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-lg">{app.application_number}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(app.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(app.status)} variant="secondary">
                      {getStatusText(app.status)}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setSelectedApplication(app)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span><strong>Profesor:</strong> {app.profiles?.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span><strong>Convocatoria:</strong> {app.professor_mobility_calls?.title}</span>
                  </div>
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
        </CardContent>
      </Card>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Postulación - {selectedApplication?.application_number}</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Status Update */}
              <div className="flex items-center gap-4">
                <Label>Estado actual:</Label>
                <Badge className={getStatusColor(selectedApplication.status)} variant="secondary">
                  {getStatusText(selectedApplication.status)}
                </Badge>
                <Select 
                  value={selectedApplication.status} 
                  onValueChange={(status) => updateStatusMutation.mutate({ 
                    applicationId: selectedApplication.id, 
                    status 
                  })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_review">En Revisión</SelectItem>
                    <SelectItem value="approved_destination">Aprobar</SelectItem>
                    <SelectItem value="rejected">Rechazar</SelectItem>
                    <SelectItem value="completed">Completar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Información Personal</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Nombre:</strong> {selectedApplication.profiles?.full_name}</div>
                  <div><strong>Documento:</strong> {selectedApplication.profiles?.document_type?.toUpperCase()} {selectedApplication.profiles?.document_number}</div>
                  <div><strong>Email:</strong> {selectedApplication.contact_email}</div>
                  <div><strong>Teléfono:</strong> {selectedApplication.contact_phone}</div>
                  <div><strong>Fecha de Nacimiento:</strong> {selectedApplication.birth_date ? new Date(selectedApplication.birth_date).toLocaleDateString('es-ES') : 'No especificada'}</div>
                  <div><strong>Lugar de Nacimiento:</strong> {selectedApplication.birth_place || 'No especificado'}</div>
                </div>
              </div>

              <Separator />

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Información Académica/Laboral</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Institución de Origen:</strong> {selectedApplication.origin_institution}</div>
                  <div><strong>Facultad/Departamento:</strong> {selectedApplication.faculty_department}</div>
                  <div><strong>Rol Actual:</strong> {selectedApplication.current_role}</div>
                  <div><strong>Área de Experticia:</strong> {selectedApplication.expertise_area}</div>
                  <div><strong>Años de Experiencia:</strong> {selectedApplication.years_experience}</div>
                  <div><strong>Código de Empleado:</strong> {selectedApplication.employee_code || 'No especificado'}</div>
                </div>
              </div>

              <Separator />

              {/* Mobility Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Detalles de Movilidad</h3>
                <div className="space-y-3 text-sm">
                  <div><strong>Departamento de Colaboración:</strong> {selectedApplication.collaboration_department}</div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><strong>Fecha de Inicio:</strong> {selectedApplication.proposed_start_date ? new Date(selectedApplication.proposed_start_date).toLocaleDateString('es-ES') : 'No especificada'}</div>
                    <div><strong>Fecha de Finalización:</strong> {selectedApplication.proposed_end_date ? new Date(selectedApplication.proposed_end_date).toLocaleDateString('es-ES') : 'No especificada'}</div>
                  </div>
                  <div>
                    <strong>Justificación y Objetivos:</strong>
                    <p className="mt-1 p-3 bg-gray-50 rounded text-sm">{selectedApplication.mobility_justification}</p>
                  </div>
                  <div>
                    <strong>Plan de Trabajo:</strong>
                    <p className="mt-1 p-3 bg-gray-50 rounded text-sm">{selectedApplication.work_plan}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Documentos</h3>
                <div className="space-y-2">
                  {applicationDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{doc.document_type}</p>
                          <p className="text-sm text-gray-500">{doc.file_name}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadDocument(doc)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  ))}
                  {applicationDocuments.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No hay documentos adjuntos</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Add Note */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Agregar Nota</h3>
                <form onSubmit={handleSubmitNote} className="space-y-4">
                  <Textarea
                    name="note"
                    placeholder="Escriba su nota o comentario..."
                    required
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="is_internal" />
                      <span className="text-sm">Nota interna (no visible para el profesor)</span>
                    </label>
                    <Button type="submit" disabled={addNoteMutation.isPending}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {addNoteMutation.isPending ? 'Guardando...' : 'Agregar Nota'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
