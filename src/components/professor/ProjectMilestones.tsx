
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProjectMilestonesProps {
  projectId: string;
}

const ProjectMilestones = ({ projectId }: ProjectMilestonesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    milestone_date: "",
    next_steps: ""
  });

  // Obtener hitos del proyecto
  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['project-milestones', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_milestones')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('project_id', projectId)
        .order('milestone_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Crear hito
  const createMilestoneMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error("Usuario no autenticado");
      
      const { error } = await supabase
        .from('project_milestones')
        .insert({
          project_id: projectId,
          professor_id: user.id,
          ...data
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Hito registrado",
        description: "El avance se ha registrado correctamente."
      });
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        milestone_date: "",
        next_steps: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo registrar el hito.",
        variant: "destructive"
      });
      console.error("Error creating milestone:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMilestoneMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Avances y Hitos del Proyecto</h3>
          <p className="text-muted-foreground">
            Registra los avances y hitos importantes del proyecto
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Avance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Avance/Hito</DialogTitle>
              <DialogDescription>
                Documenta los avances importantes del proyecto
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título del Avance *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej. Completada fase de análisis de datos"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="milestone_date">Fecha del Hito *</Label>
                <Input
                  id="milestone_date"
                  type="date"
                  value={formData.milestone_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, milestone_date: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción del Avance</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe detalladamente el avance realizado..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="next_steps">Próximos Pasos</Label>
                <Textarea
                  id="next_steps"
                  value={formData.next_steps}
                  onChange={(e) => setFormData(prev => ({ ...prev, next_steps: e.target.value }))}
                  placeholder="Describe qué actividades siguen después de este hito..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMilestoneMutation.isPending}>
                  {createMilestoneMutation.isPending ? "Guardando..." : "Registrar Avance"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Hitos */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando avances...</p>
            </div>
          </CardContent>
        </Card>
      ) : milestones.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay avances registrados</h3>
            <p className="text-muted-foreground">
              Comienza a documentar los hitos y avances del proyecto
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{milestone.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(milestone.milestone_date).toLocaleDateString()}
                      • Por {milestone.profiles?.full_name}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {(milestone.description || milestone.next_steps) && (
                <CardContent>
                  {milestone.description && (
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Descripción:</h5>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  )}
                  {milestone.next_steps && (
                    <div>
                      <h5 className="font-medium mb-2">Próximos Pasos:</h5>
                      <p className="text-muted-foreground">{milestone.next_steps}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectMilestones;
