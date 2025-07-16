
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MobilityDetailsSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  university: any;
  programs: any[];
}

export const MobilityDetailsSection = ({ formData, setFormData, university, programs }: MobilityDetailsSectionProps) => {
  const semesters = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles de la Movilidad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Universidad donde realizará la movilidad</Label>
          <Input 
            value={university.name} 
            disabled 
            className="bg-gray-50"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="destinationProgram">Programa a cursar</Label>
            <Select value={formData.destinationProgramId} onValueChange={(value) => setFormData(prev => ({ ...prev, destinationProgramId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar programa" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="mobilityDestinationSemester">Semestre a cursar</Label>
            <Select value={formData.mobilityDestinationSemester} onValueChange={(value) => setFormData(prev => ({ ...prev, mobilityDestinationSemester: value }))}>
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
      </CardContent>
    </Card>
  );
};
