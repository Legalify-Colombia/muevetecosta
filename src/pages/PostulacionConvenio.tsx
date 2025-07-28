import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Download, FileText, Upload, AlertCircle } from 'lucide-react';

interface FormData {
  // Universidad
  nombre_universidad: string;
  razon_social: string;
  nit_rut: string;
  direccion: string;
  telefono: string;
  correo_institucional: string;
  sitio_web: string;
  descripcion_universidad: string;
  
  // Responsable
  responsable_nombre: string;
  responsable_cargo: string;
  responsable_identificacion: string;
  responsable_correo: string;
  responsable_telefono: string;
  
  // Términos
  acepta_terminos: boolean;
  terminos_version_aceptados?: number;
}

const PostulacionConvenio = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nombre_universidad: '',
    razon_social: '',
    nit_rut: '',
    direccion: '',
    telefono: '',
    correo_institucional: '',
    sitio_web: '',
    descripcion_universidad: '',
    responsable_nombre: '',
    responsable_cargo: '',
    responsable_identificacion: '',
    responsable_correo: '',
    responsable_telefono: '',
    acepta_terminos: false
  });
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({});

  const { data: config } = useQuery({
    queryKey: ['convenio-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('convenio_configuracion')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: templates } = useQuery({
    queryKey: ['document-templates-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('convenio_plantillas_documentos')
        .select('*')
        .eq('es_activa', true)
        .order('tipo');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: terms } = useQuery({
    queryKey: ['convenio-terms-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('convenio_terminos_condiciones')
        .select('*')
        .eq('es_activo', true)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (terms) {
      setFormData(prev => ({ ...prev, terminos_version_aceptados: terms.version }));
    }
  }, [terms]);

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({});

  const uploadFile = async (file: File, fileName: string, templateId: string) => {
    console.log('Uploading file to template-documents bucket:', fileName);
    
    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten archivos PDF, DOC y DOCX.');
    }
    
    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('El archivo es demasiado grande. El tamaño máximo es 10MB.');
    }
    
    setUploadProgress(prev => ({ ...prev, [templateId]: 0 }));
    setUploadErrors(prev => ({ ...prev, [templateId]: '' }));
    
    const filePath = `convenios/${Date.now()}-${fileName}`;
    
    try {
      const { data, error } = await supabase.storage
        .from('template-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Error de subida: ${error.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('template-documents')
        .getPublicUrl(data.path);
      
      setUploadProgress(prev => ({ ...prev, [templateId]: 100 }));
      console.log('File uploaded successfully, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      setUploadErrors(prev => ({ ...prev, [templateId]: error.message }));
      throw error;
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting form submission...');
      
      // Crear la postulación
      const { data: convenio, error: convenioError } = await supabase
        .from('convenios_universidades')
        .insert({
          ...formData,
          ip_registro: window.location.hostname,
          user_agent: navigator.userAgent,
          metodo_creacion: 'formulario'
        })
        .select()
        .single();
      
      if (convenioError) {
        console.error('Error creating convenio:', convenioError);
        throw convenioError;
      }

      console.log('Convenio created successfully:', convenio.id);

      // Subir documentos si los hay
      for (const [templateId, file] of Object.entries(uploadedFiles)) {
        const template = templates?.find(t => t.id === templateId);
        if (template && file) {
          console.log('Uploading document for template:', template.nombre);
          
          const fileUrl = await uploadFile(file, file.name, templateId);
          
          await supabase
            .from('convenio_documentos_universidad')
            .insert({
              convenio_id: convenio.id,
              plantilla_documento_id: templateId,
              tipo_documento: template.tipo,
              archivo_url: fileUrl,
              archivo_nombre: file.name,
              archivo_tamaño: file.size
            });
        }
      }

      // Crear notificación automática
      await supabase
        .from('convenio_notificaciones')
        .insert({
          convenio_id: convenio.id,
          tipo_notificacion: 'postulacion_recibida',
          destinatario_email: formData.responsable_correo,
          asunto: `Postulación recibida - ${formData.nombre_universidad}`,
          mensaje: config?.mensaje_confirmacion || 'Su postulación ha sido recibida exitosamente.'
        });

      return convenio;
    },
    onSuccess: () => {
      toast({
        title: "¡Postulación enviada exitosamente!",
        description: config?.mensaje_confirmacion || "Su postulación ha sido recibida y será revisada pronto.",
      });
      setStep(4); // Paso de confirmación
    },
    onError: (error) => {
      console.error('Error submitting application:', error);
      toast({
        title: "Error al enviar postulación",
        description: "Por favor verifique los datos e intente nuevamente.",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = async (templateId: string, file: File | null) => {
    if (file) {
      console.log('File selected for template:', templateId, file.name);
      
      // Validación inmediata
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setUploadErrors(prev => ({ ...prev, [templateId]: 'Tipo de archivo no permitido. Solo se permiten archivos PDF, DOC y DOCX.' }));
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setUploadErrors(prev => ({ ...prev, [templateId]: 'El archivo es demasiado grande. El tamaño máximo es 10MB.' }));
        return;
      }
      
      setUploadedFiles(prev => ({ ...prev, [templateId]: file }));
      setUploadErrors(prev => ({ ...prev, [templateId]: '' }));
    } else {
      setUploadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[templateId];
        return newFiles;
      });
      setUploadProgress(prev => ({ ...prev, [templateId]: 0 }));
      setUploadErrors(prev => ({ ...prev, [templateId]: '' }));
    }
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.acepta_terminos;
      case 2:
        return formData.nombre_universidad && formData.razon_social && formData.nit_rut && 
               formData.direccion && formData.telefono && formData.correo_institucional;
      case 3:
        const obligatoryTemplates = templates?.filter(t => t.es_obligatoria) || [];
        return obligatoryTemplates.every(template => uploadedFiles[template.id]);
      default:
        return true;
    }
  };

  const getBeneficios = () => {
    if (!config?.beneficios) return [];
    return config.beneficios.split('|').filter(b => b.trim());
  };

  if (!config?.proceso_habilitado) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <CardTitle>Proceso Temporalmente Cerrado</CardTitle>
            <CardDescription>
              El proceso de postulación al convenio no está disponible en este momento.
              Por favor intente más tarde o contacte al administrador.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <CardTitle>¡Postulación Enviada Exitosamente!</CardTitle>
            <CardDescription>
              {config?.mensaje_confirmacion}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Hemos enviado una confirmación a <strong>{formData.responsable_correo}</strong>
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{config?.nombre_convenio}</h1>
          <p className="text-muted-foreground">{config?.descripcion_convenio}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${step >= stepNumber ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                `}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${step > stepNumber ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Información y Términos */}
        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bienvenido al Proceso de Postulación</CardTitle>
                <CardDescription>
                  {config?.mensaje_bienvenida}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Beneficios */}
                {getBeneficios().length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Beneficios del Convenio:</h3>
                    <ul className="space-y-2">
                      {getBeneficios().map((beneficio, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span>{beneficio.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

                {/* Documentos Disponibles */}
                {templates && templates.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Documentos Requeridos:</h3>
                    <div className="grid gap-3">
                      {templates.map((template) => (
                        <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <div className="font-medium">{template.nombre}</div>
                              {template.descripcion && (
                                <div className="text-sm text-muted-foreground">{template.descripcion}</div>
                              )}
                            </div>
                            {template.es_obligatoria && (
                              <Badge variant="destructive">Obligatorio</Badge>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(template.archivo_url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Por favor descargue, complete y firme estos documentos. Los necesitará en el siguiente paso.
                    </p>
                  </div>
                )}

                <Separator />

                {/* Términos y Condiciones */}
                {terms && (
                  <div>
                    <h3 className="font-semibold mb-3">{terms.titulo}</h3>
                    <div className="max-h-64 overflow-y-auto p-4 border rounded-lg bg-muted/50 text-sm">
                      <div className="whitespace-pre-wrap">{terms.contenido}</div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox
                        id="acepta_terminos"
                        checked={formData.acepta_terminos}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, acepta_terminos: checked as boolean })
                        }
                      />
                      <Label htmlFor="acepta_terminos" className="text-sm font-medium">
                        Acepto los términos y condiciones del convenio
                      </Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!validateStep(1)}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Datos de la Universidad y Responsable */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Datos de la Universidad</CardTitle>
                <CardDescription>
                  Complete la información institucional
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre_universidad">Nombre de la Universidad *</Label>
                    <Input
                      id="nombre_universidad"
                      value={formData.nombre_universidad}
                      onChange={(e) => setFormData({ ...formData, nombre_universidad: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="razon_social">Razón Social *</Label>
                    <Input
                      id="razon_social"
                      value={formData.razon_social}
                      onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="nit_rut">NIT/RUT *</Label>
                    <Input
                      id="nit_rut"
                      value={formData.nit_rut}
                      onChange={(e) => setFormData({ ...formData, nit_rut: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="correo_institucional">Email Institucional *</Label>
                    <Input
                      id="correo_institucional"
                      type="email"
                      value={formData.correo_institucional}
                      onChange={(e) => setFormData({ ...formData, correo_institucional: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="direccion">Dirección *</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sitio_web">Sitio Web</Label>
                    <Input
                      id="sitio_web"
                      type="url"
                      value={formData.sitio_web}
                      onChange={(e) => setFormData({ ...formData, sitio_web: e.target.value })}
                      placeholder="https://www.universidad.edu.co"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descripcion_universidad">Breve Descripción</Label>
                    <Textarea
                      id="descripcion_universidad"
                      value={formData.descripcion_universidad}
                      onChange={(e) => setFormData({ ...formData, descripcion_universidad: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Datos del Responsable</CardTitle>
                <CardDescription>
                  Información de contacto del responsable del convenio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="responsable_nombre">Nombre Completo *</Label>
                    <Input
                      id="responsable_nombre"
                      value={formData.responsable_nombre}
                      onChange={(e) => setFormData({ ...formData, responsable_nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsable_cargo">Cargo *</Label>
                    <Input
                      id="responsable_cargo"
                      value={formData.responsable_cargo}
                      onChange={(e) => setFormData({ ...formData, responsable_cargo: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="responsable_identificacion">Número de Identificación *</Label>
                    <Input
                      id="responsable_identificacion"
                      value={formData.responsable_identificacion}
                      onChange={(e) => setFormData({ ...formData, responsable_identificacion: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsable_correo">Email *</Label>
                    <Input
                      id="responsable_correo"
                      type="email"
                      value={formData.responsable_correo}
                      onChange={(e) => setFormData({ ...formData, responsable_correo: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsable_telefono">Teléfono *</Label>
                    <Input
                      id="responsable_telefono"
                      value={formData.responsable_telefono}
                      onChange={(e) => setFormData({ ...formData, responsable_telefono: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Anterior
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                disabled={!validateStep(2)}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Carga de Documentos */}
        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Carga de Documentos Firmados</CardTitle>
                <CardDescription>
                  Suba los documentos que descargó, completó y firmó en el primer paso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {templates?.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">{template.nombre}</div>
                          {template.descripcion && (
                            <div className="text-sm text-muted-foreground">{template.descripcion}</div>
                          )}
                        </div>
                        {template.es_obligatoria && (
                          <Badge variant="destructive">Obligatorio</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(template.id, e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      
                      {/* Error de validación */}
                      {uploadErrors[template.id] && (
                        <div className="flex items-center text-sm text-red-600 bg-red-50 p-2 rounded">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {uploadErrors[template.id]}
                        </div>
                      )}
                      
                      {/* Progreso de subida */}
                      {uploadProgress[template.id] > 0 && uploadProgress[template.id] < 100 && (
                        <div className="space-y-2">
                          <div className="text-sm text-blue-600">Subiendo archivo...</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${uploadProgress[template.id]}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Archivo cargado exitosamente */}
                      {uploadedFiles[template.id] && !uploadErrors[template.id] && (
                        <div className="flex items-center text-sm text-green-600 bg-green-50 p-2 rounded">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span>Archivo cargado: {uploadedFiles[template.id].name}</span>
                          <span className="ml-auto text-xs">
                            ({(uploadedFiles[template.id].size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      )}
                      
                      {/* Mensaje de obligatorio */}
                      {template.es_obligatoria && !uploadedFiles[template.id] && (
                        <div className="text-sm text-red-600">
                          Este documento es obligatorio
                        </div>
                      )}
                      
                      {/* Información de tipos permitidos */}
                      <div className="text-xs text-muted-foreground">
                        Tipos permitidos: PDF, DOC, DOCX (máx. 10MB)
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Anterior
              </Button>
              <Button 
                onClick={() => submitMutation.mutate()}
                disabled={!validateStep(3) || submitMutation.isPending}
              >
                {submitMutation.isPending ? 'Enviando...' : 'Enviar Postulación'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostulacionConvenio;
