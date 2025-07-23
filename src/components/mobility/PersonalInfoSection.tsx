
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PersonalInfoSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  userProfile: any;
}

export const PersonalInfoSection = ({ formData, setFormData, userProfile }: PersonalInfoSectionProps) => {
  const countries = [
    "Colombia", "Argentina", "Brasil", "Chile", "Ecuador", "Perú", "Venezuela", "México", "España", "Estados Unidos"
  ];

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos Personales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input 
              id="fullName" 
              value={userProfile.full_name} 
              disabled 
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label htmlFor="email">Correo Electrónico *</Label>
            <Input 
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="documentType">Tipo de Documento</Label>
            <Input 
              id="documentType" 
              value={userProfile.document_type.toUpperCase()} 
              disabled 
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label htmlFor="documentNumber">Número de Documento</Label>
            <Input 
              id="documentNumber" 
              value={userProfile.document_number} 
              disabled 
              className="bg-gray-50"
            />
          </div>
        </div>

        <div>
          <Label>Sexo</Label>
          <RadioGroup 
            value={formData.gender} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
            className="flex space-x-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="masculino" id="masculino" />
              <Label htmlFor="masculino">Masculino</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="femenino" id="femenino" />
              <Label htmlFor="femenino">Femenino</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
            <Input 
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="birthPlace">Lugar de Nacimiento</Label>
            <Input 
              id="birthPlace"
              value={formData.birthPlace}
              onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
              placeholder="Ciudad, Departamento"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="birthCountry">País de Nacimiento</Label>
            <Select value={formData.birthCountry} onValueChange={(value) => setFormData(prev => ({ ...prev, birthCountry: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar país" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bloodType">Grupo Sanguíneo</Label>
            <Select value={formData.bloodType} onValueChange={(value) => setFormData(prev => ({ ...prev, bloodType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar grupo sanguíneo" />
              </SelectTrigger>
              <SelectContent>
                {bloodTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="healthInsurance">EPS</Label>
          <Input 
            id="healthInsurance"
            value={formData.healthInsurance}
            onChange={(e) => setFormData(prev => ({ ...prev, healthInsurance: e.target.value }))}
            placeholder="Nombre de la EPS"
          />
        </div>
      </CardContent>
    </Card>
  );
};
