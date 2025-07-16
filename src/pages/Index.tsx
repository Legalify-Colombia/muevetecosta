
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Globe, Award } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
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
            <div className="flex space-x-4">
              <Link to="/login">
                <Button variant="outline">Iniciar Sesión</Button>
              </Link>
              <Link to="/register">
                <Button>Registrarme</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Movilidad Estudiantil
              <span className="block text-blue-600">Costa Caribe Colombiana</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conectamos estudiantes universitarios de la región Caribe con oportunidades 
              de intercambio académico entre las mejores instituciones educativas.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Comenzar mi Movilidad
              </Button>
            </Link>
            <Link to="/universities">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explorar Universidades
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona nuestra plataforma?
            </h2>
            <p className="text-lg text-gray-600">
              Un proceso simple y transparente para tu movilidad académica
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Regístrate</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Crea tu perfil académico con información de tu universidad y programa actual
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Explora</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Descubre universidades participantes y sus programas académicos disponibles
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Postula</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Envía tu solicitud de movilidad con documentos y plan de homologación
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Conecta</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Recibe respuesta de las universidades y comienza tu intercambio académico
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            ¿Listo para comenzar tu aventura académica?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a cientos de estudiantes que ya han expandido sus horizontes académicos
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Inscribirme Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Globe className="h-6 w-6" />
              <span className="text-lg font-semibold">MobiCaribe</span>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 MobiCaribe. Facilitando la movilidad estudiantil en el Caribe Colombiano.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
