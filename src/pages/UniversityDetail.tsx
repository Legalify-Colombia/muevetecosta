import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, ArrowLeft, MapPin, Phone, Mail, BookOpen, Users, FileText, ExternalLink, Download } from "lucide-react";
import { useUniversity } from "@/hooks/useUniversities";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const UniversityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  console.log('UniversityDetail - ID from params:', id);
  
  const { data: university, isLoading, error } = useUniversity(id || '');

  console.log('UniversityDetail - Data state:', { university: !!university, isLoading, error, hasId: !!id });

  const handleApply = (programId?: string) => {
    if (!user) {
      toast({
        title: "Registro requerido",
        description: "Para postularte, primero debes registrarte o iniciar sesión",
      });
      navigate('/register');
      return;
    }

    // Construir la ruta correcta para la aplicación
    if (programId) {
      navigate(`/apply/${university?.id}/${programId}`);
    } else if (university?.academic_programs && university.academic_programs.length > 0) {
      // Si no se especifica programa, usar el primero disponible
      navigate(`/apply/${university.id}/${university.academic_programs[0].id}`);
    } else {
      toast({
        title: "Error",
        description: "No hay programas disponibles para esta universidad",
        variant: "destructive",
      });
    }
  };

  const getCoursesForSemester = (program: any, semester: number) => {
    return program.courses?.filter((course: any) => course.semester === semester) || [];
  };

  const getSemesterNumbers = (program: any) => {
    if (!program.courses) return [];
    const semesters = [...new Set(program.courses.map((course: any) => Number(course.semester)).filter((sem: number) => !isNaN(sem)))].sort((a: number, b: number) => a - b);
    return semesters;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información de la universidad...</p>
        </div>
      </div>
    );
  }

  if (error || !university) {
    console.log('UniversityDetail - Error state or no university:', { error, university });
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Error al cargar la universidad</h2>
            <p className="text-gray-600 mb-4">
              {error ? 'Hubo un problema al cargar la información.' : 'La universidad que buscas no existe o no está disponible.'}
            </p>
            <div className="space-y-2">
              <Link to="/universities">
                <Button className="w-full">Ver todas las universidades</Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Intentar de nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link to="/universities" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a universidades
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MobiCaribe</span>
            </div>
            <div className="flex items-center space-x-4">
              {!user ? (
                <>
                  <Link to="/login">
                    <Button variant="outline">Iniciar Sesión</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Registrarse</Button>
                  </Link>
                </>
              ) : (
                <Link to="/dashboard/student">
                  <Button variant="outline">Mi Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* University Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              {university.logo_url && (
                <img 
                  src={university.logo_url} 
                  alt={`Logo de ${university.name}`}
                  className="w-20 h-20 object-contain"
                />
              )}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {university.name}
                </h1>
                <div className="flex items-center text-lg text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  {university.city}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {university.academic_programs?.length || 0} programas disponibles
            </Badge>
          </div>
          
          {university.description && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-3">Acerca de la Universidad</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {university.description}
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Academic Programs */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <BookOpen className="h-6 w-6 mr-3" />
                  Programas Académicos para Movilidad
                </CardTitle>
                <CardDescription className="text-base">
                  Explora nuestra oferta educativa y los cursos disponibles por programa
                </CardDescription>
              </CardHeader>
              <CardContent>
                {university.academic_programs && university.academic_programs.length > 0 ? (
                  <div className="space-y-4">
                    {university.academic_programs.map((program) => (
                      <Card 
                        key={program.id} 
                        className={`border cursor-pointer transition-all ${
                          selectedProgram === program.id ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedProgram(selectedProgram === program.id ? null : program.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-xl text-gray-900">
                              {program.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-sm">
                                {program.duration_semesters} semestres
                              </Badge>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApply(program.id);
                                }}
                                size="sm"
                              >
                                Postular
                              </Button>
                            </div>
                          </div>
                          
                          {program.description && (
                            <p className="text-gray-600 mb-4">{program.description}</p>
                          )}
                          
                          {selectedProgram === program.id && program.courses && program.courses.length > 0 && (
                            <div className="mt-6 pt-6 border-t">
                              <h4 className="font-medium text-gray-900 mb-4 text-lg">Cursos por Semestre:</h4>
                              
                              <Tabs value={selectedSemester.toString()} onValueChange={(value) => setSelectedSemester(parseInt(value))}>
                                <TabsList className="grid w-full grid-cols-5 mb-4">
                                  {getSemesterNumbers(program).map((semester: number) => (
                                    <TabsTrigger key={semester} value={semester.toString()}>
                                      Sem {semester}
                                    </TabsTrigger>
                                  ))}
                                </TabsList>
                                
                                {getSemesterNumbers(program).map((semester: number) => (
                                  <TabsContent key={semester} value={semester.toString()}>
                                    <div className="space-y-3">
                                      {getCoursesForSemester(program, semester).map((course: any) => (
                                        <div key={course.id} className="bg-gray-50 rounded-lg p-4">
                                          <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                              <h5 className="font-medium text-gray-900">{course.name}</h5>
                                              {course.code && (
                                                <p className="text-sm text-gray-600">Código: {course.code}</p>
                                              )}
                                            </div>
                                            <div className="text-right">
                                              {course.credits && (
                                                <Badge variant="secondary" className="text-xs">
                                                  {course.credits} créditos
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                          
                                          {course.description && (
                                            <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                                          )}
                                          
                                          {course.syllabus_url && (
                                            <div className="flex justify-end">
                                              <a 
                                                href={course.syllabus_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
                                              >
                                                <Download className="h-4 w-4 mr-1" />
                                                Ver Sílabo
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </TabsContent>
                                ))}
                              </Tabs>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No hay programas académicos disponibles en este momento.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Coordinador de Relaciones Internacionales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-3">
                    Coordinador asignado
                  </p>
                  <div className="space-y-3 text-sm text-gray-600">
                    {university.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-blue-600" />
                        <a href={`mailto:${university.email}`} className="hover:text-blue-600">
                          {university.email}
                        </a>
                      </div>
                    )}
                    {university.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-blue-600" />
                        <a href={`tel:${university.phone}`} className="hover:text-blue-600">
                          {university.phone}
                        </a>
                      </div>
                    )}
                    {university.address && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                        <span>{university.address}</span>
                      </div>
                    )}
                    {university.website && (
                      <div className="flex items-center">
                        <ExternalLink className="h-4 w-4 mr-2 text-blue-600" />
                        <a 
                          href={university.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-blue-600"
                        >
                          Sitio web oficial
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application CTA */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <FileText className="h-5 w-5 mr-2" />
                  ¿Interesado en esta universidad?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800 mb-4">
                  Inicia tu proceso de postulación para realizar movilidad estudiantil en {university.name}.
                </p>
                <Button onClick={() => handleApply()} className="w-full" size="lg">
                  {user ? 'Postularme a esta Universidad' : 'Registrarme y Postular'}
                </Button>
                {!user && (
                  <p className="text-xs text-blue-700 mt-2 text-center">
                    Si ya tienes cuenta, <Link to="/login" className="underline hover:text-blue-800">inicia sesión</Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetail;
