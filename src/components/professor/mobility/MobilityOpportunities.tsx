
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Search, Plane, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MobilityOpportunityDetail } from './MobilityOpportunityDetail';

interface MobilityOpportunity {
  id: string;
  title: string;
  description?: string;
  host_institution_id?: string;
  mobility_type: string;
  application_deadline: string;
  estimated_duration?: string;
  collaboration_area?: string;
  funding_available: boolean;
  requirements?: string[];
  universities?: {
    name: string;
    city: string;
  };
}

export default function MobilityOpportunities() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<MobilityOpportunity | null>(null);

  // Fetch active mobility opportunities
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['mobility-opportunities'],
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
        console.error('Error fetching opportunities:', error);
        throw error;
      }
      
      return data as MobilityOpportunity[];
    }
  });

  const handleApplyToOpportunity = (opportunity: MobilityOpportunity) => {
    // This would typically open an application form or navigate to it
    console.log('Applying to opportunity:', opportunity.id);
    // For now, we'll just show a message
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = 
      opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.universities?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.collaboration_area?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || opp.mobility_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    const colors = {
      'Docencia': 'bg-blue-100 text-blue-800',
      'Investigación': 'bg-purple-100 text-purple-800',
      'Capacitación': 'bg-orange-100 text-orange-800',
      'Observación': 'bg-teal-100 text-teal-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const isDeadlineSoon = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  if (selectedOpportunity) {
    return (
      <MobilityOpportunityDetail
        opportunity={selectedOpportunity}
        onBack={() => setSelectedOpportunity(null)}
        onApply={handleApplyToOpportunity}
      />
    );
  }

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
          <Plane className="h-5 w-5 mr-2" />
          Oportunidades de Movilidad
        </CardTitle>
        <CardDescription>
          Explora las convocatorias de movilidad disponibles para profesores
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por título, universidad o área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="Docencia">Docencia</SelectItem>
              <SelectItem value="Investigación">Investigación</SelectItem>
              <SelectItem value="Capacitación">Capacitación</SelectItem>
              <SelectItem value="Observación">Observación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredOpportunities.length} oportunidad(es) encontrada(s)
        </div>

        <div className="grid gap-4">
          {filteredOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                    <Badge className={getTypeColor(opportunity.mobility_type)} variant="secondary">
                      {opportunity.mobility_type}
                    </Badge>
                    {opportunity.funding_available && (
                      <Badge className="bg-green-100 text-green-800" variant="secondary">
                        Con Financiamiento
                      </Badge>
                    )}
                    {isDeadlineSoon(opportunity.application_deadline) && (
                      <Badge className="bg-red-100 text-red-800" variant="secondary">
                        Fecha límite próxima
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{opportunity.universities?.name} - {opportunity.universities?.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Fecha límite: {new Date(opportunity.application_deadline).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                  
                  {opportunity.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{opportunity.description}</p>
                  )}
                  
                  {opportunity.collaboration_area && (
                    <div className="text-sm">
                      <span className="font-medium">Área: </span>
                      <span className="text-gray-600">{opportunity.collaboration_area}</span>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setSelectedOpportunity(opportunity)}
                  className="ml-4"
                >
                  Ver Detalles
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
          
          {filteredOpportunities.length === 0 && (
            <div className="text-center py-8">
              <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron oportunidades de movilidad</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
