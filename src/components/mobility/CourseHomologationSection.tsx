
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface CourseHomologationSectionProps {
  formData: any;
  courses: any[];
  onAddCourse: () => void;
  onRemoveCourse: (index: number) => void;
  onUpdateCourse: (index: number, field: string, value: string) => void;
}

export const CourseHomologationSection = ({ 
  formData, 
  courses, 
  onAddCourse, 
  onRemoveCourse, 
  onUpdateCourse 
}: CourseHomologationSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Homologación de Cursos
          <Button type="button" onClick={onAddCourse} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Añadir Curso
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.courseEquivalences.map((equivalence: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Curso {index + 1}</h4>
              {formData.courseEquivalences.length > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => onRemoveCourse(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div>
              <Label>Curso de la Universidad Destino</Label>
              <Select 
                value={equivalence.destinationCourseId} 
                onValueChange={(value) => onUpdateCourse(index, 'destinationCourseId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso destino" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code ? `${course.code} - ` : ''}{course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Curso a Homologar (Universidad de Origen)</Label>
                <Input 
                  value={equivalence.originCourseName}
                  onChange={(e) => onUpdateCourse(index, 'originCourseName', e.target.value)}
                  placeholder="Nombre del curso en tu universidad"
                />
              </div>
              <div>
                <Label>Código del Curso de Origen (Opcional)</Label>
                <Input 
                  value={equivalence.originCourseCode}
                  onChange={(e) => onUpdateCourse(index, 'originCourseCode', e.target.value)}
                  placeholder="Código del curso (opcional)"
                />
              </div>
            </div>
          </div>
        ))}

        {formData.courseEquivalences.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay cursos agregados para homologación.</p>
            <p className="text-sm">Haz clic en "Añadir Curso" para comenzar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
