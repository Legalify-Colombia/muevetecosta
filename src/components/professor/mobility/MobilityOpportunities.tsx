
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ProfessorMobilityApplicationForm } from './ProfessorMobilityApplicationForm';

interface MobilityCall {
  id: string;
  title: string;
  description?: string;
  mobility_type: string;
  start_date?: string;
  end_date?: string;
  application_deadline: string;
  host_university_id: string;
  max_participants: number;
  requirements?: string;
  benefits?: string;
  duration_weeks?: number;
  is_active: boolean;
  created_at: string;
  universities?: {
    name: string;
    city: string;
  };
}

export default function MobilityOpportunities() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mobilityTypeFilter, setMobilityTypeFilter] = useState('all');
  const [selectedCall, setSelectedCall] = useState<MobilityCall | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const { data: mobilityCalls = [], isLoading } = useQuery({
    queryKey: ['professor-mobility-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_mobility_calls')
        .select(`
          *,
          universities(name, city)
        `)
        .eq('is_active', true)
        .gte('application_deadline', new Date().toISOString().split('T')[0])
        .order('application_deadline', { ascending: true });
      
      if (error) {
        console.error('Error fetching mobility calls:', error);
        throw error;
      }
      
      return data as MobilityCall[];
    }
  });

  const filteredCalls = mobilityCalls.filter(call => {
    const matchesSearch = 
      call.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.universities?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.universities?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = mobilityTypeFilter === 'all' || call.mobility_type === mobilityTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleApply = (call: MobilityCall) => {
    setSelectedCall(call);
    setShowApplicationForm(true);
  };

  const handleBackToList = () => {
    setShowApplicationForm(false);
    setSelectedCall(null);
  };

  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    setSelectedCall(null);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'teaching': 'bg-blue-100 text-blue-800',
      'research': 'bg-purple-100 text-purple-800',
      'training': 'bg-green-100 text-green-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'teaching': 'Docencia',
      'research': 'Investigación',
      'training': 'Capacitación'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const isDeadlineApproaching = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 7;
  };

  if (showApplicationForm && selectedCall) {
    return (
      <ProfessorMobilityApplicationForm
        mobilityCall={selectedCall}
        onBack={handleBackToList}
        onSuccess={handleApplicationSuccess}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Oportunidades de Movilidad para Profesores
        </CardTitle>
        <CardDescription>
          Explora y postúlate a oportunidades de movilidad académica disponibles
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar por título, universidad o ciudad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={mobilityTypeFilter} onValueChange={setMobilityTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de movilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="teaching">Docencia</SelectItem>
              <SelectItem value="research">Investigación</SelectItem>
              <SelectItem value="training">Capacitación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resultados */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredCalls.length > 0 ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {filteredCalls.length} oportunidad(es) encontrada(s)
            </div>
            {filteredCalls.map((call) => (
              <Card key={call.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{call.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getTypeColor(call.mobility_type)}>
                          {getTypeLabel(call.mobility_type)}
                        </Badge>
                        {call.duration_weeks && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {call.duration_weeks} semanas
                          </Badge>
                        )}
                        {isDeadlineApproaching(call.application_deadline) && (
                          <Badge variant="destructive">
                            ¡Fecha límite próxima!
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleApply(call)}
                      className="ml-4"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Postularme
                    </Button>
                  </div>
                  
                  {call.description && (
                    <p className="text-muted-foreground mb-4 line-clamp-2">{call.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{call.universities?.name}, {call.universities?.city}</span>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Fecha límite: {new Date(call.application_deadline).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Máx. {call.max_participants} participantes</span>
                    </div>
                  </div>

                  {call.requirements && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Requisitos:</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{call.requirements}</p>
                    </div>
                  )}

                  {call.benefits && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-1 text-green-800">Beneficios:</h4>
                      <p className="text-sm text-green-700 line-clamp-2">{call.benefits}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay oportunidades disponibles</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || mobilityTypeFilter !== 'all' 
                ? 'No se encontraron oportunidades con los filtros aplicados.'
                : 'Actualmente no hay convocatorias de movilidad activas.'
              }
            </p>
            {(searchTerm || mobilityTypeFilter !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setMobilityTypeFilter('all');
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
