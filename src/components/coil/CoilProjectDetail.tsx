import { useCoilProject } from "@/hooks/useCoilProjects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Users, MapPin, Globe, BookOpen, GraduationCap, Target, Award } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CoilProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export default function CoilProjectDetail({ projectId, onBack }: CoilProjectDetailProps) {
  const { data: project, isLoading } = useCoilProject(projectId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-4"></div>
          <div className="h-12 bg-muted rounded w-full mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Proyecto no encontrado</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a proyectos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a proyectos
        </Button>
        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
          {project.status === 'active' ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>
      
      {/* Título y descripción principal */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <p className="text-lg text-muted-foreground">{project.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Información del Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.host_university_name && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Universidad Anfitriona</p>
                  <p className="text-sm text-muted-foreground">{project.host_university_name}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Users className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium">Participantes</p>
                <p className="text-sm text-muted-foreground">
                  Máximo {project.max_participants} participantes
                </p>
              </div>
            </div>

            {project.academic_level && (
              <div className="flex items-start gap-3">
                <GraduationCap className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Nivel Académico</p>
                  <p className="text-sm text-muted-foreground">
                    {project.academic_level === 'undergraduate' ? 'Pregrado' : 
                     project.academic_level === 'graduate' ? 'Posgrado' : 
                     project.academic_level}
                  </p>
                </div>
              </div>
            )}

            {project.subject_area && (
              <div className="flex items-start gap-3">
                <BookOpen className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Área de Conocimiento</p>
                  <p className="text-sm text-muted-foreground">{project.subject_area}</p>
                </div>
              </div>
            )}

            {(project.start_date || project.end_date) && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Duración</p>
                  <p className="text-sm text-muted-foreground">
                    {project.start_date && format(new Date(project.start_date), 'dd MMM yyyy', { locale: es })}
                    {project.start_date && project.end_date && ' - '}
                    {project.end_date && format(new Date(project.end_date), 'dd MMM yyyy', { locale: es })}
                    {!project.start_date && !project.end_date && 'Por definir'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Objetivos y propósito */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objetivos y Propósito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.objectives && (
              <div>
                <p className="font-medium mb-2">Objetivos</p>
                <p className="text-sm text-muted-foreground">{project.objectives}</p>
              </div>
            )}

            {project.purpose && (
              <div>
                <p className="font-medium mb-2">Propósito</p>
                <p className="text-sm text-muted-foreground">{project.purpose}</p>
              </div>
            )}

            {project.project_type && (
              <div>
                <p className="font-medium mb-2">Tipo de Proyecto</p>
                <Badge variant="outline">
                  {project.project_type === 'course' ? 'Curso' :
                   project.project_type === 'research' ? 'Investigación' :
                   project.project_type === 'workshop' ? 'Taller' :
                   project.project_type}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Beneficios y requisitos */}
      {(project.benefits || project.requirements) && (
        <div className="grid gap-6 md:grid-cols-2">
          {project.benefits && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Beneficios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{project.benefits}</p>
              </CardContent>
            </Card>
          )}

          {project.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{project.requirements}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Enlaces de reunión */}
      {project.meeting_links && Array.isArray(project.meeting_links) && project.meeting_links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Enlaces de Reunión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.meeting_links.map((link: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{link.name}</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      Acceder
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}