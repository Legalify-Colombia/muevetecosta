
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Send, AlertCircle } from 'lucide-react';
import { PersonalInfoSection } from '@/components/mobility/PersonalInfoSection';
import { AcademicInfoSection } from '@/components/mobility/AcademicInfoSection';
import { CourseHomologationSection } from '@/components/mobility/CourseHomologationSection';
import { DocumentUploadSection } from '@/components/mobility/DocumentUploadSection';
import { MobilityDetailsSection } from '@/components/mobility/MobilityDetailsSection';
import { toast } from 'sonner';
import { useEmail } from '@/hooks/useEmail';
import { useUniversityRequiredDocuments } from '@/hooks/useUniversityRequiredDocuments';

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
  internationalOfficeEmail: string;
  email: string;
  startPeriod: { year: string; period: string };
}

const MobilityApplication = () => {
  const { universityId, programId } = useParams();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { sendApplicationConfirmation, sendNewApplicationNotification, sending: emailSending } = useEmail();
  const [submitting, setSubmitting] = useState(false);

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
    internationalOfficeEmail: '',
    email: '',
    startPeriod: { year: '', period: '' },
  });

  const { data: university, isLoading: universityLoading, error: universityError } = useQuery({
    queryKey: ['university', universityId],
    queryFn: async () => {
      if (!universityId) throw new Error('University ID is required');
      
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
      if (!programId) throw new Error('Program ID is required');
      
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

  const { data: requiredDocuments = [] } = useUniversityRequiredDocuments(universityId);

  // Filtrar documentos obligatorios para estudiantes
  const mandatoryDocuments = requiredDocuments.filter(doc => 
    doc.is_mandatory && (doc.mobility_type === 'student' || doc.mobility_type === 'both')
  );

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

  const validateRequiredDocuments = () => {
    const missingDocuments = [];
    
    for (const doc of mandatoryDocuments) {
      const docKey = `document_${doc.id}`;
      if (!formData[docKey]) {
        missingDocuments.push(doc.document_title);
      }
    }
    
    return missingDocuments;
  };

  const validateForm = () => {
    const errors = [];
    
    // Validar información personal básica obligatoria
    if (!formData.email?.trim()) errors.push('Correo electrónico');
    if (!formData.gender?.trim()) errors.push('Sexo');
    
    // Validar información académica obligatoria
    if (!formData.originInstitution?.trim()) errors.push('Institución de origen');
    if (!formData.originCareer?.trim()) errors.push('Carrera');
    if (!formData.currentSemester?.trim()) errors.push('Semestre actual');
    
    // Validar detalles de movilidad obligatorios
    if (!formData.destinationProgramId?.trim()) errors.push('Programa académico de destino');
    if (!formData.startPeriod?.year || !formData.startPeriod?.period) errors.push('Periodo de inicio de movilidad');
    
    return errors;
  };

  const handleSaveDraft = async () => {
    try {
      setSubmitting(true);
      
      // Solo actualizar información del estudiante sin crear la aplicación
      const { error: studentError } = await supabase
        .from('student_info')
        .update({
          origin_university: formData.academicInfo.currentInstitution,
          academic_program: formData.academicInfo.program,
          current_semester: formData.academicInfo.semester,
          cumulative_gpa: formData.academicInfo.gpa || null,
          origin_faculty: formData.originFaculty || null,
          student_code: formData.studentCode || null,
          academic_director_name: formData.academicDirector || null,
          academic_director_phone: formData.directorPhone || null,
          academic_director_email: formData.directorEmail || null,
          gender: formData.gender || null,
          birth_date: formData.personalInfo.birthDate || null,
          birth_place: formData.birthPlace || null,
          birth_country: formData.birthCountry || null,
          blood_type: formData.bloodType || null,
          health_insurance: formData.healthInsurance || null,
          origin_institution_campus: formData.originCampus || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (studentError) {
        console.error('Error updating student info:', studentError);
        throw new Error('Error al actualizar información del estudiante');
      }

      toast.success('Borrador guardado exitosamente');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast.error(error.message || 'Error al guardar el borrador');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Validar formulario
      const formErrors = validateForm();
      if (formErrors.length > 0) {
        toast.error(`Faltan campos obligatorios: ${formErrors.join(', ')}`);
        return;
      }
      
      // Validar documentos obligatorios
      const missingDocs = validateRequiredDocuments();
      if (missingDocs.length > 0) {
        toast.error(`Faltan documentos obligatorios: ${missingDocs.join(', ')}`);
        return;
      }

      // 1. Crear la aplicación de movilidad
      const { data: applicationData, error: applicationError } = await supabase
        .from('mobility_applications')
        .insert({
          student_id: user?.id,
          destination_university_id: universityId,
          destination_program_id: programId,
          status: 'pending'
        })
        .select()
        .single();

      if (applicationError) {
        console.error('Error creating application:', applicationError);
        throw new Error('Error al crear la aplicación');
      }

      // 2. Actualizar información del estudiante
      const { error: studentError } = await supabase
        .from('student_info')
        .update({
          origin_university: formData.academicInfo.currentInstitution,
          academic_program: formData.academicInfo.program,
          current_semester: formData.academicInfo.semester,
          cumulative_gpa: formData.academicInfo.gpa || null,
          origin_faculty: formData.originFaculty || null,
          student_code: formData.studentCode || null,
          academic_director_name: formData.academicDirector || null,
          academic_director_phone: formData.directorPhone || null,
          academic_director_email: formData.directorEmail || null,
          gender: formData.gender || null,
          birth_date: formData.personalInfo.birthDate || null,
          birth_place: formData.birthPlace || null,
          birth_country: formData.birthCountry || null,
          blood_type: formData.bloodType || null,
          health_insurance: formData.healthInsurance || null,
          origin_institution_campus: formData.originCampus || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (studentError) {
        console.error('Error updating student info:', studentError);
        // No cancelar la aplicación por esto, solo loguearlo
      }

      // 3. Guardar documentos si existen
      const documentPromises = [];
      for (const doc of requiredDocuments) {
        const docKey = `document_${doc.id}`;
        if (formData[docKey]) {
          documentPromises.push(
            supabase
              .from('application_documents')
              .insert({
                application_id: applicationData.id,
                document_type: doc.document_title,
                file_name: `${doc.document_title}_${user?.id}`,
                file_url: formData[docKey],
                file_size: null
              })
          );
        }
      }

      if (documentPromises.length > 0) {
        const results = await Promise.allSettled(documentPromises);
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Error saving document ${index}:`, result.reason);
          }
        });
      }

      // 4. Guardar equivalencias de cursos si existen
      if (formData.courseEquivalences.length > 0) {
        const courseEquivalencePromises = formData.courseEquivalences.map(course => 
          supabase
            .from('course_equivalences')
            .insert({
              application_id: applicationData.id,
              destination_course_id: course.destinationCourseId || null,
              origin_course_name: course.originCourseName,
              origin_course_code: course.originCourseCode || null
            })
        );

        const courseResults = await Promise.allSettled(courseEquivalencePromises);
        courseResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Error saving course equivalence ${index}:`, result.reason);
          }
        });
      }

      // 5. Enviar email de confirmación al estudiante
      try {
        await sendApplicationConfirmation(
          formData.personalInfo.email,
          formData.personalInfo.fullName,
          applicationData.application_number,
          university?.name || 'Universidad de destino',
          program?.name || 'Programa seleccionado',
          user?.id
        );
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // No cancelar la aplicación por error de email
      }

      // 6. Enviar notificación al coordinador si existe
      if (university?.coordinator_id) {
        try {
          // Obtener información del coordinador
          const { data: coordinatorProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', university.coordinator_id)
            .single();

          if (coordinatorProfile) {
            // Para obtener el email del coordinador, usaremos una función edge o por ahora 
            // notificaremos al correo del sistema con la información del coordinador
            await sendNewApplicationNotification(
              'notificaciones@mobicaribe.com', // Email temporal para notificaciones
              coordinatorProfile.full_name,
              formData.personalInfo.fullName,
              applicationData.application_number,
              formData.academicInfo.currentInstitution,
              program?.name || 'Programa seleccionado',
              `${window.location.origin}/dashboard/coordinator`
            );
          }
        } catch (coordinatorEmailError) {
          console.error('Error sending coordinator notification:', coordinatorEmailError);
          // No cancelar la aplicación por error de email
        }
      }

      toast.success('¡Aplicación enviada exitosamente! Recibirás una confirmación por correo electrónico.');
      navigate('/dashboard/student');
      
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Error al enviar la aplicación');
    } finally {
      setSubmitting(false);
    }
  };

  // Verificar parámetros de ruta al cargar
  useEffect(() => {
    if (!universityId || !programId) {
      toast.error('Parámetros de aplicación inválidos');
      navigate('/universities');
    }
  }, [universityId, programId, navigate]);

  if (universityLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header showLogout={true} userInfo={`Estudiante: ${profile?.full_name}`} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando información de la universidad...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (universityError || !university) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header showLogout={true} userInfo={`Estudiante: ${profile?.full_name}`} />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Error al cargar</h2>
              <p className="text-gray-600 mb-4">
                {universityError 
                  ? 'Hubo un problema al cargar la información de la universidad.' 
                  : 'Universidad no encontrada'
                }
              </p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/universities')} className="w-full">
                  Volver a universidades
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Intentar de nuevo
                </Button>
              </div>
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
              onClick={() => navigate(`/universities/${universityId}`)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a detalles de la universidad
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

            <DocumentUploadSection
              formData={formData}
              setFormData={setFormData}
              destinationUniversityId={universityId}
              mobilityType="student"
            />

            {/* Mostrar documentos faltantes si los hay */}
            {mandatoryDocuments.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-orange-800">Documentos Obligatorios</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Asegúrate de cargar todos los documentos obligatorios antes de enviar tu aplicación.
                      </p>
                      <ul className="text-sm text-orange-700 mt-2 list-disc list-inside">
                        {mandatoryDocuments.map(doc => (
                          <li key={doc.id}>{doc.document_title}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    className="flex-1"
                    disabled={submitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {submitting ? 'Guardando...' : 'Guardar Borrador'}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={submitting || emailSending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? 'Enviando...' : 'Enviar Aplicación'}
                  </Button>
                </div>
                {submitting && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Procesando aplicación...</span>
                    </div>
                  </div>
                )}
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
