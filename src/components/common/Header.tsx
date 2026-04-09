
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface HeaderProps {
  showAuthButtons?: boolean;
  showLogout?: boolean;
  userInfo?: string;
  navigationLinks?: Array<{ label: string; href: string }>;
}

const Header = ({ showAuthButtons = false, showLogout = false, userInfo, navigationLinks = [] }: HeaderProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <img 
              src="/lovable-uploads/df25e485-5dd4-485d-958a-b48ea880cc0f.png" 
              alt="Muévete por el Caribe" 
              className="h-8 md:h-10 w-auto"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/universities" className="text-gray-600 hover:text-blue-600 transition-colors">
              Universidades
            </Link>
            <Link to="/investigadores" className="text-gray-600 hover:text-blue-600 transition-colors">
              Investigadores
            </Link>
            <Link to="/coil" className="text-gray-600 hover:text-blue-600 transition-colors">
              COIL
            </Link>
            
            {navigationLinks.map((link, index) => (
              <Link 
                key={index}
                to={link.href} 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            {userInfo && (
              <span className="text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded-full">
                {userInfo}
              </span>
            )}
            
            {showAuthButtons && (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Iniciar Sesión</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Registrarme</Button>
                </Link>
              </>
            )}
            
            {showLogout && (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {userInfo && (
              <span className="text-xs text-gray-600 max-w-24 truncate">
                {userInfo}
              </span>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleMobileMenu}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-3">
              <Link 
                to="/universities" 
                className="block text-gray-600 hover:text-blue-600 py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Universidades
              </Link>
              <Link 
                to="/investigadores" 
                className="block text-gray-600 hover:text-blue-600 py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Investigadores
              </Link>
              <Link 
                to="/coil" 
                className="block text-gray-600 hover:text-blue-600 py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                COIL
              </Link>
              
              {navigationLinks.map((link, index) => (
                <Link 
                  key={index}
                  to={link.href} 
                  className="block text-gray-600 hover:text-blue-600 py-2 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {showAuthButtons && (
                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">Registrarme</Button>
                  </Link>
                </div>
              )}
              
              {showLogout && (
                <div className="pt-2 border-t border-gray-100">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
