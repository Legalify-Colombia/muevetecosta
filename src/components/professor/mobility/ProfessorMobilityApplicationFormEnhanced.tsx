import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Send, Upload, FileText, User, BookOpen, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload';
import { cn } from '@/lib/utils';

interface ProfessorMobilityApplicationFormEnhancedProps {
  callId: string;
  onSuccess: () => void;
}

interface UploadedDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size?: number;
}

export const ProfessorMobilityApplicationFormEnhanced = ({ 
  callId, 
  onSuccess 
}: ProfessorMobilityApplicationFormEnhancedProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadFile } = useFileUpload({ bucket: 'professor-documents', folder: 'mobility' });
  const queryClient = useQueryClient();
  
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch call details to show information
  const { data: callDetails } = useQuery({
    queryKey: ['professor-mobility-call', callId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_mobility_calls')
        .select(`
          *,
          universities(name, city)
        `)
        .eq('id', callId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!callId
  });

  // Fetch professor info to pre-populate form
  const { data: professorInfo } = useQuery({
    queryKey: ['professor-info', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('professor_info')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching professor info:', error);
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  const handleFileUpload = async (file: File, documentType: string) => {
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const fileUrl = await uploadFile(file, fileName);
      
      if (fileUrl) {
        const newDocument: UploadedDocument = {
          id: Date.now().toString(),
          document_type: documentType,
          file_name: file.name,
          file_url: fileUrl,
          file_size: file.size
        };
        
        setUploadedDocuments(prev => [...prev, newDocument]);
        toast({
          title: "Documento subido",
          description: `${file.name} se ha subido correctamente.`,
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error de carga",
        description: "No se pudo subir el documento. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      // Create the application
      const applicationData = {
        professor_id: user.id,
        destination_university_id: callDetails?.host_university_id,
        mobility_type: data.mobility_type,
        start_date: data.start_date,
        end_date: data.end_date,
        purpose: data.purpose,
        status: 'pending'
      };

      const { data: application, error } = await supabase
        .from('professor_mobility_applications')
        .insert(applicationData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating application:', error);
        throw error;
      }

      // Upload documents if any
      if (uploadedDocuments.length > 0) {
        const documentsData = uploadedDocuments.map(doc => ({
          application_id: application.id,
          document_type: doc.document_type,
          file_name: doc.file_name,
          file_url: doc.file_url,
          file_size: doc.file_size,
          uploaded_by: user.id
        }));

        const { error: docsError } = await supabase
          .from('professor_mobility_documents')
          .insert(documentsData);
        
        if (docsError) {
          console.error('Error saving documents:', docsError);
          // Don't fail the entire process if documents fail
        }
      }

      return application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-mobility-applications'] });
      toast({
        title: "Aplicación enviada",
        description: "Tu aplicación de movilidad ha sido enviada exitosamente.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la aplicación. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const data = {
      mobility_type: formData.get('mobility_type'),
      start_date: startDate?.toISOString().split('T')[0],
      end_date: endDate?.toISOString().split('T')[0],
      purpose: formData.get('purpose'),
      // Professor details
      institution: formData.get('institution'),
      faculty_department: formData.get('faculty_department'),
      academic_degree: formData.get('academic_degree'),
      research_areas: formData.get('research_areas')
    };

    if (!data.mobility_type || !data.start_date || !data.end_date || !data.purpose) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    submitApplicationMutation.mutate(data);
  };

  const requiredDocuments = [
    "CV Académico",
    "Carta de Motivación",
    "Propuesta de Actividades",
    "Respaldo Institucional"
  ];

  return (
    <div className="space-y-6">
      {/* Call Information */}
      {callDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Información de la Convocatoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Título</p>
                <p className="font-semibold">{callDetails.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Universidad Anfitriona</p>
                <p>{callDetails.universities?.name}</p>
                <p className="text-sm text-gray-600">{callDetails.universities?.city}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tipo de Movilidad</p>
                <Badge variant="outline">
                  {callDetails.mobility_type === 'teaching' ? 'Docencia' : 
                   callDetails.mobility_type === 'research' ? 'Investigación' : 'Capacitación'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha Límite</p>
                <p className="text-red-600 font-medium">
                  {new Date(callDetails.application_deadline).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            {callDetails.description && (
              <div>
                <p className="text-sm font-medium text-gray-500">Descripción</p>
                <p className="text-sm text-gray-700">{callDetails.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Información Personal</TabsTrigger>
          <TabsTrigger value="mobility">Detalles de Movilidad</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Información Personal y Académica
              </CardTitle>
              <CardDescription>
                Completa tu información personal y académica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} id="professor-application-form" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="institution">Universidad de Origen *</Label>
                    <Input
                      id="institution"
                      name="institution"
                      defaultValue={professorInfo?.university || ''}
                      placeholder="Nombre de tu universidad"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="faculty_department">Facultad/Departamento *</Label>
                    <Input
                      id="faculty_department"
                      name="faculty_department"
                      defaultValue={professorInfo?.faculty_department || ''}
                      placeholder="Ej: Facultad de Ingeniería"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="academic_degree">Grado Académico más Alto *</Label>
                    <Select name="academic_degree" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="licenciatura">Licenciatura</SelectItem>
                        <SelectItem value="especializacion">Especialización</SelectItem>
                        <SelectItem value="maestria">Maestría</SelectItem>
                        <SelectItem value="doctorado">Doctorado</SelectItem>
                        <SelectItem value="postdoctorado">Postdoctorado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="research_areas">Áreas de Investigación</Label>
                    <Input
                      id="research_areas"
                      name="research_areas"
                      defaultValue={professorInfo?.expertise_areas?.join(', ') || ''}
                      placeholder="Ej: Inteligencia Artificial, Machine Learning"
                    />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobility">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Movilidad</CardTitle>
              <CardDescription>
                Especifica los detalles de tu plan de movilidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="mobility_type">Tipo de Movilidad *</Label>
                  <Select name="mobility_type" required defaultValue={callDetails?.mobility_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teaching">Docencia</SelectItem>
                      <SelectItem value="research">Investigación</SelectItem>
                      <SelectItem value="training">Capacitación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha de Inicio *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'PPP', { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Fecha de Fin *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'PPP', { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => date < (startDate || new Date())}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label htmlFor="purpose">Propósito y Objetivos de la Movilidad *</Label>
                  <Textarea
                    id="purpose"
                    name="purpose"
                    rows={6}
                    placeholder="Describe detalladamente el propósito, objetivos y actividades que realizarás durante tu movilidad académica..."
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Documentos Requeridos
              </CardTitle>
              <CardDescription>
                Sube los documentos necesarios para tu aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {requiredDocuments.map((docType) => {
                  const uploaded = uploadedDocuments.find(doc => doc.document_type === docType);
                  
                  return (
                    <div key={docType} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium">{docType} *</Label>
                        {uploaded && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Subido
                          </Badge>
                        )}
                      </div>
                      
                      {uploaded ? (
                        <div className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-sm">{uploaded.file_name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(uploaded.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(file, docType);
                              }
                            }}
                            disabled={isUploading}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Formatos permitidos: PDF, DOC, DOCX (máx. 10MB)
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {uploadedDocuments.length > 0 && (
                <div className="text-sm text-green-600">
                  ✓ {uploadedDocuments.length} de {requiredDocuments.length} documentos subidos
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          form="professor-application-form"
          disabled={submitApplicationMutation.isPending || isUploading}
          className="min-w-[200px]"
          size="lg"
        >
          {submitApplicationMutation.isPending ? (
            'Enviando Aplicación...'
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar Aplicación
            </>
          )}
        </Button>
      </div>
    </div>
  );
};