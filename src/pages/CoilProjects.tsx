import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCoilProjects, useMyCoilApplications } from "@/hooks/useCoilProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, MapPin, Search, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import CoilProjectDetail from "@/components/coil/CoilProjectDetail";
import CoilProjectForm from "@/components/coil/CoilProjectForm";
import CoilApplicationForm from "@/components/coil/CoilApplicationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CoilProjects() {
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState<string | null>(null);

  const { data: projects = [], isLoading } = useCoilProjects();
  const { data: myApplications = [] } = useMyCoilApplications();

  const filteredProjects = projects.filter(project => 
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isCoordinator = profile?.role === 'coordinator' || profile?.role === 'admin';
  const isProfessor = profile?.role === 'professor';

  const hasAppliedToProject = (projectId: string) => {
    return myApplications.some(app => app.project_id === projectId);
  };

  if (selectedProject) {
    return (
      <CoilProjectDetail 
        projectId={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">
            Proyectos COIL
          </h1>
          <p className="text-xl text-center opacity-90 max-w-2xl mx-auto">
            Collaborative Online International Learning - Conecta con profesores de todo el mundo 
            y desarrolla proyectos educativos innovadores.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar proyectos COIL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {isCoordinator && (
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Proyecto COIL
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Proyecto COIL</DialogTitle>
                </DialogHeader>
                <CoilProjectForm onSuccess={() => setShowCreateForm(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {user ? (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">Todos los Proyectos</TabsTrigger>
              <TabsTrigger value="my-applications">Mis Postulaciones</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <ProjectsList 
                projects={filteredProjects}
                isLoading={isLoading}
                onSelectProject={setSelectedProject}
                onApplyToProject={isProfessor ? setShowApplicationForm : undefined}
                hasAppliedToProject={hasAppliedToProject}
              />
            </TabsContent>
            
            <TabsContent value="my-applications" className="space-y-4">
              <ApplicationsList applications={myApplications} />
            </TabsContent>
          </Tabs>
        ) : (
          <ProjectsList 
            projects={filteredProjects}
            isLoading={isLoading}
            onSelectProject={setSelectedProject}
          />
        )}

        {/* Application Form Dialog */}
        {showApplicationForm && (
          <Dialog open={!!showApplicationForm} onOpenChange={() => setShowApplicationForm(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Postular a Proyecto COIL</DialogTitle>
              </DialogHeader>
              <CoilApplicationForm 
                projectId={showApplicationForm}
                onSuccess={() => setShowApplicationForm(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function ProjectsList({ 
  projects, 
  isLoading, 
  onSelectProject,
  onApplyToProject,
  hasAppliedToProject
}: {
  projects: any[];
  isLoading: boolean;
  onSelectProject: (id: string) => void;
  onApplyToProject?: (id: string) => void;
  hasAppliedToProject?: (id: string) => boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-4">
          No se encontraron proyectos COIL
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <Card key={project.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="line-clamp-2">{project.title}</CardTitle>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {project.participants_count?.[0]?.count || 0}/{project.max_participants}
              </div>
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                {project.status === 'active' ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {project.description}
            </p>
            
            {project.start_date && (
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                Inicio: {format(new Date(project.start_date), 'dd MMM yyyy', { locale: es })}
              </div>
            )}
            
            {project.coordinator && (
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                {project.coordinator.full_name}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSelectProject(project.id)}
                className="flex-1"
              >
                Ver Detalles
              </Button>
              
              {onApplyToProject && (
                <Button 
                  size="sm"
                  onClick={() => onApplyToProject(project.id)}
                  disabled={hasAppliedToProject?.(project.id)}
                  className="flex-1"
                >
                  {hasAppliedToProject?.(project.id) ? 'Ya Postulaste' : 'Postular'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ApplicationsList({ applications }: { applications: any[] }) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-4">
          No tienes postulaciones a proyectos COIL
        </div>
        <p className="text-sm text-muted-foreground">
          Explora los proyectos disponibles y postula a los que te interesen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map(application => (
        <Card key={application.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{application.project?.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Postulado el {format(new Date(application.created_at), 'dd MMM yyyy', { locale: es })}
                </p>
              </div>
              <Badge 
                variant={
                  application.status === 'approved' ? 'default' :
                  application.status === 'rejected' ? 'destructive' :
                  'secondary'
                }
              >
                {application.status === 'approved' ? 'Aprobado' :
                 application.status === 'rejected' ? 'Rechazado' :
                 'Pendiente'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div>
                <h4 className="font-medium text-sm">Motivación:</h4>
                <p className="text-sm text-muted-foreground">{application.motivation}</p>
              </div>
              
              {application.experience && (
                <div>
                  <h4 className="font-medium text-sm">Experiencia:</h4>
                  <p className="text-sm text-muted-foreground">{application.experience}</p>
                </div>
              )}
              
              {application.review_notes && (
                <div>
                  <h4 className="font-medium text-sm">Comentarios del coordinador:</h4>
                  <p className="text-sm text-muted-foreground">{application.review_notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}