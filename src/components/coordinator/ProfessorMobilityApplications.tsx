
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Eye, Download, Calendar, User, Building, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Temporary interfaces until database tables are created
interface ProfessorMobilityApplication {
  id: string;
  application_number: string;
  professor_id: string;
  mobility_call_id: string;
  gender?: string;
  birth_date?: string;
  birth_place?: string;
  birth_country?: string;
  blood_type?: string;
  health_insurance?: string;
  contact_phone?: string;
  contact_email?: string;
  origin_institution?: string;
  faculty_department?: string;
  current_role?: string;
  expertise_area?: string;
  years_experience?: number;
  employee_code?: string;
  collaboration_department?: string;
  proposed_start_date?: string;
  proposed_end_date?: string;
  mobility_justification?: string;
  work_plan?: string;
  status: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    document_number: string;
    phone?: string;
  };
  professor_mobility_calls?: {
    title: string;
    mobility_type: string;
    universities?: {
      name: string;
      city: string;
    };
  };
}

interface MobilityDocument {
  id: string;
  application_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  uploaded_at: string;
}

// Mock data for demonstration
const mockApplications: ProfessorMobilityApplication[] = [
  {
    id: '1',
    application_number: 'MOV-000001',
    professor_id: '1',
    mobility_call_id: '1',
    contact_phone: '+57 300 123 4567',
    contact_email: 'profesor@university.edu',
    origin_institution: 'Universidad Nacional',
    current_role: 'Profesor Asociado',
    expertise_area: 'Biotecnología Marina',
    years_experience: 10,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      full_name: 'Dr. Carlos Rodríguez',
      document_number: '12345678',
      phone: '+57 300 123 4567'
    },
    professor_mobility_calls: {
      title: 'Estancia de Investigación en Biotecnología Marina',
      mobility_type: 'Investigación',
      universities: {
        name: 'Universidad del Norte',
        city: 'Barranquilla'
      }
    }
  }
];

export const ProfessorMobilityApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<ProfessorMobilityApplication | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch mobility applications - using mock data for now
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['professor-mobility-applications'],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query once tables are created
      return mockApplications;
    }
  });

  // Fetch documents for selected application - using mock data for now
  const { data: documents = [] } = useQuery({
    queryKey: ['professor-mobility-documents', selectedApplication?.id],
    queryFn: async () => {
      if (!selectedApplication?.id) return [];
      
      // TODO: Replace with actual Supabase query once tables are created
      return [] as MobilityDocument[];
    },
    enabled: !!selectedApplication?.id
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status, note }: { applicationId: string; status: string; note?: string }) => {
      // TODO: Implement actual database operations once tables are created
      console.log('Would update status:', { applicationId, status, note });
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-mobility-applications'] });
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

  const handleDownloadDocument = async (document: MobilityDocument) => {
    try {
      // TODO: Implement actual document download once storage is set up
      toast({
        title: 'Función en desarrollo',
        description: 'La descarga de documentos estará disponible próximamente.'
      });
    } catch (error) {
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
      app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.professor_mobility_calls?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
            placeholder="Buscar por número, profesor o convocatoria..."
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
                      <Building className="h-4 w-4" />
                      <span>{application.professor_mobility_calls?.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Creada: {new Date(application.created_at).toLocaleDateString('es-ES')}</span>
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
                    <Label className="text-sm font-medium">Convocatoria</Label>
                    <p className="text-sm">{selectedApplication.professor_mobility_calls?.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Teléfono</Label>
                    <p className="text-sm">{selectedApplication.contact_phone || 'No especificado'}</p>
                  </div>
                </div>

                {/* Academic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Institución de Origen</Label>
                    <p className="text-sm">{selectedApplication.origin_institution}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Rol Actual</Label>
                    <p className="text-sm">{selectedApplication.current_role}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Área de Experticia</Label>
                    <p className="text-sm">{selectedApplication.expertise_area}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Años de Experiencia</Label>
                    <p className="text-sm">{selectedApplication.years_experience}</p>
                  </div>
                </div>

                {/* Mobility Details */}
                {selectedApplication.mobility_justification && (
                  <div>
                    <Label className="text-sm font-medium">Justificación de la Movilidad</Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{selectedApplication.mobility_justification}</p>
                  </div>
                )}

                {selectedApplication.work_plan && (
                  <div>
                    <Label className="text-sm font-medium">Plan de Trabajo</Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{selectedApplication.work_plan}</p>
                  </div>
                )}

                {/* Documents */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Documentos Adjuntos</Label>
                  <div className="grid gap-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{doc.file_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {doc.document_type}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadDocument(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {documents.length === 0 && (
                      <p className="text-sm text-gray-500">No hay documentos adjuntos</p>
                    )}
                  </div>
                </div>

                {/* Status Update */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-2 block">Actualizar Estado</Label>
                  <div className="flex gap-2">
                    <Select
                      defaultValue={selectedApplication.status}
                      onValueChange={(newStatus) => {
                        updateStatusMutation.mutate({
                          applicationId: selectedApplication.id,
                          status: newStatus
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
