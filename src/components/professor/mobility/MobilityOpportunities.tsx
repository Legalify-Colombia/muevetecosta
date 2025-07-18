
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Building, BookOpen, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface MobilityCall {
  id: string;
  title: string;
  description?: string;
  mobility_type: string;
  start_date?: string;
  end_date?: string;
  application_deadline: string;
  max_participants: number;
  requirements?: string;
  benefits?: string;
  duration_weeks?: number;
  is_active: boolean;
  universities?: {
    name: string;
    city: string;
  };
}

export default function MobilityOpportunities() {
  const navigate = useNavigate();

  const { data: opportunities = [], isLoading, error } = useQuery({
    queryKey: ['professor-mobility-opportunities'],
    queryFn: async (): Promise<MobilityCall[]> => {
      const { data, error } = await supabase
        .from('professor_mobility_calls')
        .select(`
          *,
          universities!host_university_id(name, city)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching mobility opportunities:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'teaching':
        return <GraduationCap className="h-4 w-4" />;
      case 'research':
        return <BookOpen className="h-4 w-4" />;
      case 'training':
        return <Users className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'teaching':
        return 'bg-blue-100 text-blue-800';
      case 'research':
        return 'bg-purple-100 text-purple-800';
      case 'training':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'teaching': 'Docencia',
      'research': 'Investigación',
      'training': 'Capacitación'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const isApplicationOpen = (deadline: string) => {
    return new Date(deadline) > new Date();
  };

  const handleViewDetails = (opportunityId: string) => {
    navigate(`/professor/mobility/detail/${opportunityId}`);
  };

  const handleApply = (opportunityId: string) => {
    navigate(`/professor/mobility/apply/${opportunityId}`);
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

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error al cargar las oportunidades de movilidad
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Oportunidades de Movilidad</h2>
        <p className="text-muted-foreground">
          Explora las convocatorias de movilidad académica disponibles para profesores
        </p>
      </div>

      {opportunities.length > 0 ? (
        <div className="grid gap-6">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                      <Badge className={getTypeBadgeColor(opportunity.mobility_type)}>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(opportunity.mobility_type)}
                          {getTypeLabel(opportunity.mobility_type)}
                        </div>
                      </Badge>
                    </div>
                    {opportunity.description && (
                      <CardDescription className="text-base">
                        {opportunity.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="text-right">
                    {isApplicationOpen(opportunity.application_deadline) ? (
                      <Badge className="bg-green-100 text-green-800">
                        Abierta
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        Cerrada
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {opportunity.universities && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        {opportunity.universities.name} - {opportunity.universities.city}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span>
                      Fecha límite: {new Date(opportunity.application_deadline).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>Máx. {opportunity.max_participants} participantes</span>
                  </div>
                  
                  {opportunity.duration_weeks && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span>{opportunity.duration_weeks} semanas</span>
                    </div>
                  )}
                  
                  {opportunity.start_date && opportunity.end_date && (
                    <div className="flex items-center gap-2 md:col-span-2">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      <span>
                        {new Date(opportunity.start_date).toLocaleDateString('es-ES')} - {' '}
                        {new Date(opportunity.end_date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>

                {opportunity.requirements && (
                  <div>
                    <h4 className="font-medium mb-2">Requisitos:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {opportunity.requirements}
                    </p>
                  </div>
                )}

                {opportunity.benefits && (
                  <div>
                    <h4 className="font-medium mb-2">Beneficios:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {opportunity.benefits}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleViewDetails(opportunity.id)}
                    variant="outline"
                  >
                    Ver Detalles
                  </Button>
                  {isApplicationOpen(opportunity.application_deadline) && (
                    <Button
                      onClick={() => handleApply(opportunity.id)}
                    >
                      Postular
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No hay oportunidades disponibles</p>
              <p className="text-sm">
                Las convocatorias de movilidad aparecerán aquí cuando estén disponibles.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
