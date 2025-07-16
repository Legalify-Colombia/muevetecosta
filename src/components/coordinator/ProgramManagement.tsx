
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, Edit, Trash2, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const ProgramManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_semesters: 10,
  });

  const { data: myUniversity } = useQuery({
    queryKey: ['coordinator-university', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('coordinator_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['university-programs', myUniversity?.id],
    queryFn: async () => {
      if (!myUniversity?.id) return [];
      const { data, error } = await supabase
        .from('academic_programs')
        .select(`
          *,
          courses(id, name, code, credits, semester, is_active)
        `)
        .eq('university_id', myUniversity.id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!myUniversity?.id
  });

  const createProgramMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!myUniversity?.id) throw new Error('No university found');
      
      const { error } = await supabase
        .from('academic_programs')
        .insert({
          ...data,
          university_id: myUniversity.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-programs'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Programa creado",
        description: "El programa académico se ha creado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el programa académico.",
        variant: "destructive",
      });
    }
  });

  const updateProgramMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('academic_programs')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-programs'] });
      setIsDialogOpen(false);
      setEditingProgram(null);
      resetForm();
      toast({
        title: "Programa actualizado",
        description: "El programa académico se ha actualizado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el programa académico.",
        variant: "destructive",
      });
    }
  });

  const toggleProgramStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('academic_programs')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-programs'] });
      toast({
        title: "Estado actualizado",
        description: "El estado del programa se ha actualizado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del programa.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration_semesters: 10,
    });
  };

  const handleEdit = (program: any) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      description: program.description || "",
      duration_semesters: program.duration_semesters || 10,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingProgram) {
      updateProgramMutation.mutate({ id: editingProgram.id, data: formData });
    } else {
      createProgramMutation.mutate(formData);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleProgramStatusMutation.mutate({ id, isActive: !currentStatus });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Gestión de Programas Académicos
            </CardTitle>
            <CardDescription>
              Administra los programas académicos disponibles para movilidad estudiantil
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingProgram(null); resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Programa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProgram ? 'Editar Programa' : 'Nuevo Programa Académico'}
                </DialogTitle>
                <DialogDescription>
                  {editingProgram ? 'Modifica la información del programa académico' : 'Crea un nuevo programa académico para tu universidad'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Programa</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Ingeniería de Sistemas"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descripción del programa"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duración (Semestres)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_semesters}
                    onChange={(e) => setFormData({ ...formData, duration_semesters: parseInt(e.target.value) || 10 })}
                    min="1"
                    max="20"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!formData.name.trim() || createProgramMutation.isPending || updateProgramMutation.isPending}
                  >
                    {createProgramMutation.isPending || updateProgramMutation.isPending ? 
                      'Guardando...' : 
                      (editingProgram ? 'Actualizar' : 'Crear')
                    }
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {programs.length > 0 ? (
          <div className="space-y-4">
            {programs.map((program) => (
              <div key={program.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-lg">{program.name}</h3>
                    <Badge variant={program.is_active ? "default" : "secondary"}>
                      {program.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(program)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={program.is_active ? "secondary" : "default"}
                      onClick={() => handleToggleStatus(program.id, program.is_active)}
                    >
                      {program.is_active ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </div>
                
                {program.description && (
                  <p className="text-gray-600 mb-2">{program.description}</p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Duración: {program.duration_semesters} semestres</span>
                  <span className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    {program.courses?.length || 0} cursos
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              No hay programas académicos configurados
            </p>
            <Button onClick={() => { setEditingProgram(null); resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Programa
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
