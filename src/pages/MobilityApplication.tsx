
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { PersonalInfoSection } from '@/components/mobility/PersonalInfoSection';
import { AcademicInfoSection } from '@/components/mobility/AcademicInfoSection';
import { MobilityDetailsSection } from '@/components/mobility/MobilityDetailsSection';
import { DocumentUploadSection } from '@/components/mobility/DocumentUploadSection';
import { CourseHomologationSection } from '@/components/mobility/CourseHomologationSection';

interface FormData {
  gender: string;
  birthDate: string;
  birthPlace: string;
  birthCountry: string;
  bloodType: string;
  healthInsurance: string;
  originInstitution: string;
  originCampus: string;
  originCareer: string;
  originFaculty: string;
  studentCode: string;
  currentSemester: string;
  cumulativeGPA: string;
  academicDirector: string;
  directorPhone: string;
  directorEmail: string;
  destinationProgramId: string;
  mobilityDestinationSemester: string;
  courseEquivalences: Array<{
    destinationCourseId: string;
    originCourseName: string;
    originCourseCode: string;
  }>;
}

const MobilityApplication = () => {
  const { universityId, programId } = useParams<{ universityId: string; programId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    // Personal Info
    gender: '',
    birthDate: '',
    birthPlace: '',
    birthCountry: '',
    bloodType: '',
    healthInsurance: '',
    
    // Academic Info
    originInstitution: '',
    originCampus: '',
    originCareer: '',
    originFaculty: '',
    studentCode: '',
    currentSemester: '',
    cumulativeGPA: '',
    academicDirector: '',
    directorPhone: '',
    directorEmail: '',
    
    // Mobility Details
    destinationProgramId: programId || '',
    mobilityDestinationSemester: '',
    
    // Course Homologation
    courseEquivalences: []
  });

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch university details
  const { data: university, isLoading: universityLoading } = useQuery({
    queryKey: ['university', universityId],
    queryFn: async () => {
      if (!universityId) throw new Error('University ID is required');
      
      const { data, error } = await supabase
        .from('universities')
        .select(`
          *,
          academic_programs (
            id,
            name,
            description,
            duration_semesters
          ),
          courses (
            id,
            name,
            code,
            credits
          )
        `)
        .eq('id', universityId)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!universityId
  });

  // Fetch program if programId exists
  const { data: program } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      if (!programId) return null;
      
      const { data, error } = await supabase
        .from('academic_programs')
        .select('*')
        .eq('id', programId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!programId
  });

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('mobility_applications')
        .insert({
          student_id: user.id,
          destination_university_id: universityId,
          destination_program_id: programId || null,
          status: 'pending'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Aplicación enviada",
        description: "Tu aplicación de movilidad ha sido enviada exitosamente.",
      });
      navigate('/dashboard/student');
    },
    onError: (error: any) => {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la aplicación. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    }
  });

  const steps = [
    { title: 'Información Personal', component: PersonalInfoSection },
    { title: 'Información Académica', component: AcademicInfoSection },
    { title: 'Detalles de Movilidad', component: MobilityDetailsSection },
    { title: 'Documentos', component: DocumentUploadSection },
    { title: 'Homologación de Materias', component: CourseHomologationSection }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    submitApplicationMutation.mutate(formData);
  };

  const addCourseEquivalence = () => {
    setFormData(prev => ({
      ...prev,
      courseEquivalences: [
        ...prev.courseEquivalences,
        {
          destinationCourseId: '',
          originCourseName: '',
          originCourseCode: ''
        }
      ]
    }));
  };

  const removeCourseEquivalence = (index: number) => {
    setFormData(prev => ({
      ...prev,
      courseEquivalences: prev.courseEquivalences.filter((_, i) => i !== index)
    }));
  };

  const updateCourseEquivalence = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      courseEquivalences: prev.courseEquivalences.map((eq, i) => 
        i === index ? { ...eq, [field]: value } : eq
      )
    }));
  };

  if (universityLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-semibold mb-4">Universidad no encontrada</h2>
              <Button onClick={() => navigate('/universities')}>
                Volver a Universidades
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const getCurrentStepProps = () => {
    const baseProps = {
      formData,
      setFormData,
      university,
      program,
      userProfile // Always include userProfile
    };

    switch (currentStep) {
      case 0: // PersonalInfoSection - needs userProfile
        return baseProps;
      case 1: // AcademicInfoSection
        return baseProps;
      case 2: // MobilityDetailsSection
        return {
          ...baseProps,
          programs: university.academic_programs || []
        };
      case 3: // DocumentUploadSection
        return {
          ...baseProps,
          destinationUniversityId: universityId
        };
      case 4: // CourseHomologationSection
        return {
          ...baseProps,
          courses: university.courses || [],
          onAddCourse: addCourseEquivalence,
          onRemoveCourse: removeCourseEquivalence,
          onUpdateCourse: updateCourseEquivalence
        };
      default:
        return baseProps;
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  const stepProps = getCurrentStepProps();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/universities')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Universidades
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Aplicación de Movilidad Académica
            </h1>
            <p className="text-lg text-gray-600">
              {university.name}
              {program && ` - ${program.name}`}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>
              Paso {currentStep + 1} de {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent {...stepProps} />
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Anterior
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitApplicationMutation.isPending}
            >
              {submitApplicationMutation.isPending ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Aplicación
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Siguiente
            </Button>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MobilityApplication;
