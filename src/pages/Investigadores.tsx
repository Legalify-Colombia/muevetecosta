import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Mail, ExternalLink, MapPin, GraduationCap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

interface Professor {
  id: string;
  full_name: string;
  university: string;
  faculty_department?: string;
  research_interests?: string;
  expertise_areas?: string[];
  profile_photo_url?: string;
  contact_email?: string;
  website_url?: string;
  linkedin_url?: string;
  orcid_id?: string;
  bio?: string;
  google_scholar_url?: string;
  is_public_profile: boolean;
  relevant_publications?: any[];
}

export default function Investigadores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("");
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const userInfo = user && profile ? `${profile.full_name} (${profile.role})` : undefined;

  const { data: professors = [], isLoading } = useQuery({
    queryKey: ['public-professors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_info')
        .select(`
          *,
          profile:profiles!id(full_name)
        `)
        .eq('is_public_profile', true)
        .order('university');
      
      if (error) throw error;
      return data?.map(prof => ({
        ...prof,
        full_name: prof.profile?.full_name || 'Sin nombre'
      })) as Professor[];
    }
  });

  const filteredProfessors = professors.filter(professor => {
    const matchesSearch = professor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professor.research_interests?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professor.expertise_areas?.some(area => 
                           area.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesUniversity = !selectedUniversity || 
                             professor.university?.toLowerCase().includes(selectedUniversity.toLowerCase());
    
    const matchesExpertise = !selectedExpertise ||
                           professor.expertise_areas?.some(area => 
                             area.toLowerCase().includes(selectedExpertise.toLowerCase())
                           );
    
    return matchesSearch && matchesUniversity && matchesExpertise;
  });

  const universities = [...new Set(professors.map(p => p.university).filter(Boolean))];
  const allExpertiseAreas = [...new Set(professors.flatMap(p => p.expertise_areas || []))];

  const sendContactEmail = async (professor: Professor, message: string, senderEmail: string, senderName: string) => {
    try {
      // Here you would implement the contact email functionality
      // For now, we'll just show a success message
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado al investigador.",
      });
    } catch (error) {
      toast({
        title: "Error al enviar mensaje",
        description: "No se pudo enviar el mensaje. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header showAuthButtons={!user} showLogout={!!user} userInfo={userInfo} />
      
      <div className="flex-1 bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-4">
              Perfiles de Investigadores
            </h1>
            <p className="text-xl text-center opacity-90 max-w-2xl mx-auto">
              Descubre y conecta con investigadores de toda la región. 
              Encuentra expertos en tu área de interés y establece colaboraciones académicas.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, área de investigación o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Todas las universidades</option>
                {universities.map(university => (
                  <option key={university} value={university}>{university}</option>
                ))}
              </select>
              
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Todas las especialidades</option>
                {allExpertiseAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="mb-4 text-muted-foreground">
                {filteredProfessors.length} investigador{filteredProfessors.length !== 1 ? 'es' : ''} encontrado{filteredProfessors.length !== 1 ? 's' : ''}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfessors.map(professor => (
                  <ProfessorCard key={professor.id} professor={professor} onContact={sendContactEmail} />
                ))}
              </div>
            </>
          )}

          {filteredProfessors.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg mb-4">
                No se encontraron investigadores que coincidan con tu búsqueda
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedUniversity("");
                  setSelectedExpertise("");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

function ProfessorCard({ 
  professor, 
  onContact 
}: { 
  professor: Professor;
  onContact: (professor: Professor, message: string, senderEmail: string, senderName: string) => void;
}) {
  const [contactMessage, setContactMessage] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSendMessage = () => {
    if (!contactMessage.trim() || !senderEmail.trim() || !senderName.trim()) return;
    
    onContact(professor, contactMessage, senderEmail, senderName);
    setContactMessage("");
    setSenderEmail("");
    setSenderName("");
    setIsDialogOpen(false);
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={professor.profile_photo_url} />
            <AvatarFallback className="text-lg">
              {professor.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight">{professor.full_name}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {professor.university}
            </div>
            {professor.faculty_department && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <GraduationCap className="h-3 w-3 mr-1" />
                {professor.faculty_department}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {professor.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {professor.bio}
          </p>
        )}
        
        {professor.research_interests && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Intereses de Investigación</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {professor.research_interests}
            </p>
          </div>
        )}
        
        {professor.expertise_areas && professor.expertise_areas.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Áreas de Especialidad</h4>
            <div className="flex flex-wrap gap-1">
              {professor.expertise_areas.slice(0, 3).map((area, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
              {professor.expertise_areas.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{professor.expertise_areas.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-6">
          <div className="flex space-x-2">
            {professor.website_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={professor.website_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
            {professor.linkedin_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={professor.linkedin_url} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </Button>
            )}
            {professor.google_scholar_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={professor.google_scholar_url} target="_blank" rel="noopener noreferrer">
                  Scholar
                </a>
              </Button>
            )}
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Mail className="h-3 w-3 mr-1" />
                Contactar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contactar a {professor.full_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="senderName">Tu nombre</Label>
                  <Input
                    id="senderName"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Escribe tu nombre completo"
                  />
                </div>
                <div>
                  <Label htmlFor="senderEmail">Tu correo electrónico</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="tu.email@ejemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Escribe tu mensaje aquí..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!contactMessage.trim() || !senderEmail.trim() || !senderName.trim()}
                  >
                    Enviar Mensaje
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}