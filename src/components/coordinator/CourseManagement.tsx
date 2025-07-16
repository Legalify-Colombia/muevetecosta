
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Edit, Trash2, ArrowLeft, FileText, Link, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CourseManagementProps {
  program: any;
  onBack: () => void;
}

interface Course {
  id: string;
  name: string;
  code?: string;
  credits?: number;
  semester?: number;
  description?: string;
  syllabus_url?: string;
  is_active?: boolean;
  program_id: string;
  created_at: string;
  updated_at: string;
}

export const CourseManagement = ({ program, onBack }: CourseManagementProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    credits: 3,
    semester: 1,
    description: "",
    syllabus_url: "",
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['program-courses', program.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('program_id', program.id)
        .order('semester')
        .order('name');
      
      if (error) throw error;
      return data as Course[];
    },
    enabled: !!program.id
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('courses')
        .insert({
          ...data,
          program_id: program.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-courses'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Curso creado",
        description: "El curso se ha creado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el curso.",
        variant: "destructive",
      });
    }
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('courses')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-courses'] });
      setIsDialogOpen(false);
      setEditingCourse(null);
      resetForm();
      toast({
        title: "Curso actualizado",
        description: "El curso se ha actualizado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el curso.",
        variant: "destructive",
      });
    }
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-courses'] });
      toast({
        title: "Curso eliminado",
        description: "El curso se ha eliminado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el curso.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      credits: 3,
      semester: selectedSemester,
      description: "",
      syllabus_url: "",
    });
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code || "",
      credits: course.credits || 3,
      semester: course.semester || 1,
      description: course.description || "",
      syllabus_url: course.syllabus_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, data: formData });
    } else {
      createCourseMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de que desea eliminar este curso?")) {
      deleteCourseMutation.mutate(id);
    }
  };

  const getCoursesBySemester = (semester: number) => {
    return courses.filter(course => course.semester === semester);
  };

  const generateSemesterTabs = () => {
    const maxSemesters = program.duration_semesters || 10;
    const tabs = [];
    for (let i = 1; i <= maxSemesters; i++) {
      tabs.push(
        <TabsTrigger key={i} value={i.toString()}>
          Semestre {i}
        </TabsTrigger>
      );
    }
    return tabs;
  };

  const generateSemesterContent = () => {
    const maxSemesters = program.duration_semesters || 10;
    const content = [];
    for (let i = 1; i <= maxSemesters; i++) {
      const semesterCourses = getCoursesBySemester(i);
      content.push(
        <TabsContent key={i} value={i.toString()}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Cursos del Semestre {i}</h3>
              <Button
                onClick={() => {
                  setSelectedSemester(i);
                  setFormData({ ...formData, semester: i });
                  setEditingCourse(null);
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir Curso
              </Button>
            </div>
            
            {semesterCourses.length > 0 ? (
              <div className="space-y-3">
                {semesterCourses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{course.name}</h4>
                        {course.code && (
                          <Badge variant="outline">{course.code}</Badge>
                        )}
                        <Badge variant="secondary">{course.credits} créditos</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {course.syllabus_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(course.syllabus_url, '_blank')}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(course.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {course.description && (
                      <p className="text-sm text-gray-600">{course.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No hay cursos registrados para este semestre
                </p>
                <Button
                  onClick={() => {
                    setSelectedSemester(i);
                    setFormData({ ...formData, semester: i });
                    setEditingCourse(null);
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Primer Curso
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      );
    }
    return content;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Programas
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Gestión de Cursos</h2>
          <p className="text-gray-600">{program.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cursos por Semestre</CardTitle>
          <CardDescription>
            Organiza los cursos de tu programa académico por semestre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="1" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              {generateSemesterTabs()}
            </TabsList>
            {generateSemesterContent()}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
            </DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Modifica la información del curso' : 'Añade un nuevo curso al programa'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre del Curso *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Algoritmos y Estructuras de Datos"
                />
              </div>
              <div>
                <Label htmlFor="code">Código del Curso</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ej. CS101"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="credits">Créditos</Label>
                <Input
                  id="credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <Label htmlFor="semester">Semestre</Label>
                <Select
                  value={formData.semester.toString()}
                  onValueChange={(value) => setFormData({ ...formData, semester: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: program.duration_semesters || 10 }, (_, i) => i + 1).map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semestre {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Descripción del Curso</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descripción del contenido del curso"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="syllabus_url">Sílabo (URL o Enlace)</Label>
              <div className="flex space-x-2">
                <Input
                  id="syllabus_url"
                  value={formData.syllabus_url}
                  onChange={(e) => setFormData({ ...formData, syllabus_url: e.target.value })}
                  placeholder="https://ejemplo.com/silabo.pdf o enlace a página web"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Sube el sílabo del curso o proporciona un enlace web donde esté disponible
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!formData.name.trim() || createCourseMutation.isPending || updateCourseMutation.isPending}
              >
                {createCourseMutation.isPending || updateCourseMutation.isPending ? 
                  'Guardando...' : 
                  (editingCourse ? 'Actualizar' : 'Crear')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
