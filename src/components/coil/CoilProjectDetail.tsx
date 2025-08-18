import { useCoilProject } from "@/hooks/useCoilProjects";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CoilProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export default function CoilProjectDetail({ projectId, onBack }: CoilProjectDetailProps) {
  const { data: project, isLoading } = useCoilProject(projectId);

  if (isLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a proyectos
      </Button>
      
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{project?.title}</h1>
        <p className="text-muted-foreground">{project?.description}</p>
      </div>
    </div>
  );
}