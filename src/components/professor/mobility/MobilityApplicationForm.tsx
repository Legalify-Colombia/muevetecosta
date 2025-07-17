
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, FileText, Calendar, User, Briefcase, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MobilityOpportunity {
  id: string;
  title: string;
  hostInstitution: string;
  mobilityType: string;
}

interface MobilityApplicationFormProps {
  opportunity: MobilityOpportunity;
  onBack: () => void;
}

export default function MobilityApplicationForm({ opportunity, onBack }: MobilityApplicationFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // Personal Information (Pre-filled)
    fullName: user?.user_metadata?.full_name || '',
    documentType: 'cc',
    documentNumber: '',
    gender: '',
    birthDate: '',
    birthPlace: '',
    birthCountry: '',
    bloodType: '',
    healthInsurance: '',
    phone: '',
    email: user?.email || '',
    
    // Academic and Professional Information
    originInstitution: '',
    faculty: '',
    currentRole: '',
    expertiseArea: '',
    experienceYears: '',
    employeeCode: '',
    
    // Mobility Details
    collaborationArea: '',
    startDate: '',
    endDate: '',
    justification: '',
    workPlan: '',
    
    // Documents
    cv: null as File | null,
    invitationLetter: null as File | null,
    recommendationLetter: null as File | null,
    researchProposal: null as File | null
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Here you would implement the submission logic
    console.log('Submitting mobility application:', formData);
    // For now, just go back
    onBack();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              <h3 className="text-lg font-semibold">Información Personal</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="documentType">Tipo de Documento *</Label>
                <Select value={formData.documentType} onValueChange={(value) => handleInputChange('documentType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cc">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="ce">Cédula de Extranjería</SelectItem>
                    <SelectItem value="passport">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="documentNumber">Número de Documento *</Label>
                <Input
                  id="documentNumber"
                  value={formData.documentNumber}
                  onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gender">Sexo *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="birthPlace">Lugar de Nacimiento</Label>
                <Input
                  id="birthPlace"
                  value={formData.birthPlace}
                  onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="birthCountry">País de Nacimiento</Label>
                <Input
                  id="birthCountry"
                  value={formData.birthCountry}
                  onChange={(e) => handleInputChange('birthCountry', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bloodType">Grupo Sanguíneo</Label>
                <Select value={formData.bloodType} onValueChange={(value) => handleInputChange('bloodType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="healthInsurance">EPS</Label>
                <Input
                  id="healthInsurance"
                  value={formData.healthInsurance}
                  onChange={(e) => handleInputChange('healthInsurance', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono de Contacto *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Briefcase className="h-5 w-5 mr-2 text-green-600" />
              <h3 className="text-lg font-semibold">Información Académica y Laboral</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="originInstitution">Institución de Origen *</Label>
                <Input
                  id="originInstitution"
                  value={formData.originInstitution}
                  onChange={(e) => handleInputChange('originInstitution', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="faculty">Facultad/Departamento *</Label>
                <Input
                  id="faculty"
                  value={formData.faculty}
                  onChange={(e) => handleInputChange('faculty', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="currentRole">Rol Actual *</Label>
                <Input
                  id="currentRole"
                  placeholder="ej. Profesor Titular, Investigador Asociado"
                  value={formData.currentRole}
                  onChange={(e) => handleInputChange('currentRole', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="expertiseArea">Área de Experticia Principal *</Label>
                <Input
                  id="expertiseArea"
                  value={formData.expertiseArea}
                  onChange={(e) => handleInputChange('expertiseArea', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="experienceYears">Años de Experiencia *</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="employeeCode">Código de Empleado</Label>
                <Input
                  id="employeeCode"
                  value={formData.employeeCode}
                  onChange={(e) => handleInputChange('employeeCode', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              <h3 className="text-lg font-semibold">Detalles de la Movilidad</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Universidad de Destino</Label>
                <Input value={opportunity.hostInstitution} disabled className="bg-muted" />
              </div>
              <div className="md:col-span-2">
                <Label>Tipo de Movilidad</Label>
                <Input value={opportunity.mobilityType} disabled className="bg-muted" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="collaborationArea">Área de Colaboración/Departamento de Destino *</Label>
                <Input
                  id="collaborationArea"
                  placeholder="Especifique el área o departamento con el que desea colaborar"
                  value={formData.collaborationArea}
                  onChange={(e) => handleInputChange('collaborationArea', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="startDate">Fecha de Inicio Propuesta *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Fecha de Finalización Propuesta *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Target className="h-5 w-5 mr-2 text-orange-600" />
              <h3 className="text-lg font-semibold">Justificación y Plan de Trabajo</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="justification">Justificación y Objetivos de la Movilidad *</Label>
                <Textarea
                  id="justification"
                  placeholder="Explique sus motivos y razones para realizar la movilidad. Incluya cómo esta movilidad contribuirá a su desarrollo profesional y a las instituciones involucradas."
                  className="min-h-[120px]"
                  value={formData.justification}
                  onChange={(e) => handleInputChange('justification', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="workPlan">Plan de Trabajo Detallado *</Label>
                <Textarea
                  id="workPlan"
                  placeholder="Describa las actividades concretas que realizará durante su estancia (docencia, investigación, administrativas, etc.). Incluya los resultados esperados."
                  className="min-h-[120px]"
                  value={formData.workPlan}
                  onChange={(e) => handleInputChange('workPlan', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 mr-2 text-red-600" />
              <h3 className="text-lg font-semibold">Documentos Anexos</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="cv">Currículum Vitae (CV) * - PDF únicamente</Label>
                <Input
                  id="cv"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange('cv', e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <Label htmlFor="invitationLetter">Carta de Invitación de la Institución Anfitriona - PDF únicamente</Label>
                <Input
                  id="invitationLetter"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange('invitationLetter', e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <Label htmlFor="recommendationLetter">Carta de Aval/Recomendación de la Universidad de Origen - PDF únicamente</Label>
                <Input
                  id="recommendationLetter"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange('recommendationLetter', e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <Label htmlFor="researchProposal">Propuesta Detallada de Investigación/Docencia - PDF únicamente</Label>
                <Input
                  id="researchProposal"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange('researchProposal', e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Detalles
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Postulación de Movilidad - {opportunity.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Paso {currentStep} de {totalSteps} - Complete todos los campos requeridos (*)
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
          
          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Anterior
            </Button>
            
            {currentStep === totalSteps ? (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <Upload className="h-4 w-4 mr-2" />
                Enviar Postulación
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Siguiente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
