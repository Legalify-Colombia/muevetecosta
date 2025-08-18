import { useState } from "react";
import { useApplyToCoilProject } from "@/hooks/useCoilProjects";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CoilApplicationFormProps {
  projectId: string;
  onSuccess: () => void;
}

export default function CoilApplicationForm({ projectId, onSuccess }: CoilApplicationFormProps) {
  const [formData, setFormData] = useState({
    motivation: "",
    experience: ""
  });

  const applyToProject = useApplyToCoilProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyToProject.mutate({
      project_id: projectId,
      ...formData
    }, {
      onSuccess
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="motivation">Motivación</Label>
        <Textarea
          id="motivation"
          value={formData.motivation}
          onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
          placeholder="¿Por qué quieres participar en este proyecto?"
          required
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="experience">Experiencia Relevante</Label>
        <Textarea
          id="experience"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          placeholder="Describe tu experiencia relevante para este proyecto"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={applyToProject.isPending}>
        {applyToProject.isPending ? "Enviando..." : "Enviar Postulación"}
      </Button>
    </form>
  );
}