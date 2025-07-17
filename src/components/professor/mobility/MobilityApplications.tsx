
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Building, Clock, FileText, Eye, Download } from 'lucide-react';

interface MobilityApplication {
  id: string;
  applicationNumber: string;
  opportunityTitle: string;
  hostInstitution: string;
  mobilityType: string;
  applicationDate: string;
  startDate: string;
  endDate: string;
  status: 'Enviada' | 'En Revisión' | 'Aprobada (Origen)' | 'Aprobada (Destino)' | 'Rechazada' | 'Completada';
  coordinatorComments?: string;
}

const mockApplications: MobilityApplication[] = [
  {
    id: '1',
    applicationNumber: 'MOV-PROF-000001',
    opportunityTitle: 'Estancia de Investigación en Biotecnología Marina',
    hostInstitution: 'Universidad del Norte',
    mobilityType: 'Investigación',
    applicationDate: '2024-01-15',
    startDate: '2024-03-01',
    endDate: '2024-06-01',
    status: 'En Revisión',
    coordinatorComments: 'Su postulación está siendo evaluada por el comité académico.'
  },
  {
    id: '2',
    applicationNumber: 'MOV-PROF-000002',
    opportunityTitle: 'Intercambio Docente - Área de Ingeniería',
    hostInstitution: 'Universidad Tecnológica de Bolívar',
    mobilityType: 'Docencia',
    applicationDate: '2024-01-10',
    startDate: '2024-08-01',
    endDate: '2024-12-15',
    status: 'Aprobada (Origen)',
    coordinatorComments: 'Aprobada por la universidad de origen. Pendiente aprobación del destino.'
  }
];

export default function MobilityApplications() {
  const [applications] = useState<MobilityApplication[]>(mockApplications);
  const [selectedApplication, setSelectedApplication] = useState<MobilityApplication | null>(null);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'Enviada': { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      'En Revisión': { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      'Aprobada (Origen)': { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'Aprobada (Destino)': { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'Rechazada': { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      'Completada': { variant: 'default' as const, color: 'bg-purple-100 text-purple-800' }
    };
    
    return statusMap[status as keyof typeof statusMap] || { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' };
  };

  const handleViewDetails = (application: MobilityApplication) => {
    setSelectedApplication(application);
  };

  const handleBackToList = () => {
    setSelectedApplication(null);
  };

  if (selectedApplication) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBackToList} className="mr-4">
            <Eye className="h-4 w-4 mr-2" />
            Volver a Mis Postulaciones
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{selectedApplication.opportunityTitle}</CardTitle>
                <p className="text-muted-foreground">
                  Número de postulación: {selectedApplication.applicationNumber}
                </p>
              </div>
              <Badge className={getStatusBadge(selectedApplication.status).color}>
                {selectedApplication.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-3 text-blue-600" />
                  <div>
                    <p className="font-medium">Institución Anfitriona</p>
                    <p className="text-sm text-muted-foreground">{selectedApplication.hostInstitution}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium">Tipo de Movilidad</p>
                    <p className="text-sm text-muted-foreground">{selectedApplication.mobilityType}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-purple-600" />
                  <div>
                    <p className="font-medium">Fecha de Postulación</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedApplication.applicationDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-orange-600" />
                  <div>
                    <p className="font-medium">Período Propuesto</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedApplication.startDate).toLocaleDateString('es-ES')} - {' '}
                      {new Date(selectedApplication.endDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {selectedApplication.coordinatorComments && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Comentarios del Coordinador</h3>
                <p className="text-sm text-muted-foreground">{selectedApplication.coordinatorComments}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Descargar Postulación (PDF)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
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
            {applications.map((application) => (
              <Card key={application.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{application.opportunityTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        {application.applicationNumber}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Postulado el {new Date(application.applicationDate).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusBadge(application.status).color}>
                        {application.status}
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
                      <Building className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium">{application.hostInstitution}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-green-600" />
                      <span>{application.mobilityType}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-orange-600" />
                      <span>
                        {new Date(application.startDate).toLocaleDateString('es-ES')} - {' '}
                        {new Date(application.endDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
      </CardContent>
    </Card>
  );
}
