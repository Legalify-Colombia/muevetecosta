
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobilityOpportunityDetailProps {
  callId: string;
}

interface MobilityCall {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  application_deadline: string;
  requirements: string;
  benefits: string;
  status: string;
  max_participants: number;
  created_at: string;
  updated_at: string;
  universities: {
    id: string;
    name: string;
    country: string;
    city: string;
  };
}

export const MobilityOpportunityDetail: React.FC<MobilityOpportunityDetailProps> = ({ 
  callId 
}) => {
  const navigate = useNavigate();

  const { data: mobilityCall, isLoading, error } = useQuery({
    queryKey: ['mobility-call', callId],
    queryFn: async (): Promise<MobilityCall> => {
      const { data, error } = await supabase
        .from('professor_mobility_calls')
        .select(`
          *,
          universities (
            id,
            name,
            country,
            city
          )
        `)
        .eq('id', callId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !mobilityCall) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">
            Error al cargar los detalles de la convocatoria
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleApply = () => {
    // Navigate to application form - you may need to adjust this route
    navigate(`/professor/mobility/apply/${callId}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{mobilityCall.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{mobilityCall.universities.name}</span>
                <span>•</span>
                <span>{mobilityCall.universities.city}, {mobilityCall.universities.country}</span>
              </div>
            </div>
            <Badge variant={mobilityCall.status === 'active' ? 'default' : 'secondary'}>
              {mobilityCall.status === 'active' ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Fecha de inicio</p>
                <p className="text-sm font-medium">
                  {new Date(mobilityCall.start_date).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-500">Fecha límite</p>
                <p className="text-sm font-medium">
                  {new Date(mobilityCall.application_deadline).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Participantes máximos</p>
                <p className="text-sm font-medium">{mobilityCall.max_participants}</p>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-2">Descripción</h3>
            <p className="text-gray-700 mb-4">{mobilityCall.description}</p>

            <h3 className="text-lg font-semibold mb-2">Requisitos</h3>
            <div className="text-gray-700 mb-4" 
                 dangerouslySetInnerHTML={{ __html: mobilityCall.requirements }} />

            <h3 className="text-lg font-semibold mb-2">Beneficios</h3>
            <div className="text-gray-700 mb-6" 
                 dangerouslySetInnerHTML={{ __html: mobilityCall.benefits }} />
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleApply}
              disabled={mobilityCall.status !== 'active'}
              size="lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Aplicar a esta convocatoria
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
