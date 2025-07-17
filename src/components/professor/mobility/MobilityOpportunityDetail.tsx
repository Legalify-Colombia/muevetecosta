
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  FileText, 
  Building,
  User
} from 'lucide-react';

interface MobilityOpportunityDetailProps {
  opportunity: any;
  onBack: () => void;
  onApply: (opportunity: any) => void;
}

export const MobilityOpportunityDetail = ({ 
  opportunity, 
  onBack, 
  onApply 
}: MobilityOpportunityDetailProps) => {
  const getTypeColor = (type: string) => {
    const colors = {
      'Docencia': 'bg-blue-100 text-blue-800',
      'Investigación': 'bg-purple-100 text-purple-800',
      'Capacitación': 'bg-orange-100 text-orange-800',
      'Observación': 'bg-teal-100 text-teal-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{opportunity.title}</h1>
          <p className="text-muted-foreground">Convocatoria de Movilidad</p>
        </div>
        <Button onClick={() => onApply(opportunity)} size="lg">
          Postularme a esta Convocatoria
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={getTypeColor(opportunity.mobility_type)} variant="secondary">
                  {opportunity.mobility_type}
                </Badge>
                {opportunity.funding_available && (
                  <Badge className="bg-green-100 text-green-800" variant="secondary">
                    Con Financiamiento
                  </Badge>
                )}
                <Badge className="bg-blue-100 text-blue-800" variant="secondary">
                  Activa
                </Badge>
              </div>

              {opportunity.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Descripción</h3>
                    <p className="text-gray-700 leading-relaxed">{opportunity.description}</p>
                  </div>
                </>
              )}

              {opportunity.collaboration_area && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Área de Colaboración</h3>
                    <p className="text-gray-700">{opportunity.collaboration_area}</p>
                  </div>
                </>
              )}

              {opportunity.requirements && opportunity.requirements.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Requisitos</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {opportunity.requirements.map((req: string, index: number) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proceso de Postulación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Completar Formulario</h4>
                    <p className="text-sm text-gray-600">Llena todos los campos requeridos con tu información personal, académica y profesional.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Adjuntar Documentos</h4>
                    <p className="text-sm text-gray-600">Sube tu CV, cartas de recomendación y otros documentos requeridos.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Revisión por Coordinadores</h4>
                    <p className="text-sm text-gray-600">Tu postulación será evaluada por los coordinadores de ambas universidades.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Notificación de Resultado</h4>
                    <p className="text-sm text-gray-600">Recibirás la decisión sobre tu postulación por correo electrónico.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium">Universidad Anfitriona</p>
                  <p className="text-sm text-gray-600">
                    {opportunity.universities?.name}
                    {opportunity.universities?.city && ` - ${opportunity.universities.city}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium">Fecha Límite</p>
                  <p className="text-sm text-gray-600">
                    {new Date(opportunity.application_deadline).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {opportunity.estimated_duration && (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium">Duración Estimada</p>
                    <p className="text-sm text-gray-600">{opportunity.estimated_duration}</p>
                  </div>
                </div>
              )}

              {opportunity.funding_available && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium">Financiamiento</p>
                    <p className="text-sm text-gray-600">Disponible</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos Requeridos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Currículum Vitae (CV)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Carta de Invitación (opcional)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Propuesta de Investigación/Docencia</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Carta de Aval Institucional</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-800 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Fecha Límite</span>
              </div>
              <p className="text-sm text-orange-700">
                Asegúrate de enviar tu postulación antes del{' '}
                <strong>
                  {new Date(opportunity.application_deadline).toLocaleDateString('es-ES')}
                </strong>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
