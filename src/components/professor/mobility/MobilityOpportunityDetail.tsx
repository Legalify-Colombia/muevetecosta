
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Building, DollarSign, CheckCircle, FileText } from 'lucide-react';
import MobilityApplicationForm from './MobilityApplicationForm';

interface MobilityOpportunity {
  id: string;
  title: string;
  hostInstitution: string;
  mobilityType: 'Docencia' | 'Investigación' | 'Capacitación' | 'Observación';
  applicationDeadline: string;
  estimatedDuration: string;
  description: string;
  requirements: string[];
  funding: boolean;
}

interface MobilityOpportunityDetailProps {
  opportunity: MobilityOpportunity;
  onBack: () => void;
}

export default function MobilityOpportunityDetail({ opportunity, onBack }: MobilityOpportunityDetailProps) {
  const [showApplicationForm, setShowApplicationForm] = React.useState(false);

  const handleApply = () => {
    setShowApplicationForm(true);
  };

  const handleBackFromForm = () => {
    setShowApplicationForm(false);
  };

  if (showApplicationForm) {
    return (
      <MobilityApplicationForm
        opportunity={opportunity}
        onBack={handleBackFromForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Oportunidades
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{opportunity.title}</CardTitle>
              <div className="flex items-center text-muted-foreground">
                <Building className="h-4 w-4 mr-2" />
                {opportunity.hostInstitution}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Badge variant="secondary" className="self-end">
                {opportunity.mobilityType}
              </Badge>
              {opportunity.funding && (
                <Badge variant="default" className="bg-green-100 text-green-800 self-end">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Con financiación
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                <div>
                  <p className="font-medium">Fecha límite de postulación</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(opportunity.applicationDeadline).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-green-600" />
                <div>
                  <p className="font-medium">Duración estimada</p>
                  <p className="text-sm text-muted-foreground">{opportunity.estimatedDuration}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Descripción de la convocatoria</h3>
            <p className="text-muted-foreground leading-relaxed">{opportunity.description}</p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Requisitos del perfil</h3>
            <ul className="space-y-2">
              {opportunity.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Information */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Información adicional
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Las postulaciones serán evaluadas por orden de llegada</p>
              <p>• Se requiere aval de la universidad de origen</p>
              <p>• Los resultados se comunicarán dentro de 30 días hábiles</p>
              {opportunity.funding && (
                <p>• La financiación cubre gastos de hospedaje y alimentación</p>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <Button size="lg" onClick={handleApply} className="px-8">
              <FileText className="h-4 w-4 mr-2" />
              Postularme a esta convocatoria
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
