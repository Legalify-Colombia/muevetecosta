
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ProjectCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: any;
  onSuccess: () => void;
}

export function ProjectCreationDialog({ 
  open, 
  onOpenChange, 
  project, 
  onSuccess 
}: ProjectCreationDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: '',
    status: 'proposal',
    start_date: '',
    end_date: '',
    is_public: true,
    lead_university_id: '',
  });

  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);

  const { data: universities } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        objectives: project.objectives || '',
        status: project.status || 'proposal',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        is_public: project.is_public ?? true,
        lead_university_id: project.lead_university_id || '',
      });

      const universityIds = project.project_universities?.map((pu: any) => pu.university_id) || [];
      setSelectedUniversities(universityIds);
    } else {
      setFormData({
        title: '',
        description: '',
        objectives: '',
        status: 'proposal',
        start_date: '',
        end_date: '',
        is_public: true,
        lead_university_id: '',
      });
      setSelectedUniversities([]);
    }
  }, [project]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: projectData, error: projectError } = await supabase
        .from('research_projects')
        .insert([data])
        .select()
        .single();

      if (projectError) throw projectError;

      // Agregar universidades participantes
      if (selectedUniversities.length > 0) {
        const projectUniversities = selectedUniversities.map(univId => ({
          project_id: projectData.id,
          university_id: univId,
          role: univId === data.lead_university_id ? 'lead' : 'participant'
        }));

        const { error: univError } = await supabase
          .from('project_universities')
          .insert(projectUniversities);

        if (univError) throw univError;
      }

      return projectData;
    },
    onSuccess: () => {
      toast({
        title: "Proyecto creado",
        description: "El proyecto de investigación ha sido creado exitosamente.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error('Error creating project:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error: projectError } = await supabase
        .from('research_projects')
        .update(data)
        .eq('id', project.id);

      if (projectError) throw projectError;

      // Actualizar universidades participantes
      await supabase
        .from('project_universities')
        .delete()
        .eq('project_id', project.id);

      if (selectedUniversities.length > 0) {
        const projectUniversities = selectedUniversities.map(univId => ({
          project_id: project.id,
          university_id: univId,
          role: univId === data.lead_university_id ? 'lead' : 'participant'
        }));

        const { error: univError } = await supabase
          .from('project_universities')
          .insert(projectUniversities);

        if (univError) throw univError;
      }
    },
    onSuccess: () => {
      toast({
        title: "Proyecto actualizado",
        description: "El proyecto de investigación ha sido actualizado exitosamente.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el proyecto. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error('Error updating project:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (project) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleUniversityToggle = (universityId: string) => {
    setSelectedUniversities(prev => 
      prev.includes(universityId)
        ? prev.filter(id => id !== universityId)
        : [...prev, universityId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título del Proyecto *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="objectives">Objetivos</Label>
            <Textarea
              id="objectives"
              value={formData.objectives}
              onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposal">Propuesta</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lead_university">Universidad Líder</Label>
              <Select
                value={formData.lead_university_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, lead_university_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar universidad" />
                </SelectTrigger>
                <SelectContent>
                  {universities?.map((university) => (
                    <SelectItem key={university.id} value={university.id}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Fecha de Inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="end_date">Fecha de Fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Universidades Participantes</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {universities?.map((university) => (
                <div key={university.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={university.id}
                    checked={selectedUniversities.includes(university.id)}
                    onCheckedChange={() => handleUniversityToggle(university.id)}
                  />
                  <Label htmlFor={university.id} className="text-sm">
                    {university.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_public: !!checked }))
              }
            />
            <Label htmlFor="is_public">Proyecto público (visible en búsquedas)</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {project ? 'Actualizar' : 'Crear'} Proyecto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
