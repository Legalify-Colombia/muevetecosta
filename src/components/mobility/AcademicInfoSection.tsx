
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AcademicInfoSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const AcademicInfoSection = ({ formData, setFormData }: AcademicInfoSectionProps) => {
  const semesters = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Académica de Origen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="originInstitution">Institución de Educación de Origen</Label>
            <Input 
              id="originInstitution"
              value={formData.originInstitution}
              onChange={(e) => setFormData(prev => ({ ...prev, originInstitution: e.target.value }))}
              placeholder="Nombre de la universidad"
            />
          </div>
          <div>
            <Label htmlFor="originCampus">Sede</Label>
            <Input 
              id="originCampus"
              value={formData.originCampus}
              onChange={(e) => setFormData(prev => ({ ...prev, originCampus: e.target.value }))}
              placeholder="Sede de la universidad"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="originCareer">Carrera que Cursa</Label>
            <Input 
              id="originCareer"
              value={formData.originCareer}
              onChange={(e) => setFormData(prev => ({ ...prev, originCareer: e.target.value }))}
              placeholder="Nombre del programa académico"
            />
          </div>
          <div>
            <Label htmlFor="originFaculty">Facultad</Label>
            <Input 
              id="originFaculty"
              value={formData.originFaculty}
              onChange={(e) => setFormData(prev => ({ ...prev, originFaculty: e.target.value }))}
              placeholder="Facultad"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="studentCode">Código de Estudiante</Label>
            <Input 
              id="studentCode"
              value={formData.studentCode}
              onChange={(e) => setFormData(prev => ({ ...prev, studentCode: e.target.value }))}
              placeholder="Código estudiantil"
            />
          </div>
          <div>
            <Label htmlFor="currentSemester">Semestre en Curso</Label>
            <Select value={formData.currentSemester} onValueChange={(value) => setFormData(prev => ({ ...prev, currentSemester: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar semestre" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester.toString()}>{semester}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="cumulativeGPA">Promedio Acumulado</Label>
          <Input 
            id="cumulativeGPA"
            type="number"
            step="0.01"
            min="0"
            max="5"
            value={formData.cumulativeGPA}
            onChange={(e) => setFormData(prev => ({ ...prev, cumulativeGPA: e.target.value }))}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Responsable Académico o Director de Programa</h4>
          <div>
            <Label htmlFor="academicDirector">Nombre Completo</Label>
            <Input 
              id="academicDirector"
              value={formData.academicDirector}
              onChange={(e) => setFormData(prev => ({ ...prev, academicDirector: e.target.value }))}
              placeholder="Nombre del responsable académico"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="directorPhone">Teléfono</Label>
              <Input 
                id="directorPhone"
                value={formData.directorPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, directorPhone: e.target.value }))}
                placeholder="Teléfono de contacto"
              />
            </div>
            <div>
              <Label htmlFor="directorEmail">Correo Electrónico</Label>
              <Input 
                id="directorEmail"
                type="email"
                value={formData.directorEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, directorEmail: e.target.value }))}
                placeholder="correo@universidad.edu.co"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="internationalOfficeEmail">Correo Electrónico de la Oficina de Internacionalización</Label>
          <Input 
            id="internationalOfficeEmail"
            type="email"
            value={formData.internationalOfficeEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, internationalOfficeEmail: e.target.value }))}
            placeholder="internacional@universidad.edu.co (Opcional)"
          />
        </div>
      </CardContent>
    </Card>
  );
};
