
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, GraduationCap } from "lucide-react";
import { MyApplications } from "@/components/student/MyApplications";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

const StudentDashboard = () => {
  const { profile } = useAuth();

  const navigationLinks = [
    { label: "Universidades", href: "/universities" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <Header 
        showLogout={true}
        userInfo={`Estudiante: ${profile?.full_name}`}
        navigationLinks={navigationLinks}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Estudiante
          </h1>
          <p className="text-lg text-gray-600">
            Gestiona tu proceso de movilidad estudiantil en el Caribe colombiano
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>
                  Opciones principales para tu movilidad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/universities">
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explorar Universidades
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline" disabled>
                  <Users className="h-4 w-4 mr-2" />
                  Actualizar Perfil
                </Button>
                <Button className="w-full justify-start" variant="outline" disabled>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Ver Documentos
                </Button>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Mi Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Nombre</span>
                    <span className="font-semibold text-sm">{profile?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Documento</span>
                    <span className="font-semibold text-sm">
                      {profile?.document_type?.toUpperCase()} {profile?.document_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estado</span>
                    <span className="font-semibold text-sm">Activo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications Section */}
          <div className="lg:col-span-2">
            <MyApplications />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
