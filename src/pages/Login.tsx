
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Github, Twitter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log('Login useEffect - user:', user?.id, 'profile:', profile?.role, 'authLoading:', authLoading);
    
    if (!authLoading && user && profile) {
      console.log('Redirecting user with role:', profile.role);
      
      // Redirect based on user role
      switch (profile.role) {
        case "student":
          console.log('Redirecting to student dashboard');
          navigate("/dashboard/student", { replace: true });
          break;
        case "coordinator":
          console.log('Redirecting to coordinator dashboard');
          navigate("/dashboard/coordinator", { replace: true });
          break;
        case "admin":
          console.log('Redirecting to admin dashboard');
          navigate("/dashboard/admin", { replace: true });
          break;
        case "professor":
          console.log('Redirecting to professor dashboard');
          navigate("/dashboard/professor", { replace: true });
          break;
        default:
          console.log('Unknown role, redirecting to home:', profile.role);
          navigate("/", { replace: true });
      }
    }
  }, [user, profile, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Error",
          description: error.message || "Error al iniciar sesión",
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente",
        });
        // La redirección se manejará en el useEffect cuando se actualice el profile
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      toast({
        title: "Error",
        description: "Error inesperado al iniciar sesión",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  // Si ya está autenticado y cargando, mostrar loading
  if (!authLoading && user && profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted items-center justify-center p-12">
        <div className="max-w-md text-center">
          <img 
            src="/lovable-uploads/df25e485-5dd4-485d-958a-b48ea880cc0f.png" 
            alt="Muévete por la Costa" 
            className="h-16 w-auto mx-auto mb-8"
          />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Bienvenido a MobiCaribe
          </h2>
          <p className="text-muted-foreground">
            Plataforma de movilidad estudiantil para las universidades del Caribe colombiano
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src="/lovable-uploads/df25e485-5dd4-485d-958a-b48ea880cc0f.png" 
              alt="Muévete por la Costa" 
              className="h-12 w-auto mx-auto"
            />
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Login</h1>
            <p className="text-muted-foreground mt-2">
              Accede a tu cuenta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@doe.com"
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  required
                  className="h-12 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90" 
              disabled={loading || authLoading}
            >
              {loading ? "Iniciando sesión..." : "Log in"}
            </Button>
          </form>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full h-12" disabled>
              <Github className="h-4 w-4 mr-2" />
              Github
            </Button>
            <Button variant="outline" className="w-full h-12" disabled>
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
          </div>

          <div className="text-center space-y-2">
            <Link 
              to="/register" 
              className="text-primary hover:underline text-sm"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
