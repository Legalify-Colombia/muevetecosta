import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Building, Users, Eye } from 'lucide-react';
import { MobilityOpportunityDetail } from './MobilityOpportunityDetail';

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

const mockOpportunities: MobilityOpportunity[] = [
  {
    id: '1',
    title: 'Estancia de Investigación en Biotecnología Marina',
    hostInstitution: 'Universidad del Norte',
    mobilityType: 'Investigación',
    applicationDeadline: '2024-03-15',
    estimatedDuration: '3 meses',
    description: 'Oportunidad de investigación en el laboratorio de biotecnología marina, colaborando en proyectos de conservación.',
    requirements: ['PhD en Biología o áreas afines', 'Experiencia en investigación marina', 'Inglés intermedio'],
    funding: true
  },
  {
    id: '2',
    title: 'Intercambio Docente - Área de Ingeniería',
    hostInstitution: 'Universidad Tecnológica de Bolívar',
    mobilityType: 'Docencia',
    applicationDeadline: '2024-04-20',
    estimatedDuration: '1 semestre',
    description: 'Programa de intercambio docente para impartir clases en programas de ingeniería.',
    requirements: ['Maestría mínima en Ingeniería', '5 años de experiencia docente', 'Disponibilidad completa'],
    funding: false
  },
  {
    id: '3',
    title: 'Capacitación en Metodologías Pedagógicas',
    hostInstitution: 'Universidad del Atlántico',
    mobilityType: 'Capacitación',
    applicationDeadline: '2024-02-28',
    estimatedDuration: '2 semanas',
    description: 'Curso intensivo sobre nuevas metodologías pedagógicas y tecnologías educativas.',
    requirements: ['Docente activo', 'Interés en innovación pedagógica'],
    funding: true
  }
];

export default function MobilityOpportunities() {
  const [opportunities] = useState<MobilityOpportunity[]>(mockOpportunities);
  const [filteredOpportunities, setFilteredOpportunities] = useState<MobilityOpportunity[]>(mockOpportunities);
  const [selectedOpportunity, setSelectedOpportunity] = useState<MobilityOpportunity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobilityTypeFilter, setMobilityTypeFilter] = useState<string>('all');
  const [institutionFilter, setInstitutionFilter] = useState<string>('all');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, mobilityTypeFilter, institutionFilter);
  };

  const handleMobilityTypeFilter = (type: string) => {
    setMobilityTypeFilter(type);
    applyFilters(searchTerm, type, institutionFilter);
  };

  const handleInstitutionFilter = (institution: string) => {
    setInstitutionFilter(institution);
    applyFilters(searchTerm, mobilityTypeFilter, institution);
  };

  const applyFilters = (term: string, type: string, institution: string) => {
    let filtered = opportunities;

    if (term) {
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(term.toLowerCase()) ||
        opp.description.toLowerCase().includes(term.toLowerCase())
      );
    }

    if (type !== 'all') {
      filtered = filtered.filter(opp => opp.mobilityType === type);
    }

    if (institution !== 'all') {
      filtered = filtered.filter(opp => opp.hostInstitution === institution);
    }

    setFilteredOpportunities(filtered);
  };

  const handleViewDetails = (opportunity: MobilityOpportunity) => {
    setSelectedOpportunity(opportunity);
  };

  const handleBackToList = () => {
    setSelectedOpportunity(null);
  };

  if (selectedOpportunity) {
    return (
      <MobilityOpportunityDetail 
        opportunity={selectedOpportunity}
        onBack={handleBackToList}
      />
    );
  }

  const uniqueInstitutions = [...new Set(opportunities.map(opp => opp.hostInstitution))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Oportunidades de Movilidad
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Buscar oportunidades..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Select value={mobilityTypeFilter} onValueChange={handleMobilityTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de movilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="Docencia">Docencia</SelectItem>
              <SelectItem value="Investigación">Investigación</SelectItem>
              <SelectItem value="Capacitación">Capacitación</SelectItem>
              <SelectItem value="Observación">Observación</SelectItem>
            </SelectContent>
          </Select>
          <Select value={institutionFilter} onValueChange={handleInstitutionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Institución anfitriona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las instituciones</SelectItem>
              {uniqueInstitutions.map(institution => (
                <SelectItem key={institution} value={institution}>
                  {institution}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{opportunity.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Building className="h-4 w-4 mr-1" />
                        {opportunity.hostInstitution}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant="secondary">
                        {opportunity.mobilityType}
                      </Badge>
                      {opportunity.funding && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Con financiación
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {opportunity.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Límite: {new Date(opportunity.applicationDeadline).toLocaleDateString('es-ES')}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      Duración: {opportunity.estimatedDuration}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      Modalidad: Presencial
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {opportunity.requirements.length} requisitos específicos
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(opportunity)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No se encontraron oportunidades</p>
              <p className="text-sm">
                Intenta ajustar los filtros de búsqueda para encontrar más opciones.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
