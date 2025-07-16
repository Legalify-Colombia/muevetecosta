
const Footer = () => {
  return (
    <footer className="bg-white text-gray-700 py-12 px-4 sm:px-6 lg:px-8 mt-auto border-t">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <img 
              src="/lovable-uploads/df25e485-5dd4-485d-958a-b48ea880cc0f.png" 
              alt="Muévete por la Costa" 
              className="h-8 w-auto"
            />
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-600 mb-1">
              Derechos reservados RCI Nodo Norte
            </p>
            <p className="text-sm text-gray-600">
              Creado por Legalify Colombia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
