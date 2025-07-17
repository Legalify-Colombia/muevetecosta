
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Eye, Download, Calendar, FileText, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MobilityApplication {
  id: string;
  application_number: string;
  mobility_call_id: string;
  status: string;
  created_at: string;
  mobility_type: string;
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

export const MobilityApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedApplication, setSelectedApplication] = useState<MobilityApplication | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Fetch professor's applications
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['professor-mobility-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_mobility_applications' as any)
        .select('*')
        .eq('professor_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }
      
      return (data || []).map((app: any) => ({
        id: app.id,
        application_number: app.application_number,
        mobility_call_id: app.mobility_call_id || '',
        status: app.status || 'pending',
        created_at: app.created_at,
        mobility_type: app.mobility_type || 'teaching'
      })) as MobilityApplication[];
    }
  });

  // Fetch documents for selected application (simplified)
  const { data: documents = [] } = useQuery({
    queryKey: ['professor-application-documents', selectedApplication?.id], 
    queryFn: async () => {
      if (!selectedApplication?.id) return [];
      return [] as ApplicationDocument[];
    },
    enabled: !!selectedApplication?.id
  });

  // Fetch education levels for selected application (simplified)
  const { data: educationLevels = [] } = useQuery({
    queryKey: ['professor-education-levels', selectedApplication?.id],
    queryFn: async () => {
      if (!selectedApplication?.id) return [];
      return [] as EducationLevel[];
    },
    enabled: !!selectedApplication?.id
  });

  const handleDownloadDocument = async (document: ApplicationDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('professor-mobility-docs')
        .download(document.file_path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      link.click();
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
          <FileText className="h-5 w-5 mr-2" />
          Mis Postulaciones de Movilidad
        </CardTitle>
        <CardDescription>
          Revisa el estado de tus postulaciones de movilidad académica
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          {applications.length} postulación(es) encontrada(s)
        </div>

        <div className="grid gap-4">
          {applications.map((application) => (
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
          
          {applications.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tienes postulaciones aún</p>
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
                <div className="grid md:grid-cols-2 gap-4">
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
                  <div>
                    <Label className="text-sm font-medium">Fecha de Creación</Label>
                    <p className="text-sm">{new Date(selectedApplication.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>

                {documents.length > 0 && (
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium mb-2 block">Documentos</Label>
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{doc.file_name}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
