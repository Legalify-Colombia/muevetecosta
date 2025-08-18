import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface ProjectBasicInfo {
  title: string;
  host_university_name: string;
  description: string;
  objectives: string;
  purpose: string;
  academic_level: string;
  subject_area: string;
  project_type: string;
  max_participants: number;
}

interface ProjectBasicInfoFormProps {
  data: ProjectBasicInfo;
  onChange: (data: ProjectBasicInfo) => void;
}

export default function ProjectBasicInfoForm({ data, onChange }: ProjectBasicInfoFormProps) {
  const updateField = (field: keyof ProjectBasicInfo, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Básica del Proyecto</CardTitle>
        <CardDescription>
          Define los datos fundamentales de tu proyecto COIL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Proyecto *</Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Ej: Intercambio Cultural Digital"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="host_university">Universidad Gestora *</Label>
            <Input
              id="host_university"
              value={data.host_university_name}
              onChange={(e) => updateField('host_university_name', e.target.value)}
              placeholder="Nombre de la universidad principal"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción General *</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Resumen detallado del proyecto para los participantes"
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="objectives">Objetivos *</Label>
          <Textarea
            id="objectives"
            value={data.objectives}
            onChange={(e) => updateField('objectives', e.target.value)}
            placeholder="Descripción de los fines académicos y de aprendizaje"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Propósito *</Label>
          <Textarea
            id="purpose"
            value={data.purpose}
            onChange={(e) => updateField('purpose', e.target.value)}
            placeholder="La razón de ser del proyecto, su valor y justificación"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Nivel Académico</Label>
            <Select 
              value={data.academic_level} 
              onValueChange={(value) => updateField('academic_level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="undergraduate">Pregrado</SelectItem>
                <SelectItem value="graduate">Posgrado</SelectItem>
                <SelectItem value="mixed">Mixto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Proyecto</Label>
            <Select 
              value={data.project_type} 
              onValueChange={(value) => updateField('project_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de proyecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="course">Curso</SelectItem>
                <SelectItem value="research">Investigación</SelectItem>
                <SelectItem value="community_service">Servicio Comunitario</SelectItem>
                <SelectItem value="mixed">Mixto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_participants">Máx. Participantes</Label>
            <Input
              id="max_participants"
              type="number"
              min="1"
              max="100"
              value={data.max_participants}
              onChange={(e) => updateField('max_participants', parseInt(e.target.value) || 10)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject_area">Área Temática</Label>
          <Input
            id="subject_area"
            value={data.subject_area}
            onChange={(e) => updateField('subject_area', e.target.value)}
            placeholder="Ej: Ingeniería, Ciencias Sociales, Artes"
          />
        </div>
      </CardContent>
    </Card>
  );
}