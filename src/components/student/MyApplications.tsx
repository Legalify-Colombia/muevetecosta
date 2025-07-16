
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Building, BookOpen, FileText, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ApplicationDetail } from "./ApplicationDetail";

export const MyApplications = () => {
  const { user } = useAuth();
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['student-applications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobility_applications')
        .select(`
          *,
          universities(name, city),
          academic_programs(name)
        `)
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      in_review: { label: 'En Revisión', variant: 'default' as const },
      approved: { label: 'Aprobada', variant: 'default' as const },
      rejected: { label: 'Rechazada', variant: 'destructive' as const },
      completed: { label: 'Completada', variant: 'default' as const }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  const handleViewApplication = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
  };

  const handleBackToList = () => {
    setSelectedApplicationId(null);
  };

  // If viewing application detail, show that component
  if (selectedApplicationId) {
    return (
      <ApplicationDetail 
        applicationId={selectedApplicationId} 
        onBack={handleBackToList}
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Mis Postulaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Cargando postulaciones...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Mis Postulaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        {applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {application.application_number}
                      </h4>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        {new Date(application.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusBadge(application.status).variant}>
                        {getStatusBadge(application.status).label}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleViewApplication(application.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Building className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium">{application.universities?.name}</span>
                      <span className="text-muted-foreground ml-1">
                        - {application.universities?.city}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <BookOpen className="h-4 w-4 mr-2 text-green-600" />
                      <span>{application.academic_programs?.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No tienes postulaciones aún</p>
            <p className="text-sm">
              Explora las universidades disponibles y postula para iniciar tu movilidad estudiantil.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
