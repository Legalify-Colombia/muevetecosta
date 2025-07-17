
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Building, Clock, FileText, Eye, Download, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Label } from '@/components/ui/label';

interface MobilityApplication {
  id: string;
  application_number: string;
  mobility_type: string;
  status: string;
  created_at: string;
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

export default function MobilityApplications() {
  const { user } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<MobilityApplication | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['professor-mobility-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_mobility_applications')
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
        mobility_type: app.mobility_type || 'teaching',
        status: app.status || 'pending',
        created_at: app.created_at
      })) as MobilityApplication[];
    }
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['application-documents', selectedApplication?.id],
    queryFn: async () => {
      if (!selectedApplication?.id) return [];
      
      // For now, return empty array since the table doesn't exist yet
      return [] as ApplicationDocument[];
    },
    enabled: !!selectedApplication?.id
  });

  const { data: educationLevels = [] } = useQuery({
    queryKey: ['education-levels', selectedApplication?.id],
    queryFn: async () => {
      if (!selectedApplication?.id) return [];
      
      // For now, return empty array since the table doesn't exist yet
      return [] as EducationLevel[];
    },
    enabled: !!selectedApplication?.id
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      'in_review': { variant: 'default' as const, color: 'bg-blue-100 text-blue-800', label: 'En Revisión' },
      'approved_origin': { variant: 'default' as const, color: 'bg-green-100 text-green-800', label: 'Aprobada (Origen)' },
      'approved_destination': { variant: 'default' as const, color: 'bg-green-100 text-green-800', label: 'Aprobada (Destino)' },
      'rejected': { variant: 'destructive' as const, color: 'bg-red-100 text-red-800', label: 'Rechazada' },
      'completed': { variant: 'default' as const, color: 'bg-purple-100 text-purple-800', label: 'Completada' }
    };
    
    return statusMap[status as keyof typeof statusMap] || { 
      variant: 'secondary' as const, 
      color: 'bg-gray-100 text-gray-800', 
      label: status 
    };
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

  const handleViewDetails = (application: MobilityApplication) => {
    setSelectedApplication(application);
    setIsDetailDialogOpen(true);
  };

  const downloadDocument = async (document: ApplicationDocument) => {
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
    }
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
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => {
              const statusInfo = getStatusBadge(application.status);
              return (
                <Card key={application.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">
                          Movilidad {getTypeLabel(application.mobility_type)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {application.application_number}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Postulado el {new Date(application.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(application)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <FileText className="h-4 w-4 mr-2 text-green-600" />
                        <span>{getTypeLabel(application.mobility_type)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No tienes postulaciones de movilidad aún</p>
            <p className="text-sm">
              Explora las oportunidades disponibles y postúlate para iniciar tu proceso de movilidad académica.
            </p>
          </div>
        )}

        {/* Dialog de detalles */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Detalle de Postulación - {selectedApplication?.application_number}
              </DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <Badge className={getStatusBadge(selectedApplication.status).color}>
                      {getStatusBadge(selectedApplication.status).label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tipo de Movilidad</Label>
                    <p className="text-sm">
                      {getTypeLabel(selectedApplication.mobility_type)}
                    </p>
                  </div>
                </div>

                {/* Niveles de educación */}
                {educationLevels.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Niveles de Educación</Label>
                    <div className="space-y-2">
                      {educationLevels.map((level) => (
                        <div key={level.id} className="p-3 border rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Nivel:</span> {getEducationLevelLabel(level.education_level)}
                            </div>
                            <div>
                              <span className="font-medium">Institución:</span> {level.institution}
                            </div>
                            <div>
                              <span className="font-medium">Título:</span> {level.title}
                            </div>
                            <div>
                              <span className="font-medium">Año:</span> {level.graduation_year}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documentos */}
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
                          onClick={() => downloadDocument(doc)}
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
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
