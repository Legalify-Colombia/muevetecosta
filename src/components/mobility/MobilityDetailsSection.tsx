
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
      </CardContent>
    </Card>
  );
};
