
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { PersonalInfoSection } from "@/components/mobility/PersonalInfoSection";
import { AcademicInfoSection } from "@/components/mobility/AcademicInfoSection";
import { MobilityDetailsSection } from "@/components/mobility/MobilityDetailsSection";
import { CourseHomologationSection } from "@/components/mobility/CourseHomologationSection";
import { DocumentUploadSection } from "@/components/mobility/DocumentUploadSection";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function MobilityApplication() {
  const { universityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    // Personal info
    gender: "",
    birthDate: "",
    birthPlace: "",
    birthCountry: "",
    bloodType: "",
    healthInsurance: "",
    
    // Academic info (origin)
    originInstitution: "",
    originCampus: "",
    originCareer: "",
    originFaculty: "",
    studentCode: "",
    currentSemester: "",
    cumulativeGPA: "",
    academicDirector: "",
    directorPhone: "",
    directorEmail: "",
    
    // Mobility details
    destinationProgramId: "",
    mobilityDestinationSemester: "",
    
    // Course homologation
    courseEquivalences: [{ originCourseName: "", originCourseCode: "", destinationCourseId: "" }],
    
    // Documents
    cv: null as File | null,
    homologationContract: null as File | null,
    academicRecord: null as File | null
  });

  // Fetch university data
  const { data: university } = useQuery({
    queryKey: ['university', universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('id', universityId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!universityId
  });

  // Fetch user profile and student info
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (profileError) throw profileError;

      const { data: studentInfo, error: studentError } = await supabase
        .from('student_info')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();
      
      if (studentError) throw studentError;

      return { profile, studentInfo };
    },
    enabled: !!user?.id
  });

  // Fetch academic programs for the university
  const { data: programs } = useQuery({
    queryKey: ['programs', universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_programs')
        .select('*')
        .eq('university_id', universityId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
    enabled: !!universityId
  });

  // Fetch courses for selected program
  const { data: courses } = useQuery({
    queryKey: ['courses', formData.destinationProgramId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('program_id', formData.destinationProgramId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
    enabled: !!formData.destinationProgramId
  });

  // Pre-fill form with user data
  useEffect(() => {
    if (userProfile?.studentInfo) {
      setFormData(prev => ({
        ...prev,
        originInstitution: userProfile.studentInfo.origin_university || "",
        originCareer: userProfile.studentInfo.academic_program || "",
        currentSemester: userProfile.studentInfo.current_semester?.toString() || "",
        // Pre-fill other fields from studentInfo if they exist
        gender: userProfile.studentInfo.gender || "",
        birthDate: userProfile.studentInfo.birth_date || "",
        birthPlace: userProfile.studentInfo.birth_place || "",
        birthCountry: userProfile.studentInfo.birth_country || "",
        bloodType: userProfile.studentInfo.blood_type || "",
        healthInsurance: userProfile.studentInfo.health_insurance || "",
        originCampus: userProfile.studentInfo.origin_institution_campus || "",
        originFaculty: userProfile.studentInfo.origin_faculty || "",
        studentCode: userProfile.studentInfo.student_code || "",
        cumulativeGPA: userProfile.studentInfo.cumulative_gpa?.toString() || "",
        academicDirector: userProfile.studentInfo.academic_director_name || "",
        directorPhone: userProfile.studentInfo.academic_director_phone || "",
        directorEmail: userProfile.studentInfo.academic_director_email || ""
      }));
    }
  }, [userProfile]);

  const submitApplicationMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      // First, create/update student_info if it doesn't exist
      const { error: upsertError } = await supabase
        .from('student_info')
        .upsert({
          id: user?.id,
          gender: formData.gender,
          birth_date: formData.birthDate || null,
          birth_place: formData.birthPlace || null,
          birth_country: formData.birthCountry || null,
          blood_type: formData.bloodType || null,
          health_insurance: formData.healthInsurance || null,
          origin_university: formData.originInstitution,
          academic_program: formData.originCareer,
          current_semester: parseInt(formData.currentSemester) || null,
          origin_institution_campus: formData.originCampus || null,
          origin_faculty: formData.originFaculty || null,
          student_code: formData.studentCode || null,
          cumulative_gpa: parseFloat(formData.cumulativeGPA) || null,
          academic_director_name: formData.academicDirector || null,
          academic_director_phone: formData.directorPhone || null,
          academic_director_email: formData.directorEmail || null,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'id'
        });

      if (upsertError) throw upsertError;

      // Create the mobility application
      const { data: application, error: appError } = await supabase
        .from('mobility_applications')
        .insert({
          student_id: user?.id,
          destination_university_id: universityId,
          destination_program_id: formData.destinationProgramId || null,
          status: 'pending'
        })
        .select()
        .single();

      if (appError) throw appError;

      // Insert course equivalences
      const courseEquivalenceData = formData.courseEquivalences
        .filter(ce => ce.originCourseName && ce.destinationCourseId)
        .map(ce => ({
          application_id: application.id,
          origin_course_name: ce.originCourseName,
          origin_course_code: ce.originCourseCode || null,
          destination_course_id: ce.destinationCourseId
        }));

      if (courseEquivalenceData.length > 0) {
        const { error: ceError } = await supabase
          .from('course_equivalences')
          .insert(courseEquivalenceData);

        if (ceError) throw ceError;
      }

      return application;
    },
    onSuccess: (application) => {
      toast({
        title: "¡Postulación enviada exitosamente!",
        description: `Tu número de radicación es: ${application.application_number || 'Pendiente de asignación'}`,
      });
      navigate('/dashboard/student');
    },
    onError: (error: any) => {
      console.error('Error submitting application:', error);
      toast({
        title: "Error al enviar postulación",
        description: error.message || "Hubo un problema al procesar tu solicitud. Inténtalo nuevamente.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.destinationProgramId) {
      toast({
        title: "Programa requerido",
        description: "Debes seleccionar un programa académico.",
        variant: "destructive"
      });
      return;
    }

    if (formData.courseEquivalences.filter(ce => ce.originCourseName && ce.destinationCourseId).length === 0) {
      toast({
        title: "Homologación requerida",
        description: "Debes agregar al menos un curso para homologar.",
        variant: "destructive"
      });
      return;
    }

    submitApplicationMutation.mutate(formData);
  };

  const addCourseEquivalence = () => {
    setFormData(prev => ({
      ...prev,
      courseEquivalences: [...prev.courseEquivalences, { originCourseName: "", originCourseCode: "", destinationCourseId: "" }]
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
      courseEquivalences: prev.courseEquivalences.map((ce, i) => 
        i === index ? { ...ce, [field]: value } : ce
      )
    }));
  };

  if (!university || !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <Header showLogout={true} />
      
      <div className="max-w-4xl mx-auto px-4 py-8 flex-1">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Formulario de Postulación de Movilidad Estudiantil
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Universidad destino: <span className="font-semibold">{university.name}</span>
            </p>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-8">
          <PersonalInfoSection 
            formData={formData}
            setFormData={setFormData}
            userProfile={userProfile.profile}
          />

          <AcademicInfoSection 
            formData={formData}
            setFormData={setFormData}
          />

          <MobilityDetailsSection 
            formData={formData}
            setFormData={setFormData}
            university={university}
            programs={programs || []}
          />

          <CourseHomologationSection 
            formData={formData}
            courses={courses || []}
            onAddCourse={addCourseEquivalence}
            onRemoveCourse={removeCourseEquivalence}
            onUpdateCourse={updateCourseEquivalence}
          />

          <DocumentUploadSection 
            formData={formData}
            setFormData={setFormData}
            destinationUniversityId={universityId}
            mobilityType="student"
          />

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitApplicationMutation.isPending}
                >
                  {submitApplicationMutation.isPending ? "Enviando..." : "Enviar Postulación"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
      
      <Footer />
    </div>
  );
}
