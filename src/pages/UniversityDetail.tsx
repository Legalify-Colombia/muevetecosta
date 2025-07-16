
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, ArrowLeft, MapPin, Phone, Mail, BookOpen, Users, FileText } from "lucide-react";

// Mock data (in a real app, this would come from an API)
const universityData = {
  1: {
    id: 1,
    name: "Universidad del Norte",
    city: "Barranquilla",
    coordinator: "Dr. María González",
    email: "maria.gonzalez@uninorte.edu.co",
    phone: "+57 5 350 9509",
    address: "Km 5 Vía Puerto Colombia",
    description: "Universidad privada líder en el Caribe colombiano con más de 50 años de experiencia académica. Comprometida con la excelencia educativa y la formación integral de profesionales competitivos a nivel nacional e internacional.",
    programs: [
      {
        id: 1,
        name: "Ingeniería de Sistemas",
        duration: "10 semestres",
        courses: [
          { name: "Programación I", code: "IS101" },
          { name: "Estructura de Datos", code: "IS201" },
          { name: "Base de Datos", code: "IS301" },
          { name: "Ingeniería de Software", code: "IS401" }
        ]
      },
      {
        id: 2,
        name: "Administración de Empresas",
        duration: "9 semestres",
        courses: [
          { name: "Fundamentos de Administración", code: "AE101" },
          { name: "Marketing", code: "AE201" },
          { name: "Finanzas Corporativas", code: "AE301" },
          { name: "Gestión de Talento Humano", code: "AE401" }
        ]
      },
      {
        id: 3,
        name: "Psicología",
        duration: "10 semestres",
        courses: [
          { name: "Psicología General", code: "PS101" },
          { name: "Psicología Cognitiva", code: "PS201" },
          { name: "Psicología Social", code: "PS301" },
          { name: "Psicología Clínica", code: "PS401" }
        ]
      }
    ]
  },
  2: {
    id: 2,
    name: "Universidad del Atlántico",
    city: "Barranquilla",
    coordinator: "Dra. Carmen Pérez",
    email: "carmen.perez@uniatlantico.edu.co",
    phone: "+57 5 319 8500",
    address: "Carrera 30 Número 8- 49 Puerto Colombia",
    description: "Universidad pública del departamento del Atlántico comprometida con la excelencia académica y el desarrollo regional del Caribe colombiano.",
    programs: [
      {
        id: 1,
        name: "Medicina",
        duration: "12 semestres",
        courses: [
          { name: "Anatomía", code: "MD101" },
          { name: "Fisiología", code: "MD201" },
          { name: "Patología", code: "MD301" },
          { name: "Medicina Interna", code: "MD401" }
        ]
      },
      {
        id: 2,
        name: "Ingeniería Civil",
        duration: "10 semestres",
        courses: [
          { name: "Cálculo", code: "IC101" },
          { name: "Estática", code: "IC201" },
          { name: "Materiales", code: "IC301" },
          { name: "Estructuras", code: "IC401" }
        ]
      }
    ]
  },
  3: {
    id: 3,
    name: "Universidad de Cartagena",
    city: "Cartagena",
    coordinator: "Dr. Roberto Silva",
    email: "roberto.silva@unicartagena.edu.co",
    phone: "+57 5 669 8400",
    address: "Campus de Zaragocilla",
    description: "Institución de educación superior pública con sede en la ciudad amurallada de Cartagena, formando profesionales íntegros desde 1827.",
    programs: [
      {
        id: 1,
        name: "Arquitectura",
        duration: "10 semestres",
        courses: [
          { name: "Dibujo Arquitectónico", code: "AR101" },
          { name: "Historia de la Arquitectura", code: "AR201" },
          { name: "Diseño Arquitectónico", code: "AR301" },
          { name: "Urbanismo", code: "AR401" }
        ]
      }
    ]
  }
} as const;

const UniversityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);

  // Convert string id to number and check if it exists in our data
  const universityId = Number(id);
  const university = universityData[universityId as keyof typeof universityData];

  if (!university) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Universidad no encontrada</h2>
            <p className="text-gray-600 mb-4">
              La universidad que buscas no existe o ha sido removida.
            </p>
            <Link to="/dashboard/student">
              <Button>Volver al Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApply = () => {
    navigate(`/apply/${university.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/dashboard/student" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5" />
              <Globe className="h-8 w-8" />
              <span className="text-xl font-bold">MobiCaribe</span>
            </Link>
            <Button onClick={handleApply}>
              Postular Movilidad
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* University Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {university.name}
              </h1>
              <div className="flex items-center text-lg text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                {university.city}
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {university.programs.length} programas disponibles
            </Badge>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            {university.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Programs Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Programas Académicos
                </CardTitle>
                <CardDescription>
                  Explora los programas disponibles para movilidad estudiantil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {university.programs.map((program) => (
                    <Card 
                      key={program.id} 
                      className={`border cursor-pointer transition-all ${
                        selectedProgram === program.id ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedProgram(selectedProgram === program.id ? null : program.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {program.name}
                          </h3>
                          <Badge variant="outline">
                            {program.duration}
                          </Badge>
                        </div>
                        
                        {selectedProgram === program.id && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-medium text-gray-900 mb-3">Plan de Cursos:</h4>
                            <div className="grid md:grid-cols-2 gap-2">
                              {program.courses.map((course, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span className="text-sm font-medium">{course.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {course.code}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Coordinador de Relaciones Internacionales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-2">
                    {university.coordinator}
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-600" />
                      <a href={`mailto:${university.email}`} className="hover:text-blue-600">
                        {university.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-blue-600" />
                      <a href={`tel:${university.phone}`} className="hover:text-blue-600">
                        {university.phone}
                      </a>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                      <span>{university.address}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Siguiente Paso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  ¿Interesado en esta universidad? Inicia tu proceso de postulación completando el formulario de movilidad.
                </p>
                <Button onClick={handleApply} className="w-full">
                  Postular Movilidad
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetail;
