
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, MapPin, Users, Clock, FileText, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ProfessorMobilityApplicationForm } from './ProfessorMobilityApplicationForm';

interface MobilityOpportunityDetailProps {
  callId: string;
}

interface MobilityCallData {
  id: string;
  title: string;
  description: string | null;
  mobility_type: string;
  application_deadline: string;
  max_participants: number;
  duration_weeks: number | null;
  start_date: string | null;
  end_date: string | null;
  requirements: string | null;
  benefits: string | null;
  universities: {
    name: string;
    city: string;
    logo_url: string | null;
  } | null;
}

interface ApplicationData {
  id: string;
  status: string;
}

export const MobilityOpportunityDetail = ({ callId }: MobilityOpportunityDetailProps) => {
  const { user } = useAuth();
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);

  // Fetch mobility call details
  const { data: mobilityCall, isLoading } = useQuery({
    queryKey: ['professor-mobility-call', callId],
    queryFn: async (): Promise<MobilityCallData> => {
      const { data, error } = await supabase
        .from('professor_mobility_calls')
        .select(`
          *,
          universities!host_university_id(name, city, logo_url)
        `)
        .eq('id', callId)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as MobilityCallData;
    }
  });

  // Check if user has already applied
  const { data: existingApplication } = useQuery({
    queryKey: ['professor-application-check', callId, user?.id],
    queryFn: async (): Promise<ApplicationData | null> => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('professor_mobility_applications')
        .select('id, status')
        .eq('mobility_call_id', callId)
        .eq('professor_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as ApplicationData | null;
    },
    enabled: !!user && !!callId
  });

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'teaching': 'bg-blue-100 text-blue-800',
      'research': 'bg-purple-100 text-purple-800',
      'training': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'teaching': 'Docencia',
      'research': 'Investigación',
      'training': 'Capacitación'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'approved': 'Aprobada',
      'rejected': 'Rechazada'
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mobilityCall) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Convocatoria no encontrada</p>
        </CardContent>
      </Card>
    );
  }

  const isDeadlinePassed = new Date(mobilityCall.application_deadline) < new Date();
  const hasApplied = !!existingApplication;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{mobilityCall.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getTypeColor(mobilityCall.mobility_type)} variant="secondary">
                {getTypeLabel(mobilityCall.mobility_type)}
              </Badge>
              {hasApplied && existingApplication && (
                <Badge className={getStatusColor(existingApplication.status)} variant="secondary">
                  Aplicación: {getStatusLabel(existingApplication.status)}
                </Badge>
              )}
            </div>
            {mobilityCall.universities && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4" />
                <span>{mobilityCall.universities.name} - {mobilityCall.universities.city}</span>
              </div>
            )}
          </div>
          {mobilityCall.universities?.logo_url && (
            <img
              src={mobilityCall.universities.logo_url}
              alt={mobilityCall.universities.name}
              className="w-16 h-16 object-contain"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {mobilityCall.description && (
          <div>
            <h3 className="font-semibold mb-2">Descripción</h3>
            <p className="text-gray-700">{mobilityCall.description}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              <strong>Fecha límite:</strong> {new Date(mobilityCall.application_deadline).toLocaleDateString('es-ES')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              <strong>Máx. participantes:</strong> {mobilityCall.max_participants}
            </span>
          </div>
          {mobilityCall.duration_weeks && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                <strong>Duración:</strong> {mobilityCall.duration_weeks} semanas
              </span>
            </div>
          )}
          {mobilityCall.start_date && mobilityCall.end_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                <strong>Periodo:</strong> {new Date(mobilityCall.start_date).toLocaleDateString('es-ES')} - {new Date(mobilityCall.end_date).toLocaleDateString('es-ES')}
              </span>
            </div>
          )}
        </div>

        {mobilityCall.requirements && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Requisitos
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{mobilityCall.requirements}</p>
          </div>
        )}

        {mobilityCall.benefits && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Beneficios
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{mobilityCall.benefits}</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          {hasApplied ? (
            <Button disabled variant="outline">
              Ya has aplicado a esta convocatoria
            </Button>
          ) : isDeadlinePassed ? (
            <Button disabled variant="outline">
              Fecha límite vencida
            </Button>
          ) : (
            <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
              <DialogTrigger asChild>
                <Button>Aplicar a esta Convocatoria</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Aplicar a: {mobilityCall.title}</DialogTitle>
                </DialogHeader>
                <ProfessorMobilityApplicationForm
                  callId={callId}
                  onSuccess={() => setIsApplicationDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
