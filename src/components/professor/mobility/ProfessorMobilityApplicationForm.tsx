
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Send, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProfessorMobilityApplicationFormProps {
  callId: string;
  onSuccess: () => void;
}

export const ProfessorMobilityApplicationForm = ({ callId, onSuccess }: ProfessorMobilityApplicationFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      const applicationData = {
        professor_id: user.id,
        mobility_call_id: callId,
        mobility_type: data.mobility_type,
        start_date: data.start_date,
        end_date: data.end_date,
        purpose: data.purpose,
        status: 'pending'
      };

      const { error } = await supabase
        .from('professor_mobility_applications')
        .insert(applicationData);
      
      if (error) {
        console.error('Error creating application:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-mobility-applications'] });
      toast({
        title: "Aplicación enviada",
        description: "Tu aplicación de movilidad ha sido enviada exitosamente.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la aplicación. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const data = {
      mobility_type: formData.get('mobility_type'),
      start_date: startDate?.toISOString().split('T')[0],
      end_date: endDate?.toISOString().split('T')[0],
      purpose: formData.get('purpose')
    };

    if (!data.mobility_type || !data.start_date || !data.end_date || !data.purpose) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    submitApplicationMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aplicar a Convocatoria de Movilidad</CardTitle>
        <CardDescription>
          Completa el formulario para aplicar a esta convocatoria de movilidad docente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobility_type">Tipo de Movilidad *</Label>
              <Select name="mobility_type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teaching">Docencia</SelectItem>
                  <SelectItem value="research">Investigación</SelectItem>
                  <SelectItem value="training">Capacitación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Fecha de Inicio *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP', { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Fecha de Fin *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP', { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < (startDate || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="purpose">Propósito de la Movilidad *</Label>
            <Textarea
              id="purpose"
              name="purpose"
              rows={4}
              placeholder="Describe el propósito y objetivos de tu movilidad académica..."
              required
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitApplicationMutation.isPending}
              className="w-full md:w-auto"
            >
              {submitApplicationMutation.isPending ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Aplicación
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
