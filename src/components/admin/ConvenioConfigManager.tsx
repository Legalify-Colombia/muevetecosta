
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Settings, Save } from 'lucide-react';

interface ConvenioConfig {
  id: string;
  nombre_convenio: string;
  descripcion_convenio: string;
  beneficios?: string;
  proceso_habilitado: boolean;
  mensaje_bienvenida?: string;
  mensaje_confirmacion: string;
  correo_notificacion_admin?: string;
  updated_at: string;
}

const ConvenioConfigManager = () => {
  const [formData, setFormData] = useState<Partial<ConvenioConfig>>({});

  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['convenio-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('convenio_configuracion')
        .select('*')
        .single();
      
      if (error) throw error;
      
      setFormData(data);
      return data as ConvenioConfig;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<ConvenioConfig>) => {
      const { error } = await supabase
        .from('convenio_configuracion')
        .update(data)
        .eq('id', config?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenio-config'] });
      toast({
        title: "Configuración guardada",
        description: "La configuración del convenio ha sido actualizada exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
      console.error('Error saving config:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_convenio || !formData.descripcion_convenio) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(formData);
  };

  const parseBeneficios = (beneficios?: string) => {
    if (!beneficios) return [];
    return beneficios.split('|').filter(b => b.trim());
  };

  const handleBeneficiosChange = (value: string) => {
    setFormData({ ...formData, beneficios: value });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full border-b-2 border-primary h-8 w-8"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6" />
        <div>
          <h3 className="text-lg font-semibold">Configuración General</h3>
          <p className="text-sm text-muted-foreground">
            Configure los aspectos generales del proceso de postulación al convenio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Información general que verán las universidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre_convenio">Nombre del Convenio *</Label>
                <Input
                  id="nombre_convenio"
                  value={formData.nombre_convenio || ''}
                  onChange={(e) => setFormData({ ...formData, nombre_convenio: e.target.value })}
                  placeholder="Ej: Convenio Muévete"
                  required
                />
              </div>
              <div>
                <Label htmlFor="correo_notificacion_admin">Correo de Notificaciones Admin</Label>
                <Input
                  id="correo_notificacion_admin"
                  type="email"
                  value={formData.correo_notificacion_admin || ''}
                  onChange={(e) => setFormData({ ...formData, correo_notificacion_admin: e.target.value })}
                  placeholder="admin@universidad.edu.co"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="descripcion_convenio">Descripción del Convenio *</Label>
              <Textarea
                id="descripcion_convenio"
                value={formData.descripcion_convenio || ''}
                onChange={(e) => setFormData({ ...formData, descripcion_convenio: e.target.value })}
                placeholder="Describe qué es el convenio y sus objetivos principales..."
                rows={3}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="beneficios">Beneficios del Convenio</Label>
              <Textarea
                id="beneficios"
                value={formData.beneficios || ''}
                onChange={(e) => handleBeneficiosChange(e.target.value)}
                placeholder="Separe cada beneficio con | (pipe). Ej: Acceso a red de universidades|Intercambio simplificado|Soporte técnico"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Los beneficios se mostrarán como una lista con viñetas
              </p>
              {formData.beneficios && (
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium mb-2">Vista previa:</p>
                  <ul className="text-sm space-y-1">
                    {parseBeneficios(formData.beneficios).map((beneficio, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{beneficio.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mensajes del Sistema</CardTitle>
            <CardDescription>
              Personaliza los mensajes que verán las universidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mensaje_bienvenida">Mensaje de Bienvenida</Label>
              <Textarea
                id="mensaje_bienvenida"
                value={formData.mensaje_bienvenida || ''}
                onChange={(e) => setFormData({ ...formData, mensaje_bienvenida: e.target.value })}
                placeholder="Mensaje que se muestra al inicio del proceso de postulación..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="mensaje_confirmacion">Mensaje de Confirmación *</Label>
              <Textarea
                id="mensaje_confirmacion"
                value={formData.mensaje_confirmacion || ''}
                onChange={(e) => setFormData({ ...formData, mensaje_confirmacion: e.target.value })}
                placeholder="Mensaje que se muestra después de enviar la postulación..."
                rows={3}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del Proceso</CardTitle>
            <CardDescription>
              Controla si las universidades pueden postularse actualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Switch
                id="proceso_habilitado"
                checked={formData.proceso_habilitado || false}
                onCheckedChange={(checked) => setFormData({ ...formData, proceso_habilitado: checked })}
              />
              <div>
                <Label htmlFor="proceso_habilitado" className="font-medium">
                  Proceso de Postulación Habilitado
                </Label>
                <p className="text-sm text-muted-foreground">
                  {formData.proceso_habilitado 
                    ? 'Las universidades pueden postularse actualmente'
                    : 'El proceso de postulación está cerrado temporalmente'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {mutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConvenioConfigManager;
