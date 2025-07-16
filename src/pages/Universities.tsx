
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Globe, Search, MapPin, Users, BookOpen, Phone, Mail, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Universities = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select(`
          *,
          academic_programs (
            id,
            name,
            description
          )
        `)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (uni.city && uni.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando universidades...</p>
        </div>
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
              <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MobiCaribe</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Iniciar Sesión</Button>
              </Link>
              <Link to="/register">
                <Button>Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Universidades Participantes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre las instituciones que forman parte del programa 
            <span className="font-semibold text-blue-600"> "Muévete por la Costa"</span>
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md mx-auto">
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

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{universities.length}</p>
              <p className="text-sm text-gray-600">Universidades Participantes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {universities.reduce((acc, uni) => acc + (uni.academic_programs?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Programas Académicos</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(universities.filter(uni => uni.city).map(uni => uni.city)).size}
              </p>
              <p className="text-sm text-gray-600">Ciudades</p>
            </CardContent>
          </Card>
        </div>

        {/* Universities Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredUniversities.map((university) => (
            <Card key={university.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{university.name}</CardTitle>
                    {university.city && (
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {university.city}
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary">
                    {university.academic_programs?.length || 0} programas
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {university.description && (
                  <p className="text-gray-600 mb-4">{university.description}</p>
                )}

                {/* Programs */}
                {university.academic_programs && university.academic_programs.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Programas Disponibles:</h4>
                    <div className="flex flex-wrap gap-2">
                      {university.academic_programs.slice(0, 3).map((program) => (
                        <Badge key={program.id} variant="outline" className="text-xs">
                          {program.name}
                        </Badge>
                      ))}
                      {university.academic_programs.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{university.academic_programs.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {university.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <a href={`mailto:${university.email}`} className="hover:text-blue-600">
                        {university.email}
                      </a>
                    </div>
                  )}
                  {university.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {university.phone}
                    </div>
                  )}
                  {university.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <ExternalLink className="h-4 w-4 mr-2" />
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

                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    Universidad {university.coordinator_id ? 'con coordinador asignado' : 'disponible'}
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

        {filteredUniversities.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron universidades</h3>
            <p className="text-gray-600">
              Intenta con otros términos de búsqueda o explora todas las universidades disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Universities;
