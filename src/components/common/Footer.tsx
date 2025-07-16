
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Logo y descripción */}
          <div className="flex flex-col items-center md:items-start">
            <img 
              src="/lovable-uploads/df25e485-5dd4-485d-958a-b48ea880cc0f.png" 
              alt="RCI Nodo Norte" 
              className="h-12 w-auto mb-2"
            />
            <p className="text-gray-600 text-sm text-center md:text-left">
              Plataforma de movilidad estudiantil
            </p>
          </div>

          {/* Enlaces importantes */}
          <div className="flex flex-col items-center space-y-2">
            <h4 className="font-semibold text-gray-900 mb-2">Enlaces importantes</h4>
            <Link 
              to="/terms" 
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >
              Términos y Condiciones
            </Link>
            <Link 
              to="/universities" 
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >
              Universidades
            </Link>
          </div>

          {/* Información de derechos */}
          <div className="text-center md:text-right">
            <p className="text-gray-600 text-sm mb-1">
              © 2024 Derechos reservados RCI Nodo Norte
            </p>
            <p className="text-gray-500 text-xs">
              Creado por Legalify Colombia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
