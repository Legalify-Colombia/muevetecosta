
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Users } from "lucide-react";

interface UniversityCoordinatorAssignmentProps {
  universityId: string;
  universityName: string;
  currentCoordinatorId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UniversityCoordinatorAssignment = ({
  universityId,
  universityName,
  currentCoordinatorId,
  isOpen,
  onOpenChange
}: UniversityCoordinatorAssignmentProps) => {
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available coordinators
  const { data: coordinators = [] } = useQuery({
    queryKey: ['coordinators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, document_number')
        .eq('role', 'coordinator')
        .order('full_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch current coordinator info
  const { data: currentCoordinator } = useQuery({
    queryKey: ['current-coordinator', currentCoordinatorId],
    queryFn: async () => {
      if (!currentCoordinatorId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, document_number')
        .eq('id', currentCoordinatorId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentCoordinatorId
  });

  // Assign coordinator mutation
  const assignCoordinatorMutation = useMutation({
    mutationFn: async (coordinatorId: string) => {
      const { error } = await supabase
        .from('universities')
        .update({ coordinator_id: coordinatorId })
        .eq('id', universityId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Coordinador asignado",
        description: `El coordinador ha sido asignado a ${universityName} exitosamente`,
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al asignar coordinador",
        variant: "destructive",
      });
    }
  });

  // Remove coordinator mutation
  const removeCoordinatorMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('universities')
        .update({ coordinator_id: null })
        .eq('id', universityId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Coordinador removido",
        description: `El coordinador ha sido removido de ${universityName}`,
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al remover coordinador",
        variant: "destructive",
      });
    }
  });

  const handleAssignCoordinator = () => {
    if (!selectedCoordinatorId) return;
    assignCoordinatorMutation.mutate(selectedCoordinatorId);
  };

  const handleRemoveCoordinator = () => {
    removeCoordinatorMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Asignar Coordinador
          </DialogTitle>
          <DialogDescription>
            Asigna un coordinador a la universidad {universityName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentCoordinator && (
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Coordinador actual:</p>
              <p className="text-sm text-blue-700">
                {currentCoordinator.full_name} ({currentCoordinator.document_number})
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {currentCoordinator ? 'Cambiar coordinador:' : 'Seleccionar coordinador:'}
            </label>
            <Select value={selectedCoordinatorId} onValueChange={setSelectedCoordinatorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un coordinador" />
              </SelectTrigger>
              <SelectContent>
                {coordinators.map((coordinator) => (
                  <SelectItem key={coordinator.id} value={coordinator.id}>
                    {coordinator.full_name} ({coordinator.document_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {currentCoordinator && (
            <Button
              variant="outline"
              onClick={handleRemoveCoordinator}
              disabled={removeCoordinatorMutation.isPending}
            >
              Remover Coordinador
            </Button>
          )}
          <Button
            onClick={handleAssignCoordinator}
            disabled={!selectedCoordinatorId || assignCoordinatorMutation.isPending}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            {assignCoordinatorMutation.isPending ? "Asignando..." : "Asignar Coordinador"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
