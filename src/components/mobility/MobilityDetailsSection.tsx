
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
  // Generate years from current year to current year + 2
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 3 }, (_, i) => currentYear + i);

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

        <div>
          <Label htmlFor="destinationProgram">Programa académico</Label>
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
          <Label>Periodo de Inicio de la Movilidad *</Label>
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            <div>
              <Label htmlFor="startYear">Año</Label>
              <Select value={formData.startPeriod?.year} onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                startPeriod: { ...prev.startPeriod, year: value }
              }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startPeriodType">Periodo</Label>
              <Select value={formData.startPeriod?.period} onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                startPeriod: { ...prev.startPeriod, period: value }
              }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
