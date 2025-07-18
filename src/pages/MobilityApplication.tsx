
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { PersonalInfoSection } from '@/components/mobility/PersonalInfoSection';
import { AcademicInfoSection } from '@/components/mobility/AcademicInfoSection';
import { CourseHomologationSection } from '@/components/mobility/CourseHomologationSection';
import { DocumentUploadSection } from '@/components/mobility/DocumentUploadSection';
import { MobilityDetailsSection } from '@/components/mobility/MobilityDetailsSection';
import { toast } from 'sonner';

interface FormData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    documentType: string;
    documentNumber: string;
    birthDate: string;
    nationality: string;
    address: string;
    emergencyContact: string;
    emergencyPhone: string;
  };
  academicInfo: {
    currentInstitution: string;
    faculty: string;
    program: string;
    semester: number;
    gpa: number;
    academicLevel: string;
  };
  mobilityDetails: {
    selectedProgram: string;
    preferredStartDate: string;
    duration: string;
    academicObjectives: string;
    researchInterests: string;
    languageProficiency: string;
  };
  documents: {
    academicTranscript: File | null;
    recommendationLetter: File | null;
    languageCertificate: File | null;
    motivationLetter: File | null;
    passport: File | null;
  };
  courseEquivalences: Array<{
    id: string;
    destinationCourseId: string;
    originCourseName: string;
    originCourseCode: string;
  }>;
  destinationProgramId: string;
  mobilityDestinationSemester: string;
  gender: string;
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
}

const MobilityApplication = () => {
  const { universityId, programId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      fullName: profile?.full_name || '',
      email: '',
      phone: profile?.phone || '',
      documentType: profile?.document_type || '',
      documentNumber: profile?.document_number || '',
      birthDate: '',
      nationality: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
    },
    academicInfo: {
      currentInstitution: '',
      faculty: '',
      program: '',
      semester: 1,
      gpa: 0,
      academicLevel: '',
    },
    mobilityDetails: {
      selectedProgram: programId || '',
      preferredStartDate: '',
      duration: '',
      academicObjectives: '',
      researchInterests: '',
      languageProficiency: '',
    },
    documents: {
      academicTranscript: null,
      recommendationLetter: null,
      languageCertificate: null,
      motivationLetter: null,
      passport: null,
    },
    courseEquivalences: [],
    destinationProgramId: programId || '',
    mobilityDestinationSemester: '',
    gender: '',
    birthPlace: '',
    birthCountry: '',
    bloodType: '',
    healthInsurance: '',
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
  });

  const { data: university, isLoading: universityLoading } = useQuery({
    queryKey: ['university', universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select(`
          *,
          academic_programs (*)
        `)
        .eq('id', universityId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!universityId
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', programId],
    queryFn: async () => {
      if (!programId) return [];
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('program_id', programId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!programId
  });

  const { data: program } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
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

  const handleAddCourse = () => {
    const newCourse = {
      id: Date.now().toString(),
      destinationCourseId: '',
      originCourseName: '',
      originCourseCode: '',
    };
    setFormData(prev => ({
      ...prev,
      courseEquivalences: [...prev.courseEquivalences, newCourse]
    }));
  };

  const handleRemoveCourse = (index: number) => {
    setFormData(prev => ({
      ...prev,
      courseEquivalences: prev.courseEquivalences.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateCourse = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      courseEquivalences: prev.courseEquivalences.map((course, i) =>
        i === index ? { ...course, [field]: value } : course
      )
    }));
  };

  const handleSaveDraft = async () => {
    try {
      toast.success('Borrador guardado exitosamente');
    } catch (error) {
      toast.error('Error al guardar el borrador');
    }
  };

  const handleSubmit = async () => {
    try {
      toast.success('Aplicación enviada exitosamente');
      navigate('/dashboard/student');
    } catch (error) {
      toast.error('Error al enviar la aplicación');
    }
  };

  if (universityLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header showLogout={true} userInfo={`Estudiante: ${profile?.full_name}`} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header showLogout={true} userInfo={`Estudiante: ${profile?.full_name}`} />
        <div className="flex-1 flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Universidad no encontrada</h2>
              <Button onClick={() => navigate('/universities')}>
                Volver a universidades
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showLogout={true} userInfo={`Estudiante: ${profile?.full_name}`} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/universities')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a universidades
            </Button>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Aplicación de Movilidad - {university.name}
                </CardTitle>
                {program && (
                  <p className="text-gray-600">Programa: {program.name}</p>
                )}
              </CardHeader>
            </Card>
          </div>

          <div className="space-y-6">
            <PersonalInfoSection
              formData={formData}
              setFormData={setFormData}
              userProfile={profile}
            />

            <AcademicInfoSection
              formData={formData}
              setFormData={setFormData}
            />

            <MobilityDetailsSection
              formData={formData}
              setFormData={setFormData}
              university={university}
              programs={university.academic_programs || []}
            />

            <CourseHomologationSection
              formData={formData}
              courses={courses}
              onAddCourse={handleAddCourse}
              onRemoveCourse={handleRemoveCourse}
              onUpdateCourse={handleUpdateCourse}
            />

            <DocumentUploadSection
              formData={formData}
              setFormData={setFormData}
              destinationUniversityId={universityId}
              mobilityType="student"
            />

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Borrador
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Aplicación
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MobilityApplication;
