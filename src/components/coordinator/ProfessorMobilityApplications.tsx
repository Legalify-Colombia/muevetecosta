
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
import { Eye, Download, Calendar, User, Building, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
      
      // For now, return empty array since the table doesn't exist yet
      return [] as ApplicationDocument[];
    },
    enabled: !!selectedApplication?.id
  });

  // Fetch education levels for selected application
  const { data: educationLevels = [] } = useQuery({
    queryKey: ['professor-education-levels', selectedApplication?.id],
    queryFn: async () => {
      if (!selectedApplication?.id) return [];
      
      // For now, return empty array since the table doesn't exist yet
      return [] as EducationLevel[];
    },
    enabled: !!selectedApplication?.id
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status, note }: { applicationId: string; status: string; note?: string }) => {
      // Update application status
      const { error: updateError } = await supabase
        .from('professor_mobility_applications' as any)
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      
      if (updateError) throw updateError;

      // Add note if provided (skip for now since table doesn't exist)
      if (note) {
        console.log('Note would be added:', note);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator-professor-mobility-applications'] });
      setStatusNote('');
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

  const handleDownloadDocument = async (document: ApplicationDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('professor-mobility-docs')
        .download(document.file_path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      a.click();
      URL.revokeObjectURL(url);
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

  const getEducationLevelLabel = (level: string) => {
    const labels = {
      'professional': 'Profesional',
      'technologist': 'Tecnólogo',
      'specialist': 'Especialista',
      'master': 'Magíster',
      'doctorate': 'Doctorado'
    };
    return labels[level as keyof typeof labels] || level;
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Detalle de Postulación - {selectedApplication?.application_number}
              </DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Profesor</Label>
                    <p className="text-sm">{selectedApplication.profiles?.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <Badge className={getStatusColor(selectedApplication.status)} variant="secondary">
                      {getStatusLabel(selectedApplication.status)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tipo de Movilidad</Label>
                    <p className="text-sm">{getTypeLabel(selectedApplication.mobility_type)}</p>
                  </div>
                </div>

                {/* Status Update */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-2 block">Actualizar Estado</Label>
                  <div className="space-y-3">
                    <Select
                      defaultValue={selectedApplication.status}
                      onValueChange={(newStatus) => {
                        updateStatusMutation.mutate({
                          applicationId: selectedApplication.id,
                          status: newStatus,
                          note: statusNote
                        });
                      }}
                    >
                      <SelectTrigger className="w-48">
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
                    
                    <div>
                      <Label className="text-sm font-medium">Nota al profesor (opcional)</Label>
                      <Textarea
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="Escribe una nota que será visible para el profesor..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
