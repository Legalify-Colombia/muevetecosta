
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, Upload, FileText, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MobilityCall {
  id: string;
  title: string;
  mobility_type: string;
  application_deadline: string;
  universities?: {
    name: string;
    city: string;
  };
}

export const MobilityApplicationForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCall, setSelectedCall] = useState<string>('');
  const [formData, setFormData] = useState({
    gender: '',
    birth_date: '',
    birth_place: '',
    birth_country: '',
    blood_type: '',
    health_insurance: '',
    contact_phone: '',
    contact_email: '',
    origin_institution: '',
    faculty_department: '',
    current_role: '',
    expertise_area: '',
    years_experience: '',
    employee_code: '',
    collaboration_department: '',
    proposed_start_date: '',
    proposed_end_date: '',
    mobility_justification: '',
    work_plan: ''
  });

  // Mock data for mobility calls
  const mockCalls: MobilityCall[] = [
    {
      id: '1',
      title: 'Estancia de Investigación en Biotecnología Marina',
      mobility_type: 'Investigación',
      application_deadline: '2024-03-15',
      universities: {
        name: 'Universidad del Norte',
        city: 'Barranquilla'
      }
    }
  ];

  // Fetch available mobility calls - using mock data for now
  const { data: mobilityCalls = [] } = useQuery({
    queryKey: ['mobility-calls-available'],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query once tables are created
      return mockCalls;
    }
  });

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      // TODO: Implement actual database operations once tables are created
      console.log('Would submit application:', applicationData);
      return Promise.resolve({ id: 'mock-id' });
    },
    onSuccess: () => {
      toast({
        title: 'Postulación enviada',
        description: 'Tu postulación ha sido enviada exitosamente.'
      });
      // Reset form
      setFormData({
        gender: '',
        birth_date: '',
        birth_place: '',
        birth_country: '',
        blood_type: '',
        health_insurance: '',
        contact_phone: '',
        contact_email: '',
        origin_institution: '',
        faculty_department: '',
        current_role: '',
        expertise_area: '',
        years_experience: '',
        employee_code: '',
        collaboration_department: '',
        proposed_start_date: '',
        proposed_end_date: '',
        mobility_justification: '',
        work_plan: ''
      });
      setSelectedCall('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo enviar la postulación.',
        variant: 'destructive'
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCall) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona una convocatoria.',
        variant: 'destructive'
      });
      return;
    }

    const applicationData = {
      ...formData,
      mobility_call_id: selectedCall,
      professor_id: user?.id,
      status: 'pending'
    };

    submitApplicationMutation.mutate(applicationData);
  };

  const selectedCallData = mobilityCalls.find(call => call.id === selectedCall);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Formulario de Postulación - Movilidad Profesores
        </CardTitle>
        <CardDescription>
          Completa todos los campos para postularte a una convocatoria de movilidad
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Convocatoria Selection */}
          <div className="space-y-2">
            <Label htmlFor="mobility_call">Convocatoria *</Label>
            <Select value={selectedCall} onValueChange={setSelectedCall}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una convocatoria" />
              </SelectTrigger>
              <SelectContent>
                {mobilityCalls.map((call) => (
                  <SelectItem key={call.id} value={call.id}>
                    {call.title} - {call.universities?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCallData && (
              <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha límite: {new Date(selectedCallData.application_deadline).toLocaleDateString('es-ES')}</span>
                </div>
                <p>Tipo: {selectedCallData.mobility_type}</p>
                <p>Universidad anfitriona: {selectedCallData.universities?.name} - {selectedCallData.universities?.city}</p>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Género</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                    <SelectItem value="O">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birth_place">Lugar de Nacimiento</Label>
                <Input
                  id="birth_place"
                  value={formData.birth_place}
                  onChange={(e) => handleInputChange('birth_place', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birth_country">País de Nacimiento</Label>
                <Input
                  id="birth_country"
                  value={formData.birth_country}
                  onChange={(e) => handleInputChange('birth_country', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="blood_type">Tipo de Sangre</Label>
                <Select value={formData.blood_type} onValueChange={(value) => handleInputChange('blood_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="health_insurance">Seguro de Salud</Label>
                <Input
                  id="health_insurance"
                  value={formData.health_insurance}
                  onChange={(e) => handleInputChange('health_insurance', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Teléfono de Contacto *</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_email">Correo Electrónico *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Académica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin_institution">Institución de Origen *</Label>
                <Input
                  id="origin_institution"
                  value={formData.origin_institution}
                  onChange={(e) => handleInputChange('origin_institution', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="faculty_department">Facultad/Departamento</Label>
                <Input
                  id="faculty_department"
                  value={formData.faculty_department}
                  onChange={(e) => handleInputChange('faculty_department', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="current_role">Cargo Actual *</Label>
                <Input
                  id="current_role"
                  value={formData.current_role}
                  onChange={(e) => handleInputChange('current_role', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expertise_area">Área de Experticia</Label>
                <Input
                  id="expertise_area"
                  value={formData.expertise_area}
                  onChange={(e) => handleInputChange('expertise_area', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="years_experience">Años de Experiencia</Label>
                <Input
                  id="years_experience"
                  type="number"
                  value={formData.years_experience}
                  onChange={(e) => handleInputChange('years_experience', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employee_code">Código de Empleado</Label>
                <Input
                  id="employee_code"
                  value={formData.employee_code}
                  onChange={(e) => handleInputChange('employee_code', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Mobility Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalles de la Movilidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collaboration_department">Departamento de Colaboración</Label>
                <Input
                  id="collaboration_department"
                  value={formData.collaboration_department}
                  onChange={(e) => handleInputChange('collaboration_department', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="proposed_start_date">Fecha de Inicio Propuesta</Label>
                <Input
                  id="proposed_start_date"
                  type="date"
                  value={formData.proposed_start_date}
                  onChange={(e) => handleInputChange('proposed_start_date', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="proposed_end_date">Fecha de Fin Propuesta</Label>
                <Input
                  id="proposed_end_date"
                  type="date"
                  value={formData.proposed_end_date}
                  onChange={(e) => handleInputChange('proposed_end_date', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobility_justification">Justificación de la Movilidad *</Label>
              <Textarea
                id="mobility_justification"
                rows={4}
                value={formData.mobility_justification}
                onChange={(e) => handleInputChange('mobility_justification', e.target.value)}
                placeholder="Explica las razones y objetivos de tu movilidad..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="work_plan">Plan de Trabajo</Label>
              <Textarea
                id="work_plan"
                rows={4}
                value={formData.work_plan}
                onChange={(e) => handleInputChange('work_plan', e.target.value)}
                placeholder="Describe las actividades que planeas realizar..."
              />
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Documentos Requeridos</h3>
            <div className="grid gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  La sección de carga de documentos estará disponible próximamente
                </p>
                <p className="text-xs text-gray-500">
                  Documentos requeridos: CV, Carta de Invitación (opcional), Propuesta de Investigación/Docencia, Carta de Aval Institucional
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Guardar Borrador
            </Button>
            <Button 
              type="submit" 
              disabled={submitApplicationMutation.isPending || !selectedCall}
            >
              <Save className="h-4 w-4 mr-2" />
              {submitApplicationMutation.isPending ? 'Enviando...' : 'Enviar Postulación'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
