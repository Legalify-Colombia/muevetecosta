
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  showAuthButtons?: boolean;
  showLogout?: boolean;
  userInfo?: string;
  navigationLinks?: Array<{ label: string; href: string }>;
}

const Header = ({ showAuthButtons = false, showLogout = false, userInfo, navigationLinks = [] }: HeaderProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/df25e485-5dd4-485d-958a-b48ea880cc0f.png" 
              alt="Muévete por la Costa" 
              className="h-10 w-auto"
            />
          </Link>
          
          <div className="flex items-center space-x-4">
            {navigationLinks.map((link, index) => (
              <Link 
                key={index}
                to={link.href} 
                className="text-gray-600 hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}
            
            {userInfo && (
              <span className="text-sm text-gray-600">{userInfo}</span>
            )}
            
            {showAuthButtons && (
              <>
                <Link to="/login">
                  <Button variant="outline">Iniciar Sesión</Button>
                </Link>
                <Link to="/register">
                  <Button>Registrarme</Button>
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
        </div>
      </div>
    </header>
  );
};

export default Header;
