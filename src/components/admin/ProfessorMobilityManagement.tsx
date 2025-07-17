
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit2, Trash2, Calendar, MapPin, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Temporary interfaces until database tables are created
interface MobilityCall {
  id: string;
  title: string;
  description?: string;
  host_institution_id?: string;
  mobility_type: string;
  application_deadline: string;
  estimated_duration?: string;
  collaboration_area?: string;
  funding_available: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  requirements?: string[];
  universities?: {
    name: string;
    city: string;
  };
  profiles?: {
    full_name: string;
  };
}

interface University {
  id: string;
  name: string;
  city: string;
}

// Mock data for demonstration
const mockMobilityCalls: MobilityCall[] = [
  {
    id: '1',
    title: 'Estancia de Investigación en Biotecnología Marina',
    description: 'Oportunidad de investigación en el laboratorio de biotecnología marina',
    host_institution_id: '1',
    mobility_type: 'Investigación',
    application_deadline: '2024-03-15',
    estimated_duration: '3 meses',
    collaboration_area: 'Biotecnología',
    funding_available: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    universities: {
      name: 'Universidad del Norte',
      city: 'Barranquilla'
    }
  }
];

export const ProfessorMobilityManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<MobilityCall | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch mobility calls - using mock data for now
  const { data: mobilityCalls = [], isLoading } = useQuery({
    queryKey: ['professor-mobility-calls'],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query once tables are created
      return mockMobilityCalls;
    }
  });

  // Fetch universities
  const { data: universities = [] } = useQuery({
    queryKey: ['universities-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name, city')
        .eq('is_active', true);
      
      if (error) throw error;
      return (data || []) as University[];
    }
  });

  // Create/Update mutation
  const createUpdateMutation = useMutation({
    mutationFn: async (callData: any) => {
      // TODO: Implement actual database operations once tables are created
      console.log('Would save:', callData);
      // Simulate success
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-mobility-calls'] });
      setIsCreateDialogOpen(false);
      setEditingCall(null);
      toast({
        title: editingCall ? 'Convocatoria actualizada' : 'Convocatoria creada',
        description: 'La convocatoria se ha guardado exitosamente.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la convocatoria.',
        variant: 'destructive'
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Implement actual database operations once tables are created
      console.log('Would delete:', id);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-mobility-calls'] });
      toast({
        title: 'Convocatoria eliminada',
        description: 'La convocatoria se ha eliminado exitosamente.'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la convocatoria.',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const callData = {
      title: formData.get('title'),
      description: formData.get('description'),
      host_institution_id: formData.get('host_institution_id'),
      mobility_type: formData.get('mobility_type'),
      application_deadline: formData.get('application_deadline'),
      estimated_duration: formData.get('estimated_duration'),
      collaboration_area: formData.get('collaboration_area'),
      funding_available: formData.get('funding_available') === 'on',
      is_active: formData.get('is_active') === 'on',
      requirements: formData.get('requirements') ? 
        (formData.get('requirements') as string).split('\n').filter(req => req.trim()) : []
    };

    createUpdateMutation.mutate(callData);
  };

  const filteredCalls = mobilityCalls.filter(call =>
    call.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.universities?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Docencia': 'bg-blue-100 text-blue-800',
      'Investigación': 'bg-purple-100 text-purple-800',
      'Capacitación': 'bg-orange-100 text-orange-800',
      'Observación': 'bg-teal-100 text-teal-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Gestión de Convocatorias de Movilidad - Profesores
            </CardTitle>
            <CardDescription>
              Administra las convocatorias de movilidad para profesores y personal administrativo
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCall(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Convocatoria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCall ? 'Editar Convocatoria' : 'Crear Nueva Convocatoria'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Título de la Convocatoria</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={editingCall?.title}
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      name="description"
                      rows={3}
                      defaultValue={editingCall?.description}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="host_institution_id">Universidad Anfitriona</Label>
                    <Select name="host_institution_id" defaultValue={editingCall?.host_institution_id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar universidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map((uni) => (
                          <SelectItem key={uni.id} value={uni.id}>
                            {uni.name} - {uni.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="mobility_type">Tipo de Movilidad</Label>
                    <Select name="mobility_type" defaultValue={editingCall?.mobility_type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Docencia">Docencia</SelectItem>
                        <SelectItem value="Investigación">Investigación</SelectItem>
                        <SelectItem value="Capacitación">Capacitación</SelectItem>
                        <SelectItem value="Observación">Observación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="application_deadline">Fecha Límite</Label>
                    <Input
                      id="application_deadline"
                      name="application_deadline"
                      type="date"
                      defaultValue={editingCall?.application_deadline}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="estimated_duration">Duración Estimada</Label>
                    <Input
                      id="estimated_duration"
                      name="estimated_duration"
                      placeholder="ej. 3 meses"
                      defaultValue={editingCall?.estimated_duration}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="collaboration_area">Área de Colaboración</Label>
                    <Input
                      id="collaboration_area"
                      name="collaboration_area"
                      defaultValue={editingCall?.collaboration_area}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="requirements">Requisitos (uno por línea)</Label>
                    <Textarea
                      id="requirements"
                      name="requirements"
                      rows={4}
                      defaultValue={editingCall?.requirements?.join('\n')}
                      placeholder="Escriba cada requisito en una línea nueva"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="funding_available"
                      name="funding_available"
                      defaultChecked={editingCall?.funding_available}
                    />
                    <Label htmlFor="funding_available">Financiamiento Disponible</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      name="is_active"
                      defaultChecked={editingCall?.is_active ?? true}
                    />
                    <Label htmlFor="is_active">Convocatoria Activa</Label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingCall(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createUpdateMutation.isPending}>
                    {createUpdateMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Buscar convocatorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="text-sm text-muted-foreground">
            {filteredCalls.length} convocatoria(s) encontrada(s)
          </div>
        </div>

        <div className="grid gap-4">
          {filteredCalls.map((call) => (
            <div key={call.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{call.title}</h3>
                    <Badge className={getStatusColor(call.is_active)} variant="secondary">
                      {call.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <Badge className={getTypeColor(call.mobility_type)} variant="secondary">
                      {call.mobility_type}
                    </Badge>
                    {call.funding_available && (
                      <Badge className="bg-green-100 text-green-800" variant="secondary">
                        Con Financiamiento
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{call.universities?.name} - {call.universities?.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Fecha límite: {new Date(call.application_deadline).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                  
                  {call.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{call.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingCall(call);
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm('¿Estás seguro de que quieres eliminar esta convocatoria?')) {
                        deleteMutation.mutate(call.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredCalls.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron convocatorias</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
