
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, University, UserCheck, Plus, X } from "lucide-react";

interface ProjectCreationProps {
  onClose?: () => void;
}

const ProjectCreation = ({ onClose }: ProjectCreationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    objectives: "",
    start_date: "",
    end_date: "",
    status: "proposal"
  });
  
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [participantsByUniversity, setParticipantsByUniversity] = useState<Record<string, any[]>>({});

  // Obtener universidades disponibles
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Obtener profesores por universidad
  const { data: professorsByUniversity = {} } = useQuery({
    queryKey: ['professors-by-university', selectedUniversities],
    queryFn: async () => {
      if (selectedUniversities.length === 0) return {};
      
      const result: Record<string, any[]> = {};
      
      for (const univId of selectedUniversities) {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            professor_info (
              university,
              expertise_areas,
              research_interests
            )
          `)
          .eq('role', 'professor');
        
        if (!error && data) {
          // Filtrar profesores por universidad
          const universityName = universities.find(u => u.id === univId)?.name;
          const filteredProfessors = data.filter(prof => 
            prof.professor_info?.university === universityName
          );
          result[univId] = filteredProfessors;
        }
      }
      
      return result;
    },
    enabled: selectedUniversities.length > 0
  });

  // Crear proyecto
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      if (!user?.id) throw new Error("Usuario no autenticado");
      
      // 1. Crear el proyecto
      const { data: project, error: projectError } = await supabase
        .from('research_projects')
        .insert({
          title: projectData.title,
          description: projectData.description,
          objectives: projectData.objectives,
          start_date: projectData.start_date || null,
          end_date: projectData.end_date || null,
          status: projectData.status,
          is_public: true,
          lead_university_id: selectedUniversities[0] || null
        })
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      // 2. Agregar universidades participantes
      for (const univId of selectedUniversities) {
        const { error: univError } = await supabase
          .from('project_universities')
          .insert({
            project_id: project.id,
            university_id: univId,
            role: univId === selectedUniversities[0] ? 'lead' : 'participant'
          });
        
        if (univError) throw univError;
      }
      
      // 3. Agregar participantes (profesores)
      for (const [univId, participants] of Object.entries(participantsByUniversity)) {
        for (const participant of participants) {
          const { error: partError } = await supabase
            .from('project_participants')
            .insert({
              project_id: project.id,
              professor_id: participant.professor_id,
              university_id: univId,
              role: participant.role,
              status: 'active'
            });
          
          if (partError) throw partError;
        }
      }
      
      return project;
    },
    onSuccess: () => {
      toast({
        title: "Proyecto creado exitosamente",
        description: "El proyecto de investigación ha sido registrado en la plataforma."
      });
      queryClient.invalidateQueries({ queryKey: ['professor-projects'] });
      queryClient.invalidateQueries({ queryKey: ['research-projects'] });
      onClose?.();
    },
    onError: (error) => {
      toast({
        title: "Error al crear proyecto",
        description: "No se pudo crear el proyecto. Intenta nuevamente.",
        variant: "destructive"
      });
      console.error("Error creating project:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || selectedUniversities.length === 0) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }
    
    createProjectMutation.mutate(formData);
  };

  const addUniversity = (universityId: string) => {
    if (!selectedUniversities.includes(universityId)) {
      setSelectedUniversities([...selectedUniversities, universityId]);
      setParticipantsByUniversity({ ...participantsByUniversity, [universityId]: [] });
    }
  };

  const removeUniversity = (universityId: string) => {
    setSelectedUniversities(selectedUniversities.filter(id => id !== universityId));
    const newParticipants = { ...participantsByUniversity };
    delete newParticipants[universityId];
    setParticipantsByUniversity(newParticipants);
  };

  const addParticipant = (universityId: string, professorId: string, role: string) => {
    const professor = professorsByUniversity[universityId]?.find(p => p.id === professorId);
    if (professor) {
      const newParticipant = {
        professor_id: professorId,
        professor_name: professor.full_name,
        role
      };
      
      setParticipantsByUniversity({
        ...participantsByUniversity,
        [universityId]: [...(participantsByUniversity[universityId] || []), newParticipant]
      });
    }
  };

  const removeParticipant = (universityId: string, professorId: string) => {
    setParticipantsByUniversity({
      ...participantsByUniversity,
      [universityId]: participantsByUniversity[universityId]?.filter(p => p.professor_id !== professorId) || []
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Nuevo Proyecto de Investigación</CardTitle>
        <CardDescription>
          Registra un nuevo proyecto de investigación colaborativa entre universidades de la red MobiCaribe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información General</h3>
            
            <div>
              <Label htmlFor="title">Título del Proyecto *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título descriptivo del proyecto de investigación"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción Detallada *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el proyecto, su alcance y metodología"
                rows={4}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="objectives">Objetivos *</Label>
              <Textarea
                id="objectives"
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                placeholder="Objetivos específicos del proyecto"
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Fecha de Inicio</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="end_date">Fecha de Finalización Prevista</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Universidades Participantes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Universidades Participantes</h3>
            
            <div className="flex flex-wrap gap-2">
              {selectedUniversities.map(univId => {
                const university = universities.find(u => u.id === univId);
                return (
                  <Badge key={univId} variant="default" className="flex items-center gap-2">
                    <University className="h-3 w-3" />
                    {university?.name}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeUniversity(univId)}
                    />
                  </Badge>
                );
              })}
            </div>
            
            <Select onValueChange={addUniversity}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar universidad..." />
              </SelectTrigger>
              <SelectContent>
                {universities
                  .filter(u => !selectedUniversities.includes(u.id))
                  .map(university => (
                    <SelectItem key={university.id} value={university.id}>
                      {university.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Investigadores por Universidad */}
          {selectedUniversities.map(univId => {
            const university = universities.find(u => u.id === univId);
            const availableProfessors = professorsByUniversity[univId] || [];
            const currentParticipants = participantsByUniversity[univId] || [];
            
            return (
              <div key={univId} className="space-y-4 border rounded-lg p-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <University className="h-4 w-4" />
                  Investigadores - {university?.name}
                </h4>
                
                {currentParticipants.map(participant => (
                  <div key={participant.professor_id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      <span>{participant.professor_name}</span>
                      <Badge variant="outline">{participant.role}</Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipant(univId, participant.professor_id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Investigador
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Investigador</DialogTitle>
                      <DialogDescription>
                        Selecciona un profesor de {university?.name} para agregarlo al proyecto
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {availableProfessors
                        .filter(prof => !currentParticipants.some(p => p.professor_id === prof.id))
                        .map(professor => (
                          <div key={professor.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">{professor.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {professor.professor_info?.research_interests || 'Sin información de investigación'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => addParticipant(univId, professor.id, 'principal_investigator')}
                              >
                                Inv. Principal
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addParticipant(univId, professor.id, 'co_investigator')}
                              >
                                Co-investigador
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            );
          })}

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? "Creando..." : "Crear Proyecto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectCreation;
