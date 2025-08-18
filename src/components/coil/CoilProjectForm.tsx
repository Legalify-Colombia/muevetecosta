import { useState } from "react";
import { useCreateCoilProject } from "@/hooks/useCoilProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CoilProjectFormProps {
  onSuccess: () => void;
}

export default function CoilProjectForm({ onSuccess }: CoilProjectFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    objectives: "",
    requirements: "",
    benefits: "",
    max_participants: 10
  });

  const createProject = useCreateCoilProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate(formData, {
      onSuccess
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título del Proyecto</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={createProject.isPending}>
        {createProject.isPending ? "Creando..." : "Crear Proyecto"}
      </Button>
    </form>
  );
}