
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Globe, Search, MapPin, Users, BookOpen, FileText, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Mock data for universities
const universities = [
  {
    id: 1,
    name: "Universidad del Norte",
    city: "Barranquilla",
    coordinator: "Dr. María González",
    email: "maria.gonzalez@uninorte.edu.co",
    phone: "+57 5 350 9509",
    address: "Km 5 Vía Puerto Colombia",
    programs: ["Ingeniería de Sistemas", "Administración de Empresas", "Psicología", "Derecho"],
    description: "Universidad privada líder en el Caribe colombiano con más de 50 años de experiencia académica."
  },
  {
    id: 2,
    name: "Universidad del Atlántico",
    city: "Barranquilla",
    coordinator: "Dra. Carmen Pérez",
    email: "carmen.perez@uniatlantico.edu.co",
    phone: "+57 5 319 8500",
    address: "Carrera 30 Número 8- 49 Puerto Colombia",
    programs: ["Medicina", "Ingeniería Civil", "Licenciatura en Educación", "Biología"],
    description: "Universidad pública del departamento del Atlántico comprometida con la excelencia académica."
  },
  {
    id: 3,
    name: "Universidad de Cartagena",
    city: "Cartagena",
    coordinator: "Dr. Roberto Silva",
    email: "roberto.silva@unicartagena.edu.co",
    phone: "+57 5 669 8400",
    address: "Campus de Zaragocilla",
    programs: ["Arquitectura", "Ingeniería Química", "Medicina", "Historia"],
    description: "Institución de educación superior pública con sede en la ciudad amurallada de Cartagena."
  }
];

// Mock data for student applications
const mockApplications = [
  {
    id: "RAD-2024-001",
    university: "Universidad del Norte",
    program: "Ingeniería de Sistemas",
    status: "En Curso",
    date: "2024-01-15"
  },
  {
    id: "RAD-2024-002",
    university: "Universidad de Cartagena",
    program: "Arquitectura",
    status: "Pendiente",
    date: "2024-01-10"
  }
];

const StudentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En Curso":
        return "bg-yellow-100 text-yellow-800";
      case "Aprobado":
        return "bg-green-100 text-green-800";
      case "Pendiente":
        return "bg-blue-100 text-blue-800";
      case "Rechazado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MobiCaribe</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Dashboard Estudiante</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido a tu Dashboard!
          </h1>
          <p className="text-lg text-gray-600">
            Explora universidades y gestiona tus postulaciones de movilidad estudiantil
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Universidades Disponibles</p>
                  <p className="text-2xl font-bold text-gray-900">{universities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Mis Postulaciones</p>
                  <p className="text-2xl font-bold text-gray-900">{mockApplications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Programas Disponibles</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {universities.reduce((acc, uni) => acc + uni.programs.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Universities Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Universidades Participantes
                </CardTitle>
                <CardDescription>
                  Explora las instituciones disponibles para tu movilidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por universidad o ciudad..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredUniversities.map((university) => (
                    <Card key={university.id} className="border hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {university.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {university.city}
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {university.programs.length} programas
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {university.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-1" />
                            Coordinador: {university.coordinator}
                          </div>
                          <Link to={`/university/${university.id}`}>
                            <Button size="sm">
                              Ver Detalles
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Mis Postulaciones
                </CardTitle>
                <CardDescription>
                  Estado de tus solicitudes de movilidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mockApplications.length > 0 ? (
                  <div className="space-y-4">
                    {mockApplications.map((app) => (
                      <Card key={app.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-sm">
                              {app.id}
                            </div>
                            <Badge className={getStatusColor(app.status)} variant="secondary">
                              {app.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>{app.university}</div>
                            <div>{app.program}</div>
                            <div className="text-xs text-gray-500">{app.date}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Aún no has realizado ninguna postulación
                    </p>
                    <Button size="sm">
                      Explorar Universidades
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
