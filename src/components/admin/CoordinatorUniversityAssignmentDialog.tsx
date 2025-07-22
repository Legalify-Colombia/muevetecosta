import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Check, X } from "lucide-react";

interface CoordinatorUniversityAssignmentDialogProps {
  coordinatorId: string;
  coordinatorName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CoordinatorUniversityAssignmentDialog = ({
  coordinatorId,
  coordinatorName,
  isOpen,
  onOpenChange
}: CoordinatorUniversityAssignmentDialogProps) => {
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available universities
  const { data: universities = [] } = useQuery({
    queryKey: ['universities-available'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name, coordinator_id')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Get current coordinator university
  const { data: currentUniversity } = useQuery({
    queryKey: ['coordinator-university', coordinatorId],
    queryFn: async () => {
      if (!coordinatorId) return null;
      
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .eq('coordinator_id', coordinatorId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!coordinatorId
  });

  // Assign university mutation
  const assignUniversityMutation = useMutation({
    mutationFn: async (universityId: string) => {
      const { error } = await supabase
        .from('universities')
        .update({ coordinator_id: coordinatorId })
        .eq('id', universityId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      const university = universities.find(u => u.id === selectedUniversityId);
      toast({
        title: "Universidad asignada",
        description: `${coordinatorName} ha sido asignado a ${university?.name} exitosamente`,
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-university'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al asignar universidad",
        variant: "destructive",
      });
    }
  });

  // Remove university assignment mutation
  const removeUniversityMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('universities')
        .update({ coordinator_id: null })
        .eq('coordinator_id', coordinatorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Asignación removida",
        description: `${coordinatorName} ya no está asignado a ninguna universidad`,
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-university'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al remover asignación",
        variant: "destructive",
      });
    }
  });

  const handleAssignUniversity = () => {
    if (!selectedUniversityId) return;
    assignUniversityMutation.mutate(selectedUniversityId);
  };

  const handleRemoveUniversity = () => {
    removeUniversityMutation.mutate();
  };

  const availableUniversities = universities.filter(
    university => !university.coordinator_id || university.coordinator_id === coordinatorId
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Asignar Universidad a Coordinador
          </DialogTitle>
          <DialogDescription>
            Asigna una universidad al coordinador {coordinatorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentUniversity && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Universidad actual:</p>
                  <p className="text-sm text-blue-700 font-semibold">
                    {currentUniversity.name}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Check className="h-3 w-3 mr-1" />
                  Asignado
                </Badge>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {currentUniversity ? 'Cambiar a otra universidad:' : 'Seleccionar universidad:'}
            </label>
            <Select value={selectedUniversityId} onValueChange={setSelectedUniversityId}>
              <SelectTrigger className="bg-white border border-gray-300">
                <SelectValue placeholder="Selecciona una universidad" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                {availableUniversities.map((university) => (
                  <SelectItem 
                    key={university.id} 
                    value={university.id}
                    className="hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{university.name}</span>
                      {university.coordinator_id === coordinatorId && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Actual
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {availableUniversities.length === 0 && (
              <p className="text-sm text-gray-500">
                No hay universidades disponibles para asignar
              </p>
            )}
          </div>

          {availableUniversities.length > 0 && (
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p><strong>Nota:</strong> Solo se muestran universidades sin coordinador asignado o la universidad actual de este coordinador.</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {currentUniversity && (
            <Button
              variant="outline"
              onClick={handleRemoveUniversity}
              disabled={removeUniversityMutation.isPending}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Remover Asignación
            </Button>
          )}
          <Button
            onClick={handleAssignUniversity}
            disabled={!selectedUniversityId || assignUniversityMutation.isPending || selectedUniversityId === currentUniversity?.id}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            {assignUniversityMutation.isPending ? "Asignando..." : "Asignar Universidad"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};